# LocusPilot

## Overview

**LocusPilot** — AI agent for freelancer and digital seller payments.
A seller types a plain-English instruction (e.g. "Collect ₹199 for Python notes and send the file after payment");
the agent parses it, creates a CheckoutWithLocus payment request via a mock/real adapter,
tracks the payment, and triggers the next step (release file, mark milestone, etc.) once paid.

Built for **Locus' Paygentic Hackathon #3** (Week 3 theme: agentic payments + CheckoutWithLocus).

## Status

- **MVP complete** — end-to-end Landing → Create → Auto-fill → Detail → Simulate Success → Dashboard → Activity flow works.
- Mock Locus mode by default (`LOCUS_MODE=mock`); real adapter is a stubbed seam.

## Architecture

```
React (Vite)  →  Express API (/api)  →  Postgres (Drizzle)
artifacts/         artifacts/             lib/db
locuspilot/        api-server/

API services (artifacts/api-server/src/services):
  agentParser     — deterministic regex prompt parser
  locusAdapter    — mock | real (env: LOCUS_MODE), creates checkout requests
  activityLogger  — writes structured entries to agent_action_logs
```

## Pages

- `/` Landing — hero, 3-step explainer, primary CTA
- `/create` Create — natural-language prompt + AI auto-fill, editable form
- `/payments/:id` Detail — status, payment URL, agent timeline, simulate-success
- `/dashboard` Dashboard — totals + recent payments + recent activity
- `/activity` Activity — full agent action timeline with filter

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
