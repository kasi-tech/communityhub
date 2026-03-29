# CommunityHub — High-Level Solution Design (HLS)

**Version:** 1.0
**Date:** 2026-03-29
**Author:** CTO (AI-assisted)
**Status:** Draft — Awaiting User Approval
**Spec Reference:** `specs/communityhub-platform/spec.md`
**Prototype:** `specs/communityhub-platform/prototype/index.html`
**OpenAPI Spec:** `specs/communityhub-platform/openapi.yaml`

---

## 1. System Architecture Overview

### 1a. Architecture Style

**Modular Monolith** deployed as a single Next.js application with clearly separated internal modules. This is the right choice for a single-tenant deployable platform because:

- Single deployment unit = simple ops for volunteer-run orgs
- Internal module boundaries enforce separation without network overhead
- Can extract to microservices later if scale demands it
- Supabase handles DB, Auth, Storage, and Realtime as managed services

### 1b. System Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│   Browser (SSR + CSR)    │    PWA (Mobile)    │    Admin Panel      │
│   Next.js App Router     │    Same codebase   │    Same codebase    │
└──────────────┬──────────────────┬──────────────────┬────────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APPLICATION                            │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Events  │ │ Members  │ │Onboarding│ │   AI     │ │  Admin   │ │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │            │            │        │
│  ┌────▼────────────▼────────────▼────────────▼────────────▼──────┐ │
│  │                    SHARED SERVICE LAYER                        │ │
│  │  Auth │ Payment │ Email │ Storage │ Config │ Audit │ AI Client│ │
│  └───┬──────┬──────────┬──────────┬──────────┬──────────┬────────┘ │
└──────┼──────┼──────────┼──────────┼──────────┼──────────┼──────────┘
       │      │          │          │          │          │
       ▼      ▼          ▼          ▼          ▼          ▼
