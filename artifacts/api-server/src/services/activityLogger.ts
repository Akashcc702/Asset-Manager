import { db, agentActionLogsTable, type AgentActionLog } from "@workspace/db";

export interface LogActionInput {
  paymentRequestId?: number | null;
  actionType: string;
  actionSummary: string;
  actionPayload?: unknown;
}

export async function logAction(
  input: LogActionInput,
): Promise<AgentActionLog> {
  const [row] = await db
    .insert(agentActionLogsTable)
    .values({
      paymentRequestId: input.paymentRequestId ?? null,
      actionType: input.actionType,
      actionSummary: input.actionSummary,
      actionPayload: (input.actionPayload ?? null) as never,
    })
    .returning();
  if (!row) {
    throw new Error("Failed to insert agent action log");
  }
  return row;
}
