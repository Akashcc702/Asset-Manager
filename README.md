# LocusPilot

**The AI copilot for digital sellers — turn natural-language payment instructions into agentic checkout flows.**

Built for **Locus' Paygentic Hackathon #3** (Theme: agentic payments + CheckoutWithLocus).

> A freelancer types: *"Collect ₹199 for my Python notes and send the file after payment."*
> LocusPilot's agent parses the intent, generates a CheckoutWithLocus payment link, watches the payment, and triggers the post-payment delivery — all without the seller writing a line of code.

---

## Hackathon Relevance

This project directly addresses the hackathon prompt: **"Build agentic payment experiences using CheckoutWithLocus."**

**How CheckoutWithLocus is integrated:**

- The `locusAdapter` service (`artifacts/api-server/src/services/locusAdapter.ts`) is the single seam for all Locus interactions. It exposes three operations: `createCheckout`, `getCheckoutStatus`, and `verifyWebhook`.
- It runs in two modes, switched by the `LOCUS_MODE` env var:
  - `mock` (default, used in this submission) — generates deterministic mock checkout URLs (`https://pay.locus.mock/checkout/...`) so judges can demo the full agent loop without real card flows.
  - `real` — a clearly marked stub with `TODO` markers showing exactly where the real CheckoutWithLocus REST calls plug in, including webhook signature verification.
- Every Locus call is wrapped in an agent action log entry (`payment_link_generated`, `payment_succeeded`, `post_payment_action_executed`), giving sellers a transparent audit trail of what the agent did on their behalf.
- The simulate-success endpoint (`POST /api/payments/:id/simulate-success`) emulates a CheckoutWithLocus webhook, so the full agentic loop — *parse → checkout → paid → deliver* — is end-to-end demonstrable in 30 seconds.

**Why this is "agentic":**

LocusPilot is not a payment form. It is an agent that understands a seller's plain-English goal, decides on the correct payment configuration (amount, currency, delivery action), creates the checkout, monitors it, and autonomously executes the post-payment step (release the file, mark the milestone, send the receipt). The seller's only job is to describe what they want.

---

## How to Demo This Project

Click the **Open** button above the workspace to launch the live preview, then follow this 90-second flow:

1. **Land on `/`** — read the headline, click **Create Payment Request**.
2. **On `/create`**, click any example chip (e.g. *"Take ₹199 for my coding notes and send the file after payment"*). It populates the prompt textarea.
3. Click **Auto-fill** — the agent parses the prompt and fills the form (title, amount, currency, delivery action). A green confidence badge appears.
4. Click **Create Payment Request** — you redirect to `/payments/:id` with status **Pending**, the CheckoutWithLocus link, and the agent timeline showing `intent_parsed → payment_request_created → payment_link_generated`.
5. Click **Simulate Payment Success** — status flips to **Paid**, three new timeline entries appear (`payment_simulated_success → payment_succeeded → post_payment_action_executed`).
6. Open **Dashboard** — totals updated, the new payment is in *Recent payments*.
7. Open **Activity** — full agent action timeline across all payments. Try filtering by Payment ID.

The dashboard ships pre-seeded with three demo payments so the experience is never empty on first load.

---

## Architecture

```
React + Vite (artifacts/locuspilot)
       │
       ▼
Express 5 API   /api/agent/parse        — deterministic prompt parser
(artifacts/     /api/payments           — CRUD payment requests
 api-server)    /api/payments/:id/simulate-success
                /api/activity           — agent action feed
                /api/dashboard/summary  — aggregated stats
       │
       ├── services/agentParser     — regex intent parser, confidence scored
       ├── services/locusAdapter    — mock | real CheckoutWithLocus seam
       └── services/activityLogger  — writes structured entries to agent_action_logs
       │
       ▼
PostgreSQL + Drizzle ORM (lib/db)
  payment_requests, agent_action_logs
```

**Stack:** pnpm monorepo · TypeScript 5.9 · Node 24 · Express 5 · React 18 + Vite · Tailwind + shadcn/ui · Postgres + Drizzle · Orval (OpenAPI → React Query hooks + Zod) · framer-motion.

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing hero, 3-step explainer, primary CTA |
| `/create` | Natural-language prompt + AI auto-fill, editable form |
| `/payments/:id` | Payment detail, checkout link, agent timeline, simulate success |
| `/dashboard` | Total collected, paid/pending counts, recent payments + activity |
| `/activity` | Full agent action timeline with payment-ID filter |

---

## Local Development

```bash
pnpm install                             # install workspace deps
pnpm --filter @workspace/db run push     # push DB schema
pnpm run typecheck                        # full typecheck
```

Both workflows (`API Server` and `web`) start automatically in the Replit workspace and bind to assigned ports.

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | (auto-provisioned) | Postgres connection string |
| `SESSION_SECRET` | (auto-provisioned) | Session signing |
| `LOCUS_MODE` | `mock` | Switch between `mock` and `real` Locus adapter |
| `PUBLIC_BASE_URL` | (optional) | Override the host used in mock checkout URLs |

---

## How to Publish

1. Click **Publish** in the Replit workspace top bar.
2. Replit will build, host, and assign a `*.replit.app` domain with TLS.
3. Once published, open the live URL and re-run the demo flow above to verify.
4. Share the URL with hackathon judges.

---

## Project Status

- End-to-end flow verified: **Landing → Create → Auto-fill → Submit → Detail → Simulate Success → Dashboard → Activity**.
- Typecheck passes across all workspace packages.
- Mock Locus mode runs out of the box; real Locus integration is a one-file change in `locusAdapter.ts`.
- Mobile-responsive (top nav collapses to a sheet menu on small screens).
- 404 page, loading skeletons, empty states, and toast feedback on every mutation.
