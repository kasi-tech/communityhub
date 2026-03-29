# Security Policy — CommunityHub

## Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@communityhub.sg (or the project maintainer)
2. **Do NOT** open a public GitHub issue for security vulnerabilities.
3. Include a detailed description, reproduction steps, and potential impact.
4. We will acknowledge receipt within 48 hours and aim to resolve critical issues within 7 days.

## Security Headers

The following HTTP security headers are enforced via `next.config.ts` on all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking via iframes |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS (HSTS) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `X-DNS-Prefetch-Control` | `on` | Allow DNS prefetching for performance |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), interest-cohort=()` | Restrict browser APIs, opt out of FLoC |

## Authentication

- **Provider**: Supabase Auth
- **Mechanism**: JWT-based sessions with httpOnly, Secure, SameSite cookies
- **Session refresh**: Handled transparently in Next.js middleware (`src/middleware.ts`)
- **Protected routes**: `/dashboard/*` and `/admin/*` require authentication; unauthenticated users are redirected to `/login`

## Authorization

- **Row-Level Security (RLS)**: All Supabase tables have RLS policies enabled. Queries execute with the user's JWT, so users can only access rows they are authorized to see.
- **Role-based access**: Member roles (`admin`, `member`, etc.) are checked in API routes via `getCurrentUser()` and `isAdmin()` helpers in `@/lib/auth`.

## Input Validation

- All user-supplied input is validated and sanitized before processing (`src/lib/validate.ts`).
- Validation functions cover: email, phone, postal code, UUID, monetary amounts.
- HTML tags are stripped from user input to prevent XSS.
- Null bytes are removed and input length is capped to prevent injection and buffer abuse.

## Rate Limiting

In-memory token-bucket rate limiting is applied per endpoint category (`src/lib/rate-limit.ts`):

| Category | Window | Max Requests |
|----------|--------|-------------|
| Auth (login/signup) | 15 minutes | 10 |
| Onboarding | 1 hour | 3 |
| AI Chat | 1 hour | 100 |
| Payment | 15 minutes | 10 |
| General API | 1 minute | 100 |

## CSRF Protection

- Token-based CSRF protection for all state-changing requests (`src/lib/csrf.ts`).
- Tokens are stored in httpOnly, Secure, SameSite=Strict cookies.
- Mutation endpoints (POST, PATCH, DELETE) validate the `x-csrf-token` header against the cookie value using timing-safe comparison.

## Data Encryption

- **In transit**: All connections use TLS (enforced by HSTS header).
- **At rest**: Supabase encrypts data at rest using AES-256. Database backups are also encrypted.

## Audit Logging

- All state-changing operations are recorded in the `audit_logs` table (`src/lib/audit.ts`).
- Audit entries capture: tenant, actor, action, entity type/ID, details, IP address, and timestamp.
- Writes use the Supabase service-role client to ensure audit records cannot be tampered with by end users.

## Dependency Scanning

- `npm audit` runs in the CI/CD pipeline on every push.
- High-severity dependency vulnerabilities block merges (Gate 1.5).
- Dependabot or equivalent is configured for automatic dependency update PRs.

## PDPA / GDPR Compliance

- **Consent collection**: Users provide explicit consent during onboarding before data is processed.
- **Data export**: Users can request a full export of their personal data.
- **Data deletion**: Users can request account and data deletion; the system purges personal data from all tables.
- **Data minimization**: Only data necessary for platform functionality is collected.
- **Retention**: Inactive accounts and associated data are flagged for review after 24 months of inactivity.

## Reporting a Vulnerability

Please follow the responsible disclosure process above. We take all reports seriously and will work with you to resolve issues promptly.
