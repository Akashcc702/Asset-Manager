import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentRequestsTable = pgTable(
  "payment_requests",
  {
    id: serial("id").primaryKey(),
    paymentId: text("payment_id").notNull().unique(),
    title: text("title").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    rawPrompt: text("raw_prompt"),
    note: text("note"),
    deliveryAction: text("delivery_action").notNull().default("none"),
    status: text("status").notNull().default("pending"),
    paymentUrl: text("payment_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payment_requests_status_idx").on(table.status),
    index("payment_requests_created_at_idx").on(table.createdAt),
  ],
);

export const insertPaymentRequestSchema = createInsertSchema(
  paymentRequestsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPaymentRequestSchema = createSelectSchema(
  paymentRequestsTable,
);

export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type PaymentRequest = typeof paymentRequestsTable.$inferSelect;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_ACTIONS = [
  "none",
  "send_file_after_payment",
  "release_download",
  "mark_milestone_complete",
  "release_source_code",
  "send_invoice_receipt",
] as const;
export type DeliveryAction = (typeof DELIVERY_ACTIONS)[number];
