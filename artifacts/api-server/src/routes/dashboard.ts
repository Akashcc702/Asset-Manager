import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import {
  db,
  paymentRequestsTable,
  agentActionLogsTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      paid: sql<number>`count(*) filter (where ${paymentRequestsTable.status} = 'paid')::int`,
      pending: sql<number>`count(*) filter (where ${paymentRequestsTable.status} = 'pending')::int`,
    })
    .from(paymentRequestsTable);

  // Group paid totals by currency. We deliberately do NOT sum across currencies
  // (no FX conversion layer exists), so the dashboard reports per-currency totals.
  const byCurrencyRows = await db
    .select({
      currency: paymentRequestsTable.currency,
      totalMinor: sql<number>`coalesce(sum(${paymentRequestsTable.amount}), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(paymentRequestsTable)
    .where(sql`${paymentRequestsTable.status} = 'paid'`)
    .groupBy(paymentRequestsTable.currency)
    .orderBy(desc(sql`count(*)`));

  const recentPayments = await db
    .select()
    .from(paymentRequestsTable)
    .orderBy(desc(paymentRequestsTable.createdAt))
    .limit(12);

  const recentActivity = await db
    .select()
    .from(agentActionLogsTable)
    .orderBy(desc(agentActionLogsTable.createdAt))
    .limit(10);

  res.json({
    totalRequests: counts?.total ?? 0,
    paidRequests: counts?.paid ?? 0,
    pendingRequests: counts?.pending ?? 0,
    totalsByCurrency: byCurrencyRows,
    recentPayments,
    recentActivity,
  });
});

export default router;
