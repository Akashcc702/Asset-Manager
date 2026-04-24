/**
 * Deterministic agent parser for LocusPilot.
 *
 * Strategy:
 *   1. Extract the amount with regex (digits, "k", "rupees", "rs", currency words).
 *   2. Detect currency from symbols / words. Default INR.
 *   3. Map common phrases to a delivery_action.
 *   4. Extract a title by stripping amount/currency/intent words from the prompt.
 *   5. Return a confidence score reflecting how much we recognised.
 *
 * An optional LLM layer can be added later behind the same `parseIntent`
 * signature; the deterministic parser must always work even with no API key.
 */

export type Currency = "INR" | "USD" | "EUR" | "GBP";

export type DeliveryAction =
  | "none"
  | "send_file_after_payment"
  | "release_download"
  | "mark_milestone_complete"
  | "release_source_code"
  | "send_invoice_receipt";

export interface ParsedIntent {
  intent: "create_payment_request";
  title: string;
  amount: number;
  currency: Currency;
  deliveryAction: DeliveryAction;
  note: string | null;
  confidence: number;
  rawPrompt: string;
}

const CURRENCY_RULES: Array<{ test: RegExp; currency: Currency }> = [
  { test: /(?:₹|\brs\.?\b|\brupees?\b|\binr\b)/i, currency: "INR" },
  { test: /(?:\$|\busd\b|\bdollars?\b)/i, currency: "USD" },
  { test: /(?:€|\beur\b|\beuros?\b)/i, currency: "EUR" },
  { test: /(?:£|\bgbp\b|\bpounds?\b)/i, currency: "GBP" },
];

const DELIVERY_RULES: Array<{ test: RegExp; action: DeliveryAction }> = [
  { test: /\bsource\s*code\b/i, action: "release_source_code" },
  { test: /\bmilestone\b/i, action: "mark_milestone_complete" },
  {
    test: /\b(?:send|deliver|share)\s+(?:the\s+)?(?:file|notes|pdf|ebook|asset)/i,
    action: "send_file_after_payment",
  },
  {
    test: /\b(?:download|unlock|release)\b/i,
    action: "release_download",
  },
  { test: /\b(?:invoice|receipt)\b/i, action: "send_invoice_receipt" },
];

const STOPWORDS = new Set([
  "create",
  "payment",
  "request",
  "collect",
  "take",
  "ask",
  "client",
  "to",
  "for",
  "of",
  "and",
  "the",
  "a",
  "an",
  "please",
  "from",
  "before",
  "after",
  "send",
  "deliver",
  "release",
  "unlock",
  "pay",
  "worth",
  "rupees",
  "rupee",
  "rs",
  "inr",
  "usd",
  "eur",
  "gbp",
  "dollars",
  "dollar",
  "euros",
  "euro",
  "pounds",
  "pound",
  "milestone",
  "1",
  "2",
  "3",
  "4",
  "5",
  "my",
  "me",
  "i",
  "want",
  "need",
]);

function extractAmount(prompt: string): number | null {
  // Match: 199, 1,999, 5k, 2.5k, ₹999
  const match = prompt.match(
    /(?:₹|\$|€|£)?\s*(\d{1,3}(?:[,\s]\d{3})+|\d+(?:\.\d+)?)\s*(k|thousand)?/i,
  );
  if (!match) return null;
  const raw = match[1]?.replace(/[,\s]/g, "") ?? "";
  let n = parseFloat(raw);
  if (Number.isNaN(n)) return null;
  if (match[2] && /k|thousand/i.test(match[2])) n *= 1000;
  return Math.round(n);
}

function detectCurrency(prompt: string): Currency {
  for (const rule of CURRENCY_RULES) {
    if (rule.test.test(prompt)) return rule.currency;
  }
  return "INR";
}

function detectDeliveryAction(prompt: string): DeliveryAction {
  for (const rule of DELIVERY_RULES) {
    if (rule.test.test(prompt)) return rule.action;
  }
  return "none";
}

function extractTitle(prompt: string, amount: number | null): string {
  let cleaned = prompt
    // remove any "for <thing>" anchor and keep the thing
    .replace(/\b(rs\.?|inr|usd|eur|gbp|₹|\$|€|£)\b/gi, " ")
    .replace(/\d{1,3}(?:[,\s]\d{3})+/g, " ")
    .replace(/\d+(?:\.\d+)?\s*(?:k|thousand)?/gi, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase();

  // Prefer text after "for" if present
  const forMatch = cleaned.match(/\bfor\b\s+(.+)$/);
  if (forMatch && forMatch[1]) {
    cleaned = forMatch[1];
  }

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t));

  if (tokens.length === 0) {
    return amount ? `Payment of ${amount}` : "Payment request";
  }

  // Take up to 6 meaningful words
  const titleWords = tokens.slice(0, 6);
  const title = titleWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return title || "Payment request";
}

export function parseIntent(prompt: string): ParsedIntent {
  const trimmed = prompt.trim();
  const amount = extractAmount(trimmed);
  const currency = detectCurrency(trimmed);
  const deliveryAction = detectDeliveryAction(trimmed);
  const title = extractTitle(trimmed, amount);

  // Confidence: amount + recognisable title + delivery action all add weight
  let confidence = 0.4;
  if (amount && amount > 0) confidence += 0.35;
  if (title && title !== "Payment request") confidence += 0.15;
  if (deliveryAction !== "none") confidence += 0.1;
  if (confidence > 0.99) confidence = 0.99;

  return {
    intent: "create_payment_request",
    title,
    amount: amount ?? 0,
    currency,
    deliveryAction,
    note: null,
    confidence: Number(confidence.toFixed(2)),
    rawPrompt: trimmed,
  };
}