┌──────────┐┌─────┐┌──────┐┌────────────┐┌──────────┐┌──────────┐
│ Supabase ││PayPal││Resend││  Supabase  ││  Claude  ││  Twilio  │
│   Auth   ││     ││      ││  Storage   ││   API    ││   SMS    │
│   + DB   ││PayNow││      ││  (S3)     ││(Anthropic)││          │
└──────────┘└─────┘└──────┘└────────────┘└──────────┘└──────────┘
```

### 1c. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Node.js | 20 LTS | Next.js requirement, stable LTS |
| **Framework** | Next.js | 15 (App Router) | SSR for SEO, API routes, React Server Components |
| **Language** | TypeScript | 5.x | Type safety, better DX, fewer runtime errors |
| **Styling** | Tailwind CSS | 4.x | Utility-first, themeable, responsive-first |
| **UI Components** | shadcn/ui | Latest | Accessible, composable, Tailwind-native |
| **State** | Zustand | 5.x | Lightweight, no boilerplate, works with SSR |
| **Forms** | React Hook Form + Zod | Latest | Performant forms with schema validation |
| **Database** | PostgreSQL (Supabase) | 15+ | Full SQL, pgvector for AI, Row Level Security |
| **Auth** | Supabase Auth | Latest | Email/password, magic link, OAuth, phone OTP |
| **Storage** | Supabase Storage | Latest | Image uploads, signed URLs, CDN |
| **Vector Store** | pgvector (Supabase) | Latest | Event/member embeddings for recommendations |
| **AI/LLM** | Claude API (Anthropic) | claude-sonnet-4-6 (chatbot), claude-haiku-4-5 (scoring) | Bilingual chatbot, content gen, fraud scoring |
| **Payments** | PayPal SDK + PayNow | Latest | Existing STS integrations |
| **Email** | Resend | Latest | Transactional + batch emails, React templates |
| **SMS/OTP** | Twilio | Latest | Phone verification, WhatsApp Business API |
| **Analytics** | PostHog | Latest | Product analytics, feature flags, session replay |
| **Hosting** | Vercel | Latest | Zero-config Next.js deploy, edge CDN, serverless |
| **CI/CD** | GitHub Actions | Latest | Build, test, lint, deploy pipeline |
| **Monitoring** | OpenTelemetry + Sentry | Latest | Distributed tracing, error tracking |

---

## 2. Database Schema

### 2a. Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│     tenants      │       │ membership_tiers  │
│──────────────────│       │──────────────────│
│ id (PK)          │◄──────│ tenant_id (FK)   │
│ name             │       │ id (PK)          │
│ slug             │       │ name             │
│ branding (JSONB) │       │ price            │
│ config (JSONB)   │       │ duration_months  │
│ features (JSONB) │       │ is_family        │
│ onboarding_steps │       │ benefits (JSONB) │
│ created_at       │       └──────────────────┘
└──────────────────┘              │
        │                         │
        │              ┌──────────▼──────────┐       ┌──────────────────┐
        │              │      members        │       │  family_members  │
        │              │────────────────────│       │──────────────────│
        └──────────────│ tenant_id (FK)     │◄──────│ member_id (FK)   │
                       │ id (PK)            │       │ id (PK)          │
                       │ user_id (FK→auth)  │       │ name             │
                       │ tier_id (FK)       │       │ relationship     │
                       │ name               │       │ dob              │
                       │ email              │       │ email            │
                       │ phone              │       │ phone            │
                       │ dob                │       └──────────────────┘
                       │ gender             │
                       │ nationality        │
                       │ postal_code        │
                       │ interests (TEXT[])  │
                       │ status (ENUM)      │
                       │ fraud_score        │
                       │ member_number      │
                       │ membership_expires │
                       │ created_at         │
                       │ embedding (vector) │
                       └──────────────────┘
                          │            │
           ┌──────────────┘            └──────────────┐
           ▼                                          ▼
┌──────────────────────┐               ┌──────────────────────┐
│    registrations     │               │      payments        │
│──────────────────────│               │──────────────────────│
│ id (PK)              │               │ id (PK)              │
│ event_id (FK)        │               │ member_id (FK)       │
│ member_id (FK)       │               │ registration_id (FK) │
│ status (ENUM)        │               │ application_id (FK)  │
│ attendee_adults      │               │ amount               │
│ attendee_children    │               │ currency             │
│ dietary_preference   │               │ provider (ENUM)      │
│ special_requirements │               │ provider_ref         │
│ total_amount         │               │ status (ENUM)        │
│ waitlist_position    │               │ refund_amount        │
│ checked_in_at        │               │ created_at           │
│ created_at           │               └──────────────────────┘
└──────────────────────┘
           │
           │
┌──────────▼───────────┐
│       events         │
│──────────────────────│
│ id (PK)              │
│ tenant_id (FK)       │
│ title                │
│ description          │
│ category             │
│ date                 │
│ start_time           │
│ end_time             │
│ venue_name           │
│ venue_address        │
│ venue_lat            │
│ venue_lng            │
│ capacity             │
│ price_adult          │
│ price_child          │
│ status (ENUM)        │
│ images (JSONB)       │
│ cover_image_url      │
│ schedule (JSONB)     │
│ speakers (JSONB)     │
│ created_by           │
│ created_at           │
│ embedding (vector)   │
└──────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│   applications       │        │     audit_logs       │
│──────────────────────│        │──────────────────────│
│ id (PK)              │        │ id (PK)              │
│ tenant_id (FK)       │        │ tenant_id (FK)       │
│ step_data (JSONB)    │        │ actor_id             │
│ current_step         │        │ action               │
│ phone                │        │ entity_type          │
│ phone_verified       │        │ entity_id            │
│ email                │        │ details (JSONB)      │
│ email_verified       │        │ ip_address           │
│ referrer_member_id   │        │ created_at           │
│ referrer_confirmed   │        └──────────────────────┘
│ fraud_score          │
│ fraud_factors(JSONB) │        ┌──────────────────────┐
│ payment_id (FK)      │        │   chat_conversations │
│ status (ENUM)        │        │──────────────────────│
│ rejection_reason     │        │ id (PK)              │
│ reviewed_by          │        │ tenant_id (FK)       │
│ created_at           │        │ member_id (FK, null) │
│ reviewed_at          │        │ session_id           │
└──────────────────────┘        │ messages (JSONB)     │
                                │ satisfaction         │
┌──────────────────────┐        │ resolved             │
│     donations        │        │ created_at           │
│──────────────────────│        └──────────────────────┘
│ id (PK)              │
│ tenant_id (FK)       │        ┌──────────────────────┐
│ donor_name           │        │     volunteers       │
│ donor_email          │        │──────────────────────│
│ amount               │        │ id (PK)              │
│ payment_id (FK)      │        │ tenant_id (FK)       │
│ message              │        │ name                 │
│ show_on_wall         │        │ email                │
│ created_at           │        │ phone                │
└──────────────────────┘        │ skills (TEXT[])      │
                                │ availability(TEXT[]) │
                                │ notes                │
                                │ created_at           │
                                └──────────────────────┘
```

