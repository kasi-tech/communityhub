# CommunityHub — Project AGENTS.md

## Project Overview
**CommunityHub** is a white-label, single-tenant deployable community management platform. It provides AI-powered event management, fraud-resistant membership onboarding, and community engagement tools. Any community organization can deploy their own instance with custom branding, configurable workflows, and pluggable payment providers.

**First Tenant:** Singapore Telugu Samajam (STS) — events.sts.org.sg

## Architecture
- **Type:** Single-tenant deployable (Architecture B)
- **Frontend:** Next.js 15 (App Router) + Tailwind CSS
- **Backend/DB:** Supabase (Auth, PostgreSQL, pgvector, Storage, Edge Functions)
- **AI:** Claude API (chatbot, content generation, recommendations, fraud scoring)
- **Payments:** Pluggable — PayPal, PayNow (Stripe, Razorpay as future plugins)
- **OTP/SMS:** Twilio (pluggable)
- **Email:** Resend
- **Hosting:** Vercel (recommended) or any Node.js host
- **Analytics:** GA4 + PostHog

## Repository Structure
```
communityhub/
├── .ai/                          # AI system understanding
├── specs/                        # SDLC Phase 1 & 2 artifacts
│   └── communityhub-platform/
│       ├── spec.md               # Requirements
│       ├── prototype/            # HTML prototype
│       ├── golden-data.json      # Test scenarios
│       ├── traceability.md       # REQ → UI → Test mapping
│       ├── design.md             # HLS (Phase 2)
│       └── roadmap.md            # Sprint plan (Phase 2)
├── src/                          # Next.js application source
│   ├── app/                      # App Router pages
│   ├── components/               # Shared UI components
│   ├── lib/                      # Utilities, Supabase client, AI client
│   └── config/                   # Tenant configuration
├── supabase/                     # Supabase migrations & config
│   ├── migrations/               # Flyway-style SQL migrations
│   └── seed.sql                  # STS demo seed data
├── public/                       # Static assets
├── test-data/                    # Test fixtures
└── docs/                         # Deployment & admin guides
```

## Key Design Decisions
1. **Single-tenant deployable** — each org gets their own instance for full data ownership
2. **Configurable onboarding** — fraud prevention steps (OTP, email verify, referral, admin approval, payment gate) are toggleable per deployment
3. **Pluggable payments** — PayPal + PayNow default; adapter pattern for adding Stripe, Razorpay, etc.
4. **AI-first engagement** — Claude API powers chatbot, event recommendations, content generation, newsletter, and fraud scoring
5. **Bilingual support** — UI and AI chatbot support configurable languages (English + org's primary language)

## Branch Policy
- `main` — production releases only
- `release` — staging
- `development` — integration branch (all PRs target here)
- `feature/<description>` — all work happens on feature branches

## Protected Branches
NEVER commit directly to: `main`, `release`, `development`

## Deployment
- Target: Vercel (primary) or self-hosted Node.js
- DB: Supabase Cloud or self-hosted Supabase
- Environment files: `.env.local`, `.env.test`, `.env.production`
