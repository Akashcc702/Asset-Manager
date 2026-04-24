import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  paymentRequestsTable,
  agentActionLogsTable,
  PAYMENT_STATUSES,
  DELIVERY_ACTIONS,
  type PaymentRequest,
} from "@workspace/db";
import { getLocusClient, describePostPaymentAction } from "../services/locusAdapter";
import { logAction } from "../services/activityLogger";

const router: IRouter = Router();

const ALLOWED_CURRENCIES = new Set(["INR", "USD", "EUR", "GBP"]);

interface CreatePaymentBody {
  title?: unknown;
  amount?: unknown;
  currency?: unknown;
  note?: unknown;
  deliveryAction?: unknown;
  rawPrompt?: unknown;
}

router.get("/payments", async (req, res) => {
  const status =
    typeof req.query["status"] === "string" ? req.query["status"] : undefined;
  const where =
    status && PAYMENT_STATUSES.includes(status as never)
      ? eq(paymentRequestsTable.status, status)
      : undefined;
  const rows = await db
    .select()
    .from(paymentRequestsTable)
    .where(where ? and(where) : undefined)
    .orderBy(desc(paymentRequestsTable.createdAt))
    .limit(200);
  res.json(rows);
});

router.post("/payments", async (req, res) => {
  const body = (req.body ?? {}) as CreatePaymentBody;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const amount =
    typeof body.amount === "number"
      ? Math.floor(body.amount)
      : Number.parseInt(String(body.amount ?? ""), 10);
  const currency =
    typeof body.currency === "string" ? body.currency.toUpperCase() : "INR";
  const note = typeof body.note === "string" ? body.note : null;
  const rawPrompt =
    typeof body.rawPrompt === "string" ? body.rawPrompt : null;
  const deliveryAction =
    typeof body.deliveryAction === "string" ? body.deliveryAction : "none";

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  if (!amount || Number.isNaN(amount) || amount < 1) {
    res.status(400).json({ error: "amount must be a positive integer" });
    return;
  }
  if (!ALLOWED_CURRENCIES.has(currency)) {
    res.status(400).json({ error: `unsupported currency: ${currency}` });
    return;
  }
  if (!DELIVERY_ACTIONS.includes(deliveryAction as never)) {
    res
      .status(400)
      .json({ error: `unsupported deliveryAction: ${deliveryAction}` });
    return;
  }

  const locus = getLocusClient();
  const created = await locus.createPayment({
    title,
    amount,
    currency,
    note,
    metadata: { deliveryAction, rawPrompt },
  });

  const [row] = await db
    .insert(paymentRequestsTable)
    .values({
      paymentId: created.paymentId,
      title,
      amount,
      currency,
      note,
      rawPrompt,
      deliveryAction,
      status: "pending",
      paymentUrl: created.paymentUrl,
    })
    .returning();

  if (!row) {
    res.status(500).json({ error: "failed to create payment request" });
    return;
  }

  await logAction({
    paymentRequestId: row.id,
    actionType: "payment_request_created",
    actionSummary: `Created ${currency} ${amount} payment "${title}"`,
    actionPayload: { provider: created.provider, paymentId: created.paymentId },
  });

  await logAction({
    paymentRequestId: row.id,
    actionType: "payment_link_generated",
    actionSummary: `CheckoutWithLocus link generated (${locus.mode} mode)`,
    actionPayload: { paymentUrl: created.paymentUrl },
  });

  res.status(201).json(row);
});

router.get("/payments/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id ?? "", 10);
  if (!id || Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const row = await loadPaymentWithLogs(id);
  if (!row) {
    res.status(404).json({ error: "payment not found" });
    return;
  }
  res.json(row);
});

router.post("/payments/:id/simulate-success", async (req, res) => {
  const id = Number.parseInt(req.params.id ?? "", 10);
  if (!id || Number.isNaN(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }

  const [existing] = await db
    .select()
    .from(paymentRequestsTable)
    .where(eq(paymentRequestsTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "payment not found" });
    return;
  }

  if (existing.status !== "paid") {
    await db
      .update(paymentRequestsTable)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(paymentRequestsTable.id, id));

    await logAction({
      paymentRequestId: id,
      actionType: "payment_simulated_success",
      actionSummary: "Simulated successful CheckoutWithLocus webhook",
    });

    await logAction({
      paymentRequestId: id,
      actionType: "payment_succeeded",
      actionSummary: `Payment of ${existing.currency} ${existing.amount} marked paid`,
    });

    const post = describePostPaymentAction(existing.deliveryAction);
    await logAction({
      paymentRequestId: id,
      actionType: post.actionType,
      actionSummary: post.summary,
      actionPayload: { deliveryAction: existing.deliveryAction },
    });
  }

  const updated = await loadPaymentWithLogs(id);
  res.json(updated);
});

async function loadPaymentWithLogs(id: number) {
  const [row] = await db
    .select()
    .from(paymentRequestsTable)
    .where(eq(paymentRequestsTable.id, id))
    .limit(1);
  if (!row) return null;
  const logs = await db
    .select()
    .from(agentActionLogsTable)
    .where(eq(agentActionLogsTable.paymentRequestId, id))
    .orderBy(desc(agentActionLogsTable.createdAt));
  return { ...(row as PaymentRequest), logs };
}

// suppress unused import warning if sql becomes unused after edits
void sql;

export default router;