### 2b. Key Enums

```sql
CREATE TYPE member_status AS ENUM ('applying', 'pending', 'active', 'expired', 'suspended', 'rejected');
CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('paypal', 'paynow');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE application_status AS ENUM ('in_progress', 'submitted', 'under_review', 'approved', 'rejected');
```

### 2c. Row Level Security (RLS)

| Table | Policy | Rule |
|-------|--------|------|
| members | own_profile | `auth.uid() = user_id` for SELECT/UPDATE |
| members | admin_all | `is_admin(auth.uid())` for ALL |
| registrations | own_registrations | `member_id IN (SELECT id FROM members WHERE user_id = auth.uid())` |
| events | public_read | `status = 'published'` for SELECT (anon) |
| events | admin_write | `is_admin(auth.uid())` for INSERT/UPDATE/DELETE |
| applications | own_application | `email = auth.email()` for SELECT |
| applications | admin_all | `is_admin(auth.uid())` for ALL |
| payments | own_payments | via member_id → user_id chain |
| tenants | public_read | Tenant config is public |
| tenants | super_admin_write | `is_super_admin(auth.uid())` |
| audit_logs | admin_read | `is_admin(auth.uid())` for SELECT |

### 2d. Migration Strategy

All migrations use Supabase CLI (`supabase migration new`):

```
supabase/migrations/
├── 20260329000001_create_tenants.sql
├── 20260329000002_create_membership_tiers.sql
├── 20260329000003_create_members.sql
├── 20260329000004_create_family_members.sql
├── 20260329000005_create_events.sql
├── 20260329000006_create_registrations.sql
├── 20260329000007_create_payments.sql
├── 20260329000008_create_applications.sql
├── 20260329000009_create_donations.sql
├── 20260329000010_create_volunteers.sql
├── 20260329000011_create_chat_conversations.sql
├── 20260329000012_create_audit_logs.sql
├── 20260329000013_create_rls_policies.sql
├── 20260329000014_create_indexes.sql
├── 20260329000015_enable_pgvector.sql
├── 20260329000016_seed_sts_tenant.sql
```

**Migration Safety Rules:**
- All migrations are forward-compatible (additive only)
- Column renames/deletes use 2-phase migration
- Every migration tested on clone of production data
- Rollback scripts stored alongside: `*_rollback_*.sql`

---

## 3. API Architecture

### 3a. API Design Principles

- **RESTful** with URL versioning: `/api/v1/`
- **JSON:API** inspired response format
- **Bearer token** auth (Supabase JWT)
- **Pagination:** cursor-based for lists (`?cursor=xxx&limit=20`)
- **Filtering:** query params (`?category=cultural&status=published`)
- **Sorting:** `?sort=-date` (prefix `-` for descending)
- **Rate limiting:** 100 req/min for authenticated, 30 req/min for anonymous
- **CORS:** Configured per tenant domain

### 3b. API Route Structure (Next.js App Router)

