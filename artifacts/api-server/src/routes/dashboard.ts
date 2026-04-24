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
      collected: sql<number>`coalesce(sum(${paymentRequestsTable.amount}) filter (where ${paymentRequestsTable.status} = 'paid'), 0)::int`,
    })
    .from(paymentRequestsTable);

  const recentPayments = await db
    .select()
    .from(paymentRequestsTable)
    .orderBy(desc(paymentRequestsTable.createdAt))
    .limit(5);

  const recentActivity = await db
    .select()
    .from(agentActionLogsTable)
    .orderBy(desc(agentActionLogsTable.createdAt))
    .limit(10);

  res.json({
    totalRequests: counts?.total ?? 0,
    paidRequests: counts?.paid ?? 0,
    pendingRequests: counts?.pending ?? 0,
    totalCollectedMinor: counts?.collected ?? 0,
    recentPayments,
    recentActivity,
  });
});

export default router;
