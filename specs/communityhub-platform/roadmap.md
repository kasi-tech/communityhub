# CommunityHub — Roadmap & Sprint Plan

**Version:** 1.0
**Date:** 2026-03-29
**Author:** CEO (AI-assisted)
**Status:** Draft — Awaiting User Approval
**Spec:** `specs/communityhub-platform/spec.md`
**Design:** `specs/communityhub-platform/design.md`

---

## 1. Building Blocks

The system is decomposed into 8 independent building blocks with high cohesion and low coupling. Each block can be developed and tested independently.

### Block Overview

| # | Building Block | Description | Dependencies | Complexity | Priority |
|---|---------------|-------------|-------------|-----------|----------|
| BB-1 | **Foundation & Tenant Config** | Project setup, DB schema, Supabase config, tenant branding, feature flags | None | Medium | P0 |
| BB-2 | **Authentication & Member Management** | Supabase Auth, login, profile, member CRUD, RLS policies | BB-1 | Medium | P0 |
| BB-3 | **Fraud-Resistant Onboarding** | Multi-step wizard, OTP, email verify, referral, AI fraud scoring, admin approval | BB-1, BB-2, BB-5 | High | P0 |
| BB-4 | **Event Management & Registration** | Event CRUD, image upload, search/filter, calendar, registration, waitlist, check-in | BB-1, BB-2, BB-5 | High | P0 |
| BB-5 | **Payment System** | PayPal + PayNow integration, refunds, payment history, adapter pattern | BB-1 | Medium | P0 |
| BB-6 | **AI Features** | Chatbot, recommendations, event copilot, recap generator, newsletter, fraud scoring | BB-1, BB-2, BB-4 | High | P1 |
| BB-7 | **Admin Panel & Reports** | Dashboard, member mgmt, application queue, reports, communications, audit log | BB-1, BB-2, BB-3, BB-4 | Medium | P0 |
| BB-8 | **Community Engagement** | Donations, volunteering, sponsorship, gallery, notifications, PWA | BB-1, BB-2, BB-5 | Low | P2 |

### Dependency Graph

```
BB-1 (Foundation)
 ├──→ BB-2 (Auth & Members)
 │     ├──→ BB-3 (Onboarding) ←── BB-5 (Payments)
 │     ├──→ BB-4 (Events) ←────── BB-5 (Payments)
 │     ├──→ BB-6 (AI) ←────────── BB-4 (Events)
 │     ├──→ BB-7 (Admin) ←─────── BB-3, BB-4
 │     └──→ BB-8 (Engagement) ←── BB-5 (Payments)
 └──→ BB-5 (Payments)
```

**Parallel execution opportunities:**
- BB-3 (Onboarding) and BB-4 (Events) can run in parallel after BB-1 + BB-2
- BB-6 (AI) and BB-7 (Admin) can run in parallel
- BB-8 (Engagement) can run independently after BB-5

---

## 2. Sprint Plan

**Sprint cadence:** 2-week iterations
**Team:** AI agents (3-4 in parallel per sprint)

### Sprint 0 (S0): Foundation — Week 1-2

**Goal:** Project skeleton, database, auth, tenant config — everything blocks on this.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| Initialize Next.js 15 project + TypeScript + Tailwind + shadcn/ui | BB-1 | Agent-1 | 1 | P0 |
| Set up Supabase project (local + cloud) | BB-1 | Agent-1 | 0.5 | P0 |
| Create all DB migrations (16 migration files) | BB-1 | Agent-1 | 2 | P0 |
| Implement RLS policies | BB-1 | Agent-1 | 1 | P0 |
| Seed STS tenant data | BB-1 | Agent-1 | 0.5 | P0 |
| Implement tenant config API (`GET/PATCH /config/*`) | BB-1 | Agent-2 | 1 | P0 |
| Build branding theme system (CSS custom properties from config) | BB-1 | Agent-2 | 1 | P0 |
| Build feature flags system | BB-1 | Agent-2 | 0.5 | P0 |
| Set up CI/CD (GitHub Actions, Vercel) | BB-1 | Agent-3 | 1 | P0 |
| Set up ESLint, Prettier, Vitest, Playwright | BB-1 | Agent-3 | 0.5 | P0 |
| Create shared UI components (shadcn/ui + custom) | BB-1 | Agent-3 | 2 | P0 |
| Build navbar, footer, mobile nav, sidebar layout | BB-1 | Agent-3 | 1 | P1 |
| Implement Supabase Auth (login, magic link, OAuth) | BB-2 | Agent-4 | 1.5 | P0 |
| Build login page + auth middleware | BB-2 | Agent-4 | 1 | P0 |
| Build member profile API + page | BB-2 | Agent-4 | 1.5 | P0 |