```
src/app/api/v1/
├── auth/
│   ├── register/route.ts
│   ├── verify-otp/route.ts
│   ├── verify-email/route.ts
│   ├── login/route.ts
│   ├── magic-link/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── members/
│   ├── route.ts              (GET list, admin)
│   └── [id]/
│       ├── route.ts          (GET, PATCH)
│       ├── events/route.ts
│       └── payments/route.ts
├── onboarding/
│   ├── start/route.ts
│   └── [id]/
│       ├── step/route.ts
│       ├── referral/route.ts
│       ├── status/route.ts
│       └── payment/route.ts
├── events/
│   ├── route.ts              (GET list, POST create)
│   └── [id]/
│       ├── route.ts          (GET, PATCH, DELETE)
│       ├── images/route.ts   (POST upload)
│       ├── registrations/route.ts
│       └── attendance/route.ts
├── registrations/
│   ├── route.ts              (POST register)
│   └── [id]/
│       ├── route.ts          (GET detail)
│       ├── cancel/route.ts
│       ├── checkin/route.ts
│       └── qr/route.ts
├── payments/
│   ├── paypal/
│   │   ├── create/route.ts
│   │   └── capture/route.ts
│   ├── paynow/
│   │   ├── create/route.ts
│   │   └── verify/route.ts
│   └── refund/route.ts
├── ai/
│   ├── chat/route.ts
│   ├── recommend/route.ts
│   ├── recap/route.ts
│   ├── newsletter/route.ts
│   ├── event-copilot/route.ts
│   └── fraud-score/[id]/route.ts
├── admin/
│   ├── dashboard/route.ts
│   ├── applications/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── approve/route.ts
│   │       └── reject/route.ts
│   ├── reports/revenue/route.ts
│   ├── communications/send/route.ts
│   └── audit-log/route.ts
├── config/
│   ├── route.ts              (GET config)
│   ├── branding/route.ts
│   ├── tiers/route.ts
│   ├── payments/route.ts
│   ├── onboarding/route.ts
│   ├── features/route.ts
│   ├── emails/route.ts
│   └── language/route.ts
├── donations/
│   ├── route.ts              (POST create, GET list)
│   └── wall/route.ts
└── volunteers/
    └── route.ts              (POST create, GET list)
```

### 3c. Full OpenAPI Spec

See `specs/communityhub-platform/openapi.yaml` for the complete OpenAPI 3.0 specification covering all 50+ endpoints.

### 3d. API Contract Versioning

- Current version: `v1`
- Breaking changes increment version (`v2`)
- Old version supported for minimum 2 sprints (4 weeks)
- Consumer-driven contract tests run in CI

---

## 4. Authentication & Authorization

### 4a. Auth Flow

```
                    ┌──────────┐
                    │  Client  │
                    └────┬─────┘
                         │ POST /auth/login (email + password)
                         │   OR POST /auth/magic-link
                         │   OR OAuth redirect (Google)
                    ┌────▼─────┐
                    │ Supabase │
                    │   Auth   │
                    └────┬─────┘
                         │ Returns JWT (access_token + refresh_token)
                    ┌────▼─────┐
                    │  Client  │ Stores in httpOnly cookie
                    └────┬─────┘
                         │ Bearer {access_token} on every request
                    ┌────▼─────┐
                    │ Next.js  │ Middleware validates JWT
                    │   API    │ Extracts user_id, role
                    └──────────┘
```

### 4b. Role-Based Access Control

| Role | Description | Permissions |
|------|------------|-------------|
| `anon` | Not logged in | View published events, tenant config |
| `member` | Active member | Register for events, manage profile, view own data |
| `admin` | Committee member | CRUD events, manage members, approve applications, view reports |
| `super_admin` | Org president/secretary | All admin + tenant configuration |

Roles stored in `members.role` column, checked via Supabase RLS + Next.js middleware.

### 4c. Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" },
];
```

---

## 5. Payment Integration

### 5a. Payment Architecture

```
┌────────────┐      ┌─────────────┐      ┌──────────────┐
│   Client   │─────▶│ Payment API │─────▶│  PayPal SDK  │
│            │      │   /api/v1   │      │    or        │
│            │◀─────│  /payments  │◀─────│  PayNow QR   │
└────────────┘      └──────┬──────┘      └──────────────┘
                           │
                    ┌──────▼──────┐
                    │  payments   │
                    │   table     │
                    └─────────────┘
```

### 5b. PayPal Integration

```typescript
// Adapter pattern for pluggable payments
interface PaymentProvider {
  createOrder(amount: number, currency: string, metadata: Record<string, string>): Promise<CreateOrderResult>;
  capturePayment(orderId: string): Promise<CaptureResult>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
}

