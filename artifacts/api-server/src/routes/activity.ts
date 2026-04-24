import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, agentActionLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/activity", async (req, res) => {
  const paymentIdRaw = req.query["paymentId"];
  const limitRaw = req.query["limit"];
  const paymentId =
    typeof paymentIdRaw === "string"
      ? Number.parseInt(paymentIdRaw, 10)
      : undefined;
  const limit = Math.min(
    typeof limitRaw === "string" ? Number.parseInt(limitRaw, 10) || 50 : 50,
    200,
  );

  const where =
    paymentId && !Number.isNaN(paymentId)
      ? eq(agentActionLogsTable.paymentRequestId, paymentId)
      : undefined;

  const rows = await db
    .select()
    .from(agentActionLogsTable)
    .where(where)
    .orderBy(desc(agentActionLogsTable.createdAt))
    .limit(limit);

  res.json(rows);
});

export default router;
