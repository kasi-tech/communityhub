# CommunityHub — Project CLAUDE.md

## Local Development

- `npm run dev` — Start Next.js dev server (port 3000)
- `npm run build` — Production build
- `npm run test` — Vitest unit tests
- `npm run test:watch` — Vitest in watch mode
- `npm run test:coverage` — Vitest with coverage report
- `npm run test:e2e` — Playwright E2E tests
- `npm run lint` — ESLint
- `npm run format` — Prettier format all files
- `npm run type-check` — TypeScript type checking (no emit)

## Environment

- Copy `.env.local.example` to `.env.local` and fill in values
- Supabase: local or cloud instance required (Auth, PostgreSQL, Storage)
- Claude API key required for AI features (chatbot, fraud scoring, content generation)
- PayPal and PayNow credentials required for payment flows
- No secrets in code — all via environment variables

## Architecture

- **Framework:** Next.js 16 App Router + TypeScript + Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL, Auth with JWT, Storage)
- **AI:** Anthropic Claude API (chatbot, fraud scoring, content generation)
- **Payments:** PayPal + PayNow (adapter pattern in `src/lib/payments/`)
- **Email:** Resend + React Email templates
- **State:** Zustand (client), React Hook Form + Zod (forms)

## Key Directories

- `src/app/` — Next.js App Router pages and API routes
  - `(public)/` — Public pages (home, events, about, gallery, donate, volunteer, sponsor)
  - `(auth)/` — Auth pages (login, join/onboarding)
  - `(member)/` — Protected member pages (dashboard)
  - `api/v1/` — Versioned REST API routes
- `src/components/` — React components organized by domain
  - `ui/` — Design system primitives (Button, Card, Input, etc.)
  - `layout/` — Navbar, Footer, Sidebar, MobileNav
  - `events/` — Event grid, calendar, filters, cards
  - `onboarding/` — Join wizard steps (OTP, tier selector, referral, family)
  - `admin/` — Admin panel components
  - `ai/` — AI-powered components (chatbot, recommendations)
  - `shared/` — Cross-cutting components (payment methods, etc.)
- `src/lib/` — Utilities and service integrations
  - `supabase/` — Supabase client (server + browser)
  - `auth.ts` — Auth helpers and middleware
  - `email.ts` — Email sending via Resend
  - `ai.ts` — Claude API integration
  - `payments/` — Payment adapter pattern
  - `monitoring.ts` — Logging, error tracking, API call metrics
- `supabase/migrations/` — Database migrations (Supabase CLI)
- `specs/` — SDLC artifacts (spec, design, prototype, roadmap)
- `tests/e2e/` — Playwright E2E tests
- `docs/` — Project documentation

## Conventions

- **API responses:** `{ data }` on success, `{ error: { message, code } }` on failure
- **Auth:** Supabase JWT via httpOnly cookies managed by `@supabase/ssr`
- **Admin routes:** Check `isAdmin()` from `@/lib/auth` before processing
- **Validation:** All user input validated via Zod schemas in `@/lib/validate`
- **Audit logs:** All state-changing operations create audit log entries
- **Imports:** Use `@/` path alias for all src imports
- **Components:** Prefer server components; add `"use client"` only when needed

## Testing Strategy

- **Unit tests:** Vitest + jsdom for components and utilities (`src/**/*.test.{ts,tsx}`)
- **E2E tests:** Playwright for full user flows (`tests/e2e/*.spec.ts`)
- **Coverage target:** >= 85% line coverage for changed files
- **Test data:** Use factories/fixtures, never hit real external APIs in unit tests

## Branch Policy

- `main` — production (protected, deploy via CI/CD)
- `development` — integration branch
- `feature/*` — all development work
- PRs always target `development`; `main` updated only via release pipeline