class PayPalProvider implements PaymentProvider {
  // Uses @paypal/checkout-server-sdk
  // Client-side uses @paypal/react-paypal-js
}

class PayNowProvider implements PaymentProvider {
  // Generates PayNow QR code (UEN-based)
  // Verification via webhook or manual confirmation
}
```

### 5c. Payment Flow

1. Client selects payment method
2. API creates order with provider → returns order ID / QR code
3. Client completes payment (PayPal popup / PayNow scan)
4. Provider webhook or client-side capture → API verifies
5. Payment record created with `status: 'completed'`
6. Registration/Application status updated
7. Confirmation email sent via Resend
8. Audit log entry created

### 5d. Refund Policy

- Refunds processed via original payment provider
- Configurable per tenant (full/partial/no refund thresholds)
- Admin can override refund policy
- Refund creates new payment record with `status: 'refunded'`

---

## 6. AI Integration Architecture

### 6a. AI Service Layer

```
┌───────────────────────────────────────────┐
│              AI SERVICE LAYER             │
│                                           │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Chatbot │  │ Fraud    │  │ Content │ │
│  │ Service │  │ Scoring  │  │   Gen   │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘ │
│       │            │             │       │
│  ┌────▼────────────▼─────────────▼────┐  │
│  │         Claude API Client          │  │
│  │  Model: sonnet (chat, content)     │  │
│  │  Model: haiku (scoring, classify)  │  │
│  └────────────────┬───────────────────┘  │
│                   │                      │
│  ┌────────────────▼───────────────────┐  │
│  │     RAG Layer (pgvector)           │  │
│  │  Event embeddings + Member prefs   │  │
│  │  FAQ/Knowledge base embeddings     │  │
│  └────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### 6b. Chatbot Architecture

- **Model:** Claude Sonnet 4.6 for conversational quality
- **RAG:** FAQ entries + event details + membership info stored as embeddings in pgvector
- **System prompt:** Configurable per tenant (org name, personality, language)
- **Languages:** Primary + secondary language from tenant config
- **Fallback:** If confidence < 0.5, suggest contacting admin
- **Session:** Conversation history stored in `chat_conversations` table
- **Rate limit:** 20 messages per session, 5 sessions per hour

### 6c. Fraud Scoring

- **Model:** Claude Haiku 4.5 (fast, cheap, sufficient for classification)
- **Input:** Application data, behavioral signals, historical patterns
- **Output:** Score 0–100 + factor breakdown (JSON)
- **Factors:** Email domain quality (15%), phone carrier (10%), velocity (20%), data consistency (15%), referral validity (20%), behavioral signals (10%), historical patterns (10%)
- **Caching:** Score computed once on submission, re-scored if data changes
- **Threshold:** Configurable per tenant (default: auto-approve < 30, flag > 70)

### 6d. Event Recommendations

- **Method:** Hybrid — collaborative filtering + content-based
- **Embeddings:** Event descriptions → pgvector, member interests → pgvector
- **Signals:** Past attendance, interest tags, family profile, peer behavior
- **Refresh:** Recommendations recalculated daily via cron job
- **Personalization:** Ranked list per member, top 5 shown on dashboard

### 6e. Content Generation

| Feature | Model | Trigger | Output |
|---------|-------|---------|--------|
| Event Recap | Sonnet | Admin clicks "Generate" | 200-word recap from notes + photo count |
| Newsletter | Sonnet | Monthly cron or manual | Full newsletter draft with sections |
| Event Copilot | Sonnet | Admin describes event | Complete event listing (title, desc, schedule, pricing) |
| Photo Captions | Haiku | Photo upload | Auto-tag and caption |

---

## 7. Service Resilience Patterns

### 7a. External Service Dependencies

| Service | Circuit Breaker | Retry | Timeout | Fallback |
|---------|----------------|-------|---------|----------|
| Claude API | Yes (3 failures → open) | 3 retries, exponential backoff + jitter | 15s | Return cached response or static FAQ |
| PayPal | Yes (5 failures → open) | 2 retries | 10s | Show "try again later" + log |
| PayNow | No (QR is static) | N/A | N/A | Manual verification option |
| Twilio (SMS) | Yes (3 failures → open) | 2 retries | 5s | Fall back to email-only verify |
| Resend (Email) | Yes (5 failures → open) | 3 retries | 5s | Queue for retry, log failure |
| Supabase | No (primary dependency) | Built-in connection pooling | 5s | Return 503 |

