import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { paymentRequestsTable } from "./paymentRequests";

export const agentActionLogsTable = pgTable(
  "agent_action_logs",
  {
    id: serial("id").primaryKey(),
    paymentRequestId: integer("payment_request_id").references(
      () => paymentRequestsTable.id,
      { onDelete: "set null" },
    ),
    actionType: text("action_type").notNull(),
    actionSummary: text("action_summary").notNull(),
    actionPayload: jsonb("action_payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("agent_action_logs_payment_request_id_idx").on(
      table.paymentRequestId,
    ),
    index("agent_action_logs_created_at_idx").on(table.createdAt),
  ],
);

export const insertAgentActionLogSchema = createInsertSchema(
  agentActionLogsTable,
).omit({ id: true, createdAt: true });

export const selectAgentActionLogSchema =
  createSelectSchema(agentActionLogsTable);

export type InsertAgentActionLog = z.infer<typeof insertAgentActionLogSchema>;
export type AgentActionLog = typeof agentActionLogsTable.$inferSelect;

export const ACTION_TYPES = [
  "intent_parsed",
  "payment_request_created",
  "payment_link_generated",
  "payment_simulated_success",
  "payment_succeeded",
  "post_payment_action_executed",
  "payment_failed",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];
