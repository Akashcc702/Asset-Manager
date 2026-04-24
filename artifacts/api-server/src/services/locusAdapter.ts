/**
 * Locus / CheckoutWithLocus adapter.
 *
 * This service is the ONLY place that talks to the payment provider.
 * Switch implementations with the LOCUS_MODE environment variable:
 *
 *   LOCUS_MODE=mock  (default) — generates fake payment ids and links,
 *                                persists state locally, lets the demo
 *                                simulate a webhook with a single click.
 *   LOCUS_MODE=real             — calls the real CheckoutWithLocus API.
 *                                Wire the HTTP calls in RealLocusClient
 *                                where the // TODO markers live.
 *
 * Keeping the seam clean means the React UI and the rest of the backend
 * never need to know which mode is active.
 */

import { randomBytes } from "node:crypto";

export interface CreatePaymentInput {
  title: string;
  amount: number;
  currency: string;
  note?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResult {
  paymentId: string;
  paymentUrl: string;
  status: "pending";
  provider: "locus_mock" | "locus_real";
}

export interface PaymentStatusResult {
  paymentId: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  provider: "locus_mock" | "locus_real";
}

export interface VerifyWebhookInput {
  signature?: string | null;
  body: unknown;
}

export interface LocusClient {
  readonly mode: "mock" | "real";
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<boolean>;
}

class MockLocusClient implements LocusClient {
  readonly mode = "mock" as const;

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const paymentId = `loc_mock_${randomBytes(6).toString("hex")}`;
    const baseUrl = process.env["PUBLIC_BASE_URL"] ?? "https://pay.locus.mock";
    const paymentUrl = `${baseUrl.replace(/\/$/, "")}/checkout/${paymentId}`;
    return {
      paymentId,
      paymentUrl,
      status: "pending",
      provider: "locus_mock",
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    // In mock mode, the source of truth is our DB. The route handler updates
    // status when the user simulates a webhook; this method just echoes back
    // a default for completeness.
    return {
      paymentId,
      status: "pending",
      provider: "locus_mock",
    };
  }

  async verifyWebhook(_input: VerifyWebhookInput): Promise<boolean> {
    return true;
  }
}

class RealLocusClient implements LocusClient {
  readonly mode = "real" as const;

  async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // TODO: Replace with a real CheckoutWithLocus API call.
    // Example shape (pseudo):
    //   const res = await fetch(`${LOCUS_API_BASE}/checkout/sessions`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${process.env.LOCUS_API_KEY}`,
    //     },
    //     body: JSON.stringify({ amount, currency, ... }),
    //   });
    //   const data = await res.json();
    //   return { paymentId: data.id, paymentUrl: data.url, status: "pending", provider: "locus_real" };
    throw new Error(
      "RealLocusClient.createPayment is not implemented. Set LOCUS_MODE=mock or wire the real CheckoutWithLocus API.",
    );
  }

  async getPaymentStatus(
    _paymentId: string,
  ): Promise<PaymentStatusResult> {
    // TODO: Call CheckoutWithLocus payment status endpoint.
    throw new Error(
      "RealLocusClient.getPaymentStatus is not implemented. Set LOCUS_MODE=mock or wire the real CheckoutWithLocus API.",
    );
  }

  async verifyWebhook(_input: VerifyWebhookInput): Promise<boolean> {
    // TODO: Verify the CheckoutWithLocus webhook signature with the shared secret.
    throw new Error(
      "RealLocusClient.verifyWebhook is not implemented. Set LOCUS_MODE=mock or wire the real CheckoutWithLocus API.",
    );
  }
}

let client: LocusClient | null = null;

export function getLocusClient(): LocusClient {
  if (client) return client;
  const mode = (process.env["LOCUS_MODE"] ?? "mock").toLowerCase();
  client = mode === "real" ? new RealLocusClient() : new MockLocusClient();
  return client;
}

/**
 * Maps a delivery_action onto the post-payment side effect that the agent
 * should perform once the payment is confirmed. The actual side effect is
 * mocked for the demo — extend each branch with real behavior (sending
 * files, marking milestones, generating invoices, etc.) when integrating.
 */
export function describePostPaymentAction(deliveryAction: string): {
  actionType: string;
  summary: string;
} {
  switch (deliveryAction) {
    case "send_file_after_payment":
      return {
        actionType: "post_payment_action_executed",
        summary: "Digital file delivery unlocked for the customer.",
      };
    case "release_download":
      return {
        actionType: "post_payment_action_executed",
        summary: "Download link released to the customer.",
      };
    case "mark_milestone_complete":
      return {
        actionType: "post_payment_action_executed",
        summary: "Milestone marked complete in the project tracker.",
      };
    case "release_source_code":
      return {
        actionType: "post_payment_action_executed",
        summary: "Source code repository access granted to the client.",
      };
    case "send_invoice_receipt":
      return {
        actionType: "post_payment_action_executed",
        summary: "Receipt emailed to the customer.",
      };
    case "none":
    default:
      return {
        actionType: "post_payment_action_executed",
        summary: "Payment marked complete. No follow-up action configured.",
      };
  }
}