### 7b. Rate Limiting

```typescript
// Rate limits per endpoint group
const rateLimits = {
  'auth/*': { window: '15m', max: 10 },        // Prevent brute force
  'onboarding/*': { window: '1h', max: 3 },    // Prevent fraud
  'ai/chat': { window: '1h', max: 100 },       // Control AI costs
  'admin/*': { window: '1m', max: 60 },         // Standard admin
  'events': { window: '1m', max: 100 },         // Public browsing
  'payments/*': { window: '15m', max: 10 },     // Payment attempts
};
```

### 7c. Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|-------------|
| Tenant config | In-memory (LRU) | 5 min | On config update |
| Event list (public) | ISR (Next.js) | 60s | On event create/update |
| Event detail | ISR (Next.js) | 30s | On event update |
| Member profile | No cache (always fresh) | — | — |
| AI recommendations | Redis/memory | 24h | Daily cron recalculation |
| FAQ embeddings | pgvector (persistent) | — | On FAQ update |

---

## 8. Frontend Architecture

### 8a. Page Structure (Next.js App Router)

```
src/app/
├── (public)/                  # Public pages (no auth required)
│   ├── page.tsx               # Homepage
│   ├── events/
│   │   ├── page.tsx           # Events listing
│   │   └── [id]/page.tsx      # Event detail
│   ├── about/page.tsx
│   ├── gallery/page.tsx
│   ├── donate/page.tsx
│   ├── volunteer/page.tsx
│   └── sponsor/page.tsx
├── (auth)/                    # Auth pages
│   ├── login/page.tsx
│   └── join/                  # Onboarding wizard
│       └── page.tsx
├── (member)/                  # Member dashboard (requires auth)
│   └── dashboard/
│       ├── page.tsx           # Overview
│       ├── events/page.tsx    # My events
│       ├── profile/page.tsx
│       ├── membership/page.tsx
│       └── notifications/page.tsx
├── (admin)/                   # Admin panel (requires admin role)
│   └── admin/
│       ├── page.tsx           # Dashboard
│       ├── events/page.tsx
│       ├── members/page.tsx
│       ├── applications/page.tsx
│       ├── reports/page.tsx
│       ├── communications/page.tsx
│       ├── config/page.tsx
│       └── chatbot/page.tsx
├── api/v1/                    # API routes (see section 3b)
└── layout.tsx                 # Root layout with navbar, footer, chatbot
```

### 8b. Component Architecture

```
src/components/
├── ui/                        # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── toast.tsx
│   └── ...
├── layout/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── mobile-nav.tsx
├── events/
│   ├── event-card.tsx
│   ├── event-grid.tsx
│   ├── event-calendar.tsx
│   ├── event-filters.tsx
│   ├── event-registration-form.tsx
│   └── event-image-upload.tsx
├── onboarding/
│   ├── stepper.tsx
│   ├── otp-input.tsx
│   ├── tier-selector.tsx
│   ├── referral-lookup.tsx
│   ├── family-details-form.tsx
│   └── payment-step.tsx
├── dashboard/
│   ├── stats-cards.tsx
│   ├── my-events-table.tsx
│   ├── membership-card.tsx
│   └── notification-list.tsx
├── admin/
│   ├── fraud-score-bar.tsx
│   ├── application-queue.tsx
│   ├── pipeline-builder.tsx
│   ├── feature-flags.tsx
│   ├── revenue-chart.tsx
│   └── communication-composer.tsx
├── ai/
│   ├── chatbot-widget.tsx
│   ├── chatbot-panel.tsx
│   └── recommendation-card.tsx
└── shared/
    ├── image-upload.tsx
    ├── payment-methods.tsx
    ├── qr-code.tsx
    └── share-buttons.tsx
```

### 8c. Theming (White-Label)