**Sprint 0 Deliverables:**
- Working Next.js app with Supabase connected
- Auth working (login, magic link)
- DB schema deployed with RLS
- STS seed data loaded
- CI/CD pipeline green
- Shared UI components ready

---

### Sprint 1 (S1): Core Features — Week 3-4

**Goal:** Event browsing + registration + payment. The MVP user flow.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| Build events API (CRUD, list, filter, search) | BB-4 | Agent-1 | 2 | P0 |
| Build events listing page (cards + filters + search) | BB-4 | Agent-1 | 2 | P0 |
| Build event detail page (tabs, schedule, speakers) | BB-4 | Agent-1 | 1.5 | P0 |
| Build calendar view component | BB-4 | Agent-1 | 1 | P1 |
| Implement image upload API + component (sharp, Supabase Storage) | BB-4 | Agent-2 | 2 | P0 |
| Build event registration API + form | BB-4 | Agent-2 | 2 | P0 |
| Build waitlist system (auto-promote, notification) | BB-4 | Agent-2 | 1 | P1 |
| Implement PayPal integration (create, capture, refund) | BB-5 | Agent-3 | 2.5 | P0 |
| Implement PayNow integration (QR generation, verify) | BB-5 | Agent-3 | 2 | P0 |
| Build payment adapter interface + payment UI components | BB-5 | Agent-3 | 1.5 | P0 |
| Build homepage (hero, upcoming events, stats, footer) | BB-1 | Agent-4 | 1.5 | P0 |
| Build registration confirmation (email + QR + calendar) | BB-4 | Agent-4 | 1.5 | P0 |
| Build cancellation flow + refund processing | BB-4 | Agent-4 | 1 | P1 |
| Social sharing (WhatsApp, Telegram deep links) | BB-4 | Agent-4 | 0.5 | P1 |

**Sprint 1 Deliverables:**
- Full event discovery flow (browse → detail → register → pay → confirm)
- PayPal + PayNow working
- Image upload for events
- Calendar view
- Waitlist + cancellation
- Homepage live

---

### Sprint 2 (S2): Onboarding + Admin — Week 5-6

**Goal:** Fraud-resistant member onboarding + admin panel MVP.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| Build onboarding wizard (6-step UI + stepper) | BB-3 | Agent-1 | 2.5 | P0 |
| Phone OTP verification (Twilio integration) | BB-3 | Agent-1 | 1.5 | P0 |
| Email verification (code + magic link) | BB-3 | Agent-1 | 1 | P0 |
| Referral system (lookup, notify referrer, confirm) | BB-3 | Agent-2 | 2 | P0 |
| Family details form (spouse + children) | BB-3 | Agent-2 | 1 | P1 |
| AI fraud scoring integration (Claude Haiku) | BB-3 | Agent-2 | 2 | P1 |
| Duplicate detection (fuzzy match) | BB-3 | Agent-2 | 1 | P0 |
| Application status page + email notifications | BB-3 | Agent-2 | 1 | P0 |
| Admin dashboard (stats, recent activity) | BB-7 | Agent-3 | 1.5 | P0 |
| Admin event management (CRUD table + create modal) | BB-7 | Agent-3 | 2 | P0 |
| Admin member management (list, search, filter, edit) | BB-7 | Agent-3 | 1.5 | P0 |
| Admin application approval queue (fraud scores, approve/reject) | BB-7 | Agent-4 | 2.5 | P0 |
| Admin configuration panels (branding, tiers, payments, pipeline, flags) | BB-7 | Agent-4 | 3 | P0 |
| Rate limiting middleware + reCAPTCHA | BB-3 | Agent-4 | 1 | P0 |
| Audit log system | BB-7 | Agent-4 | 1 | P1 |

**Sprint 2 Deliverables:**
- Full onboarding flow (phone → email → details → tier → referral → pay → approval)
- Fraud scoring with AI
- Admin panel MVP (dashboard, events, members, applications, config)
- Rate limiting + duplicate detection

---

### Sprint 3 (S3): AI + Dashboard + Reports — Week 7-8

**Goal:** AI chatbot, recommendations, member dashboard, financial reports.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| AI chatbot (Claude Sonnet, RAG, bilingual) | BB-6 | Agent-1 | 3 | P0 |
| Chatbot widget UI (floating panel, messages) | BB-6 | Agent-1 | 1.5 | P0 |
| Chatbot knowledge base (FAQ embeddings in pgvector) | BB-6 | Agent-1 | 1.5 | P1 |
| Event recommendations (embeddings + collaborative filter) | BB-6 | Agent-2 | 2.5 | P1 |
| Event copilot (AI-generated event listings) | BB-6 | Agent-2 | 1.5 | P1 |
| Event recap generator | BB-6 | Agent-2 | 1 | P2 |
| Member dashboard (overview, my events, profile, membership) | BB-2 | Agent-3 | 3 | P0 |
| Member QR code for check-in | BB-4 | Agent-3 | 1 | P1 |
| Feedback submission (post-event, star rating) | BB-4 | Agent-3 | 1 | P1 |
| Notification center (in-app + email preferences) | BB-2 | Agent-3 | 1.5 | P1 |
| Financial reports page (revenue by event, membership, donations) | BB-7 | Agent-4 | 2.5 | P1 |
| Communications tool (bulk email, segment selector, templates) | BB-7 | Agent-4 | 2.5 | P1 |
| Email template system (React Email + Resend) | BB-7 | Agent-4 | 2 | P1 |