```typescript
// src/lib/theme.ts
// Tenant branding applied via CSS custom properties
export function applyTenantTheme(config: TenantConfig) {
  document.documentElement.style.setProperty('--primary', config.branding.primaryColor);
  document.documentElement.style.setProperty('--secondary', config.branding.secondaryColor);
  // Logo, org name, etc. from config
}
```

Tenant config fetched on app load via `GET /api/v1/config`, cached in Zustand store.

---

## 9. Email & Notification Architecture

### 9a. Email Templates (React Email + Resend)

```
src/emails/
├── welcome.tsx
├── event-confirmation.tsx
├── event-reminder-48h.tsx
├── event-reminder-2h.tsx
├── membership-renewal.tsx
├── application-approved.tsx
├── application-rejected.tsx
├── donation-thankyou.tsx
├── referral-request.tsx
├── waitlist-promoted.tsx
└── newsletter.tsx
```

All templates built with `@react-email/components`, customizable via tenant config merge tags.

### 9b. Notification Channels

| Channel | Provider | Use Case |
|---------|----------|----------|
| Email | Resend | All transactional + newsletters |
| Push | Web Push API | Event reminders (PWA) |
| In-App | Supabase Realtime | Notifications center in dashboard |
| WhatsApp | Twilio WhatsApp Business | Event reminders, share cards (opt-in) |

### 9c. Event-Driven Notifications

```
Event: registration.created → Send confirmation email + in-app notification
Event: application.approved → Send welcome email + activate membership
Event: application.rejected → Send rejection email with reason
Event: event.reminder.48h → Send reminder email + push + WhatsApp (cron)
Event: event.reminder.2h → Send reminder email + push (cron)
Event: waitlist.promoted → Send promotion email + in-app
Event: payment.completed → Send receipt email
Event: membership.expiring → Send renewal reminder (14 days before)
```

---

## 10. Observability

### 10a. Structured Logging

```typescript
// Every log entry includes:
{
  timestamp: ISO8601,
  level: 'info' | 'warn' | 'error',
  message: string,
  tenant_id: string,
  user_id?: string,
  request_id: string,
  module: string,         // 'events', 'onboarding', 'ai', etc.
  duration_ms?: number,
  metadata?: Record<string, unknown>
}
```

### 10b. Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `http_request_duration_ms` | Histogram | method, route, status |
| `event_registration_total` | Counter | event_id, status |
| `onboarding_step_completion` | Counter | step, success |
| `ai_chat_response_time_ms` | Histogram | model, language |
| `payment_total` | Counter | provider, status |
| `fraud_score_distribution` | Histogram | bucket |
| `active_members` | Gauge | tier |

### 10c. Alerting

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| API error rate > 1% | 5-min window | SEV-2 | Email + Sentry |
| Payment failure rate > 5% | 15-min window | SEV-1 | Email + SMS |
| AI API latency p99 > 10s | 5-min window | SEV-3 | Sentry |
| Fraud score > 90 | Per application | SEV-3 | In-app admin |
| Disk usage > 80% | Per check | SEV-2 | Email |

---

## 11. CI/CD Pipeline

### 11a. GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [development, release, main]
  pull_request:
    branches: [development]