**Sprint 3 Deliverables:**
- AI chatbot live (bilingual)
- Event recommendations on dashboard
- Event copilot for admins
- Member dashboard fully functional
- Financial reports
- Communication tools
- Email templates

---

### Sprint 4 (S4): Engagement + Polish — Week 9-10

**Goal:** Donations, volunteering, sponsorship, gallery, PWA, polishing.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| Donation page (form, PayPal/PayNow, donor wall) | BB-8 | Agent-1 | 2 | P1 |
| Volunteer registration page | BB-8 | Agent-1 | 1 | P2 |
| Sponsorship page (tiers, inquiry form) | BB-8 | Agent-1 | 1.5 | P2 |
| Photo gallery (AI-tagged, smart search, auto-albums) | BB-8 | Agent-2 | 3 | P2 |
| Event check-in system (QR scanner, manual, log) | BB-4 | Agent-2 | 2 | P2 |
| Newsletter generator (AI monthly auto-curate) | BB-6 | Agent-2 | 2 | P2 |
| PWA setup (manifest, service worker, offline cache) | BB-1 | Agent-3 | 2 | P2 |
| SEO optimization (meta tags, OG, sitemap, SSR) | BB-1 | Agent-3 | 1.5 | P1 |
| About page | BB-1 | Agent-3 | 0.5 | P2 |
| Language configuration (UI string overrides, chatbot languages) | BB-1 | Agent-3 | 1.5 | P2 |
| Admin chatbot management (FAQ editor, conversation logs, stats) | BB-7 | Agent-4 | 2 | P1 |
| Admin email template editor | BB-7 | Agent-4 | 2 | P2 |
| Sentiment analysis on feedback | BB-6 | Agent-4 | 1.5 | P2 |
| Attendance prediction (AI) | BB-6 | Agent-4 | 1.5 | P2 |

**Sprint 4 Deliverables:**
- Donations + donor wall
- Volunteer + sponsor pages
- Photo gallery with AI
- Event check-in (QR)
- AI newsletter generator
- PWA support
- SEO optimized
- Admin chatbot management

---

### Sprint 5 (S5): Hardening & Launch — Week 11-12

**Goal:** Security audit, performance optimization, load testing, documentation, launch.

| Task | Block | Owner | Est. Days | Priority |
|------|-------|-------|-----------|----------|
| Security audit (SAST, dependency scan, OWASP checklist) | All | Agent-1 | 2 | P0 |
| Performance optimization (bundle size, image optimization, caching) | All | Agent-1 | 2 | P0 |
| Load testing (k6, 2x expected peak) | All | Agent-1 | 1.5 | P0 |
| Lighthouse CI gate (Core Web Vitals budget enforcement) | All | Agent-2 | 1 | P0 |
| Accessibility audit (axe-core, keyboard nav, screen reader) | All | Agent-2 | 2 | P0 |
| Responsive testing (375px, 768px, 1280px) | All | Agent-2 | 1 | P0 |
| Cross-browser testing (Chrome, Safari, Firefox, Edge) | All | Agent-2 | 1 | P1 |
| OpenTelemetry integration (distributed tracing) | All | Agent-3 | 2 | P1 |
| Sentry error tracking setup | All | Agent-3 | 1 | P1 |
| Monitoring dashboards (Vercel Analytics + PostHog) | All | Agent-3 | 1.5 | P1 |
| Runbook creation (common operations) | All | Agent-3 | 1 | P1 |
| STS data migration (existing members, if data available) | BB-2 | Agent-4 | 2 | P0 |
| Custom domain setup (events.sts.org.sg → Vercel) | BB-1 | Agent-4 | 0.5 | P0 |
| Final E2E test suite (full user journey) | All | Agent-4 | 2 | P0 |
| Deployment to production + smoke tests | All | Agent-4 | 1 | P0 |

**Sprint 5 Deliverables:**
- Security audit passed
- Performance budget met
- Accessibility compliant (WCAG 2.1 AA)
- Monitoring live
- Production deployed at events.sts.org.sg
- Runbook documented

---

## 3. Sprint Summary Timeline