jobs:
  gate-1-precommit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint          # ESLint
      - run: npm run format:check  # Prettier
      - run: npm run type-check    # TypeScript
      - run: npm run test:unit     # Vitest unit tests

  gate-1.5-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
      - run: npx audit-ci --high   # Dependency vulnerabilities

  gate-2-integration:
    needs: [gate-1-precommit, gate-1.5-security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build                    # Verify build succeeds
      - run: npm run test:integration         # Supabase integration tests
      - run: npm run test:e2e                 # Playwright E2E
      - run: npm run test:coverage -- --min=85 # Coverage gate

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: gate-2-integration
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-staging:
    if: github.ref == 'refs/heads/release'
    needs: gate-2-integration
    runs-on: ubuntu-latest
    steps:
      - run: vercel deploy --prod --env staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: gate-2-integration
    runs-on: ubuntu-latest
    steps:
      - run: vercel deploy --prod
```

### 11b. Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Preview | PR branches | `pr-xxx.vercel.app` | PR review |
| Staging | `release` | `staging.communityhub.app` | Pre-prod testing |
| Production | `main` | `events.sts.org.sg` (custom domain) | Live |

---

## 12. Image Handling Architecture

### 12a. Upload Flow

```
Client (drag & drop / file picker)
    │
    ▼ multipart/form-data
POST /api/v1/events/{id}/images
    │
    ▼ Validate (type, size, dimensions)
    │
    ▼ Resize (cover: 1200x630, thumbnail: 400x300, gallery: 800x600)
    │
    ▼ Upload to Supabase Storage (bucket: event-images)
    │
    ▼ Generate signed URL (or public URL)
    │
    ▼ Update event.images JSONB array
    │
    ▼ Return { id, url, thumbnail_url, is_cover }
```

### 12b. Image Processing

- **Server-side resize** via `sharp` (Node.js)
- **Three sizes:** Cover (1200x630), Gallery (800x600), Thumbnail (400x300)
- **Format:** WebP for modern browsers, JPEG fallback
- **Max upload:** 5MB per image, 10 images per event
- **Storage:** Supabase Storage (S3-compatible) with CDN
- **Cover image:** First image by default, changeable via API

### 12c. Image Schema (JSONB in events table)

```json
{
  "images": [
    {
      "id": "uuid",
      "original_url": "https://storage.supabase.co/...",
      "cover_url": "https://storage.supabase.co/.../cover.webp",
      "gallery_url": "https://storage.supabase.co/.../gallery.webp",
      "thumbnail_url": "https://storage.supabase.co/.../thumb.webp",
      "alt_text": "Ugadi ceremony setup",
      "is_cover": true,
      "uploaded_at": "2026-03-29T10:00:00Z"
    }
  ]
}
```

---

## 13. Operational Readiness Checklist

- [ ] **Runbook:** Step-by-step for: restart app, clear cache, reset stuck payment, re-run fraud score, manually approve member
- [ ] **Alerts:** Configured per section 10c thresholds
- [ ] **Dashboards:** Vercel Analytics + Sentry + PostHog dashboards per endpoint
- [ ] **Rollback:** Vercel instant rollback (previous deployment), DB rollback scripts tested
- [ ] **Data backup:** Supabase automated daily backups, point-in-time recovery enabled
- [ ] **Cross-team dependencies:** None (single-tenant, self-contained)
- [ ] **Disaster recovery:** Full Supabase project restore tested, Vercel redeploy from any commit

---

## 14. Security Architecture

### 14a. OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection | Supabase parameterized queries, Zod input validation |
| Broken Auth | Supabase Auth (bcrypt, JWT), httpOnly cookies, CSRF tokens |
| Sensitive Data Exposure | TLS 1.3 everywhere, encryption at rest (Supabase), no PII in logs |
| XXE | No XML parsing, JSON only |
| Broken Access Control | RLS policies, middleware role checks, principle of least privilege |
| Security Misconfiguration | Security headers (see 4c), env validation on deploy |
| XSS | React auto-escaping, CSP headers, DOMPurify for user HTML |
| Insecure Deserialization | Zod schema validation on all inputs |
| Vulnerable Components | Dependabot, `npm audit`, CodeQL in CI |
| Insufficient Logging | Structured logging + audit trail (section 10) |

### 14b. Data Protection (PDPA/GDPR)

- Consent collection at registration (mandatory checkbox)
- Data export: `GET /api/v1/members/{id}/export` returns all member data as JSON
- Data deletion: `DELETE /api/v1/members/{id}` with 30-day grace period
- Data retention: Inactive accounts archived after 2 years
- Audit log: All data access/modification logged

---

## 15. Performance Budgets

| Metric | Budget | Enforcement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse CI in Gate 2 |
| FID | < 100ms | Lighthouse CI |
| CLS | < 0.1 | Lighthouse CI |
| Initial JS (gzipped) | < 250KB | Bundle analyzer in CI |
| TTI (4G mobile) | < 3.5s | Lighthouse CI |
| API p50 latency | < 100ms | Monitoring alert |
| API p99 latency | < 500ms | Monitoring alert |
| Image load | < 1s | WebP + CDN + lazy loading |