```
Week  1-2  │ S0: Foundation        │ DB, Auth, CI/CD, UI components
Week  3-4  │ S1: Core Features     │ Events, Registration, Payments, Homepage
Week  5-6  │ S2: Onboarding+Admin  │ Fraud pipeline, Admin panel
Week  7-8  │ S3: AI + Dashboard    │ Chatbot, Recommendations, Reports
Week  9-10 │ S4: Engagement        │ Donations, Gallery, PWA, SEO
Week 11-12 │ S5: Hardening+Launch  │ Security, Performance, Go-Live
```

**Total timeline: 12 weeks (6 sprints)**

---

## 4. Risk Register

| Risk ID | Description | Probability | Impact | Mitigation | Owner |
|---------|-------------|-------------|--------|------------|-------|
| RISK-001 | Claude API rate limits or downtime during chatbot usage | Low | Medium | Implement caching layer, fallback to static FAQ, Haiku as backup model | Agent (AI block) |
| RISK-002 | PayNow verification is manual (no real-time webhook) | Medium | Medium | Implement admin manual verification UI, add optional Stripe as backup provider | Agent (Payments block) |
| RISK-003 | Twilio SMS costs accumulate with OTP abuse | Medium | Low | Rate limit OTPs (5/phone/day), allow email-only verify as fallback, configurable toggle | Agent (Onboarding block) |
| RISK-004 | STS committee has low technical literacy for admin panel | High | Medium | AI copilot for event creation, simple UI with tooltips, admin onboarding video/guide | Agent (Admin block) |
| RISK-005 | Image upload performance on mobile (large photos) | Medium | Medium | Client-side compression before upload (browser-image-compression), progress indicator | Agent (Events block) |
| RISK-006 | Supabase free tier limits exceeded during development | Low | Low | Use Supabase Pro ($25/mo) from start, monitor usage dashboard | DevOps |
| RISK-007 | Telugu language support quality in AI chatbot | Medium | Medium | Test with native Telugu speakers, add FAQ entries in Telugu, fine-tune system prompt | Agent (AI block) |
| RISK-008 | PDPA compliance gaps discovered post-launch | Low | High | Legal review of privacy policy before launch, implement data export/deletion APIs in S2 | Product |
| RISK-009 | Existing STS member data migration quality issues | Medium | Medium | Get data export from current site early, build validation scripts, manual review of edge cases | Agent (S5) |
| RISK-010 | Community adoption resistance (members used to old ways) | Medium | High | Gradual rollout, keep old site running for 3 months, in-person demo at next event, WhatsApp group for support | Product |
| RISK-011 | PayPal sandbox → production API differences | Low | Medium | Test with real (small) transactions in staging, document PayPal production checklist | Agent (Payments block) |
| RISK-012 | Bundle size exceeds 250KB budget with AI chatbot widget | Medium | Low | Lazy-load chatbot component, code-split AI module, monitor bundle analyzer in CI | Agent (Frontend) |

### P0 Risk Mitigations (Must implement before Phase 3)

| Risk | Mitigation Action | Sprint |
|------|-------------------|--------|
| RISK-004 | AI copilot built into event creation from day 1 | S2 |
| RISK-010 | Gradual rollout plan documented, old site kept running | S5 |
| RISK-008 | Data export/deletion APIs implemented, privacy policy drafted | S2 |

---

## 5. Parallel Execution Plan

```
Sprint   Agent-1              Agent-2              Agent-3              Agent-4
─────────────────────────────────────────────────────────────────────────────
S0       DB + Migrations      Config API + Theme   CI/CD + UI Library   Auth + Login
S1       Events API + UI      Images + Registration PayPal + PayNow     Homepage + Confirm
S2       Onboarding Wizard    Referral + Fraud AI  Admin Dashboard      Admin Config
S3       AI Chatbot           Recommendations      Member Dashboard     Reports + Comms
S4       Donations + Vol.     Gallery + Check-in   PWA + SEO            Admin AI Mgmt
S5       Security + Perf      A11y + Responsive    Monitoring + Ops     Migration + Deploy
```

Each sprint leverages 4 parallel agents working on decoupled tasks. Agent handoffs occur at sprint boundaries where dependencies exist.

---

## 6. Success Criteria per Sprint

| Sprint | Gate | Criteria |
|--------|------|----------|
| S0 | Build green | Next.js builds, Supabase connected, auth works, CI/CD passes |
| S1 | MVP flow | User can browse events → register → pay → get confirmation |
| S2 | Onboarding complete | New user can complete full onboarding, admin can approve/reject |
| S3 | AI live | Chatbot responds in English + Telugu, recommendations show on dashboard |
| S4 | Feature complete | All pages from prototype are implemented and functional |
| S5 | Launch ready | Security audit passed, performance budgets met, a11y compliant, production deployed |
