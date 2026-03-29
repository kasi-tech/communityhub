# CommunityHub — Product Requirements Specification

**Version:** 1.0
**Date:** 2026-03-29
**Author:** CPO (AI-assisted)
**Status:** Draft — Awaiting User Approval
**Prototype:** `specs/communityhub-platform/prototype/index.html`

---

## 1. Executive Summary

**CommunityHub** is a white-label, single-tenant deployable community management platform that enables any community organization to manage events, memberships, and community engagement with AI-powered features and configurable fraud prevention.

**Business Goal:** Replace outdated, static community websites with a modern, mobile-first platform that drives event participation, simplifies membership management, and keeps communities engaged year-round.

**First Tenant:** Singapore Telugu Samajam (STS) — replacing events.sts.org.sg

---

## 2. User Evidence

### 2a. Analysis of Current STS Site (events.sts.org.sg)

| Finding | Source | Implication |
|---------|--------|-------------|
| No online event registration exists | Site audit | Members cannot register online — core mission failure |
| Event content frozen since ~2017 | Site audit | Site appears abandoned, erodes trust |
| Social media links are broken (`#` placeholders) | Site audit | Zero social engagement pipeline |
| Email links use `javascript:;` — non-functional | Site audit | Members cannot contact leadership |
| Membership form has no validation | Site audit | High drop-off, potential for fraudulent submissions |
| Mobile layout broken (fixed 300px sidebars) | Site audit | 60%+ mobile users have poor experience |
| No search, no filters, no calendar view | Site audit | Event discovery is friction-heavy |
| Videos section exists but is empty | Site audit | Broken feature erodes credibility |

### 2b. Competitive Analysis

| Feature | STS (Current) | SINDA | TAS | Eventbrite | CommunityHub (Proposed) |
|---------|--------------|-------|-----|-----------|------------------------|
| Event discovery | Category tabs | Calendar + filters | Card grid | Full search + filters + map | Calendar + search + filters + AI recommendations |
| Online registration | None | Full online + payment | Google Forms | Full + payment | 1-click for members, stepped for guests |
| Mobile experience | Broken | Responsive | Responsive | Native app | Mobile-first PWA |
| Member portal | Basic verify | Dashboard | Basic | N/A | Full dashboard + history |
| Fraud prevention | reCAPTCHA only | Unknown | None | Email verify | Multi-layer: OTP + email + referral + admin gate + AI scoring |
| AI features | None | None | None | Basic recommendations | Full: chatbot, recommendations, content gen, fraud scoring |
| Multi-language | English only | English | English | Multi | Configurable bilingual (AI-powered) |
| Self-hostable | No | No | No | No | Yes — single-tenant deployable |

### 2c. Assumptions [ASSUMPTION]

- [ASSUMPTION] 70%+ of community members access the site via mobile devices
- [ASSUMPTION] Average community org has 200–2,000 members
- [ASSUMPTION] Committee members have limited technical skills — admin panel must be simple
- [ASSUMPTION] Most orgs want PayPal + local payment (PayNow, UPI, etc.)
- [ASSUMPTION] Bilingual AI chatbot will significantly increase engagement for non-English-primary communities

---

## 3. User Personas & JTBD

### Persona 1: Community Member ("Ravi")
- **Role:** Active member, working professional, age 30–50
- **Goal:** Find events, register family, stay connected between events
- **JTBD:** "When there's a community event, I want to quickly register my family so we don't miss out"
- **Pain Points:** Can't find events easily, no online registration, no reminders, no way to see event photos after

### Persona 2: New Joiner ("Priya")
- **Role:** Potential member, recently moved to the area, age 25–40
- **Goal:** Discover the community, understand benefits, join easily
- **JTBD:** "When I'm new to an area, I want to find my cultural community and join easily so I feel at home"
- **Pain Points:** Unclear value proposition, confusing registration, no social proof

### Persona 3: Committee Admin ("Suresh")
- **Role:** Organization committee member, age 40–60, limited tech skills
- **Goal:** Create events, manage registrations, communicate with members, track finances
- **JTBD:** "When I organize an event, I want to publish it and track RSVPs so I can plan logistics accurately"
- **Pain Points:** Manual processes, no registration data, can't send targeted communications

### Persona 4: Org Super Admin ("Lakshmi")
- **Role:** Organization president/secretary, manages platform configuration
- **Goal:** Configure branding, membership tiers, payment providers, onboarding rules
- **JTBD:** "When setting up the platform, I want to customize it for my community without needing a developer"
- **Pain Points:** Depends on developers for every change, no self-service admin

### Persona 5: Donor/Sponsor ("Vikram")
- **Role:** Individual or business sponsor, age 35–55
- **Goal:** Contribute financially, gain visibility in the community
- **JTBD:** "When I want to support the community, I want a simple way to donate and see my contribution's impact"
- **Pain Points:** Unclear donation process, no visibility/acknowledgment

---

## 4. Glossary

| Term | Definition |
|------|-----------|
| **Tenant** | A single organization deployment of CommunityHub |
| **Member** | A registered, approved, and paid-up member of the organization |
| **Guest** | A non-member who can browse events but must join to register |
| **Committee Admin** | Organization volunteer with admin panel access |
| **Super Admin** | Top-level admin who configures tenant settings |
| **Onboarding Pipeline** | The configurable sequence of verification steps for new member registration |
| **Fraud Score** | AI-generated risk score (0–100) for each registration attempt |
| **Event RSVP** | Registration for an event (free or paid) |
| **Feature Flag** | Configuration toggle to enable/disable features per tenant |

---

## 5. Functional Requirements

### Module 1: Public Site & Event Discovery

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-101 | Public homepage with org branding, hero banner, upcoming events, community stats | Homepage loads in <2s, shows next 3 events, member count, configurable hero | P0 |
| REQ-102 | Event listing page with card-based display | Each card shows: image, title, date, time, venue, price, spots remaining, "Register" CTA | P0 |
| REQ-103 | Event calendar view (monthly) | Toggle between card and calendar view; events appear as dots on dates; clicking a date shows events | P1 |
| REQ-104 | Event search (full-text) | Search by title, description, category; results update in <500ms | P1 |
| REQ-105 | Event filters | Filter by: category (configurable taxonomy), date range, free/paid, has-spots | P1 |
| REQ-106 | Event detail page | Hero image, full description, agenda/schedule, venue with embedded map, speaker profiles, share buttons, registration form | P0 |
| REQ-107 | Past events gallery | Photo grid per event, AI-generated recap text, video embeds | P2 |
| REQ-108 | Responsive mobile-first design | All pages functional at 375px, 768px, 1280px breakpoints; touch targets ≥48px | P0 |
| REQ-109 | PWA support | Add-to-homescreen prompt, offline event list cache, push notification capability | P2 |
| REQ-110 | SEO optimization | SSR pages, meta tags, Open Graph tags, sitemap.xml, robots.txt | P1 |
| REQ-111 | WhatsApp/Telegram share buttons on events | Deep link share generates event preview card | P1 |

### Module 2: Fraud-Resistant Member Onboarding

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-201 | Multi-step registration wizard with progress bar | Steps displayed with visual progress; back/forward navigation; data preserved between steps | P0 |
| REQ-202 | Phone OTP verification (Step 1) | Send OTP via SMS (Twilio); 6-digit code; 60s cooldown; 3 max attempts; configurable: can be disabled per tenant | P0 |
| REQ-203 | Email verification (Step 2) | Magic link or 6-digit code sent to email; expires in 24h; configurable: can be disabled | P0 |
| REQ-204 | Personal details form (Step 3) | Name, DOB, gender, nationality, address, interests (checkboxes); real-time validation on all fields | P0 |
| REQ-205 | Membership tier selection (Step 4) | Display tiers (configurable per tenant) with pricing comparison; clear feature differentiation | P0 |
| REQ-206 | Existing member referral (Step 5) | Enter referrer's member ID or phone; referrer receives notification (email/SMS) to confirm; configurable: mandatory or optional per tenant | P0 |
| REQ-207 | Payment gateway (Step 6) | PayPal and PayNow integration; show itemized total with any service charges; payment confirmation | P0 |
| REQ-208 | AI fraud scoring | Score each registration 0–100 based on: velocity (registrations per IP/device), data consistency, phone carrier type, email domain, referral validity; flag score >70 for manual review | P1 |
| REQ-209 | Admin approval queue | New registrations appear in admin panel as "Pending"; admin can Approve/Reject with reason; bulk approve; auto-approve if fraud score <30 and all verifications pass (configurable threshold) | P0 |
| REQ-210 | Duplicate detection | Fuzzy match on name + DOB + phone + email; alert admin if similarity >80%; block if exact match | P0 |
| REQ-211 | Application status page | Applicant can check status: Submitted → Under Review → Approved/Rejected; email notifications at each transition | P0 |
| REQ-212 | Configurable onboarding pipeline | Super admin can enable/disable each step (OTP, email, referral, payment, admin gate); reorder steps; set auto-approve threshold | P1 |
| REQ-213 | Rate limiting | Max 3 registration attempts per IP per hour; max 5 OTP requests per phone per day; CAPTCHA on 2nd attempt | P0 |
| REQ-214 | Geo-validation | Optional: validate postal code format per country; IP geolocation check | P2 |
| REQ-215 | Family membership support | Add spouse + children details during registration; family members linked to primary account | P1 |
| REQ-216 | PDPA/GDPR consent | Mandatory privacy policy consent checkbox with link to policy; data retention policy displayed | P0 |

### Module 3: Event Registration & Payment

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-301 | Member 1-click event registration | Logged-in members see pre-filled registration; single "Register" button; confirmation in <3s | P0 |
| REQ-302 | Guest event viewing (no registration) | Non-members can browse all events but see "Join to Register" CTA instead of registration form | P0 |
| REQ-303 | Event registration form | Fields: number of adults, children, dietary preferences (configurable), special requirements; auto-calculate total | P0 |
| REQ-304 | Event payment (for paid events) | PayPal + PayNow; free events skip payment; partial payment/deposit option (configurable) | P0 |
| REQ-305 | Registration confirmation | Email + in-app confirmation; calendar invite (.ics) attachment; QR code for check-in | P0 |
| REQ-306 | Event waitlist | When spots are full, allow waitlist join; auto-promote when spot opens; notify via email | P1 |
| REQ-307 | Event cancellation by member | Cancel registration; refund policy displayed (configurable); spot released to waitlist | P1 |
| REQ-308 | Add-to-calendar | Google Calendar, Apple Calendar, Outlook links; .ics download | P1 |
| REQ-309 | Event reminders | Automated: 48h before, 2h before (configurable); via email + optional WhatsApp | P1 |
| REQ-310 | Check-in system | QR code scan at venue; admin can mark attendance manually; real-time attendance count | P2 |

### Module 4: AI-Powered Features

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-401 | AI chatbot (bilingual) | Floating chat widget; answers event questions, membership queries, navigation help; supports configurable languages; Claude API powered | P0 |
| REQ-402 | Smart event recommendations | "Events for You" section based on: past attendance, interest tags, family profile, peer behavior | P1 |
| REQ-403 | AI event recap generator | After event, auto-generate 200-word recap from organizer notes + photo count; publishable to past events | P1 |
| REQ-404 | AI newsletter generator | Monthly auto-curated newsletter: upcoming events, last month recap, member milestones, cultural calendar | P2 |
| REQ-405 | Event creation copilot (admin) | Admin describes event in natural language; AI generates: listing, form fields, pricing, schedule | P1 |
| REQ-406 | Attendance prediction | AI predicts attendance based on: event type history, registration velocity, seasonality | P2 |
| REQ-407 | Sentiment analysis on feedback | Post-event feedback analyzed; topic extraction; actionable summary for committee | P2 |
| REQ-408 | AI fraud scoring for registrations | Behavioral analysis of registration patterns; risk score; integrated with REQ-208 | P1 |
| REQ-409 | Intelligent photo gallery | Auto-tagging, smart search ("photos from Diwali with kids"), auto-album creation | P2 |
| REQ-410 | Chatbot knowledge base management | Admin can add FAQ entries, correct chatbot responses; RAG over org content | P1 |

### Module 5: Member Dashboard

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-501 | Member login (email + password, magic link, OAuth) | Supabase Auth; email/password + magic link + Google OAuth; session persistence | P0 |
| REQ-502 | Member profile management | Edit personal details, interests, family members, profile photo, notification preferences | P0 |
| REQ-503 | My events (upcoming + past) | List of registered events with status (Confirmed, Waitlisted, Cancelled); past events with photos | P0 |
| REQ-504 | Membership status & renewal | Show: membership type, expiry date, renewal CTA, payment history | P0 |
| REQ-505 | Notification center | In-app notifications for: event reminders, registration confirmations, membership status changes, committee messages | P1 |
| REQ-506 | Event feedback submission | Post-event: 1–5 star rating + optional text feedback; linked to AI sentiment analysis (REQ-407) | P2 |

### Module 6: Admin Panel

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-601 | Admin dashboard | Overview: total members, upcoming events, pending registrations, recent activity, revenue summary | P0 |
| REQ-602 | Event CRUD (create, read, update, delete) | Create event with: title, description, date/time, venue, capacity, pricing, categories, images; edit/archive | P0 |
| REQ-603 | Registration management per event | View registrations list; filter by status; export CSV; mark attendance; send bulk messages | P0 |
| REQ-604 | Member management | View all members; search/filter; view profile; edit status (Active, Suspended, Expired); export | P0 |
| REQ-605 | Membership approval queue | Pending applications with fraud score; approve/reject with reason; bulk actions; auto-approve rules | P0 |
| REQ-606 | Tenant configuration | Branding (name, logo, colors, domain); membership tiers; payment providers; onboarding pipeline; feature flags | P0 |
| REQ-607 | Financial reports | Revenue by event, membership fees collected, donation totals; export to CSV/PDF | P1 |
| REQ-608 | Communication tools | Send email/notification to: all members, event registrants, specific segments; template editor | P1 |
| REQ-609 | AI chatbot management | View conversation logs; add/edit FAQ entries; train on new content; view satisfaction scores | P1 |
| REQ-610 | Audit log | All admin actions logged: who, what, when; searchable; exportable | P1 |

### Module 7: Tenant Configuration (White-Label)

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-701 | Branding configuration | Org name, logo (light/dark), primary/secondary colors, favicon, custom CSS override | P0 |
| REQ-702 | Custom domain support | Map custom domain to deployment; SSL auto-provisioning | P1 |
| REQ-703 | Configurable membership tiers | Define N tiers with: name, price, duration (annual/lifetime/custom), benefits list, family option | P0 |
| REQ-704 | Payment provider configuration | Enable/disable: PayPal, PayNow; configure API keys; set service charge % | P0 |
| REQ-705 | Onboarding pipeline builder | Drag-and-drop step ordering; toggle each verification step; set auto-approve threshold | P1 |
| REQ-706 | Event category taxonomy | Define custom event categories (e.g., Cultural, Sports, Religious, Social, AGM) | P0 |
| REQ-707 | Email template customization | Customize: welcome email, event confirmation, reminders, newsletter; merge tags for personalization | P1 |
| REQ-708 | Language configuration | Set primary + secondary language; AI chatbot language; UI string overrides | P1 |
| REQ-709 | Feature flags | Toggle modules: AI chatbot, recommendations, newsletter, gallery, donations, volunteering | P0 |
| REQ-710 | Seed data / demo mode | Pre-populated demo data for new deployments; reset to seed state | P2 |

### Module 8: Donations & Volunteering

| REQ ID | Requirement | Acceptance Criteria | Priority |
|--------|------------|-------------------|----------|
| REQ-801 | Donation page | Accept one-time donations via PayPal/PayNow; configurable suggested amounts; custom amount | P1 |
| REQ-802 | Donor acknowledgment | Auto thank-you email with receipt; optional public donor wall (with consent) | P2 |
| REQ-803 | Volunteer registration | Form: availability, skills, interests; admin can assign to events | P2 |
| REQ-804 | Sponsorship tiers | Display sponsor packages with benefits; inquiry form; sponsor logo showcase | P2 |

---

## 6. Non-Functional Requirements

| NFR ID | Requirement | Target |
|--------|------------|--------|
| NFR-01 | Page load (LCP) | < 2.5s on 4G mobile |
| NFR-02 | First Input Delay (FID) | < 100ms |
| NFR-03 | Cumulative Layout Shift (CLS) | < 0.1 |
| NFR-04 | Initial JS bundle (gzipped) | < 250KB |
| NFR-05 | Time to Interactive (TTI) | < 3.5s on 4G mobile |
| NFR-06 | API response time (p99) | < 500ms |
| NFR-07 | Uptime SLA | 99.9% |
| NFR-08 | Concurrent users | 500+ without degradation |
| NFR-09 | Data encryption | At rest (AES-256) + in transit (TLS 1.3) |
| NFR-10 | PDPA/GDPR compliance | Consent collection, data export, deletion on request |
| NFR-11 | WCAG 2.1 AA accessibility | Full compliance |
| NFR-12 | Browser support | Chrome, Safari, Firefox, Edge (last 2 versions) |
| NFR-13 | Deployment | Docker container or Vercel serverless |

---

## 7. Success Metrics

### Primary KPI
- **Event registration rate:** 60% of event attendees register online within 6 months of launch

### Secondary KPIs
- New member sign-ups: 15+/month (up from ~2/month manual)
- Mobile bounce rate: <35% (estimated current: ~70%)
- Time-to-register for event: <60 seconds for members
- Member retention (annual renewal rate): >80%

### Leading Indicators
- Chatbot engagement: >20% of visitors interact with AI chatbot
- Event page views: 3x increase within 3 months
- Registration completion rate (start-to-finish): >70%
- Admin event creation time: <5 minutes with AI copilot

### Analytics Events Table

| Event Name | Trigger | Properties | KPI it feeds |
|------------|---------|------------|-------------|
| `page_view` | Any page load | page, referrer, device_type | Traffic |
| `event_card_click` | User clicks event card | event_id, source (home/list/search) | Event discovery |
| `event_register_start` | User clicks "Register" on event | event_id, is_member, is_paid | Registration rate |
| `event_register_complete` | Registration confirmed | event_id, attendee_count, total_paid | Registration rate |
| `event_register_abandon` | User leaves mid-registration | event_id, step_abandoned, time_spent | Drop-off analysis |
| `membership_start` | User begins onboarding | referral_source | Member acquisition |
| `membership_step_complete` | Completes an onboarding step | step_name (otp/email/details/tier/referral/payment) | Funnel analysis |
| `membership_abandon` | User leaves onboarding | step_abandoned, time_spent | Drop-off analysis |
| `membership_approved` | Admin approves membership | fraud_score, auto_approved | Approval rate |
| `membership_rejected` | Admin rejects membership | fraud_score, rejection_reason | Fraud detection |
| `chatbot_open` | User opens AI chatbot | page, is_member | Chatbot engagement |
| `chatbot_message` | User sends message to chatbot | intent_detected, language | Chatbot usage |
| `chatbot_resolution` | Chatbot resolves query without escalation | intent, satisfaction_rating | Chatbot effectiveness |
| `donation_complete` | Donation payment confirmed | amount, payment_method | Donation revenue |
| `event_share` | User shares event | event_id, share_platform (whatsapp/telegram/copy) | Viral growth |
| `event_reminder_click` | User clicks reminder notification | event_id, reminder_type (48h/2h) | Reminder effectiveness |
| `admin_event_create` | Admin creates new event | creation_method (manual/ai_copilot), time_spent | Admin efficiency |
| `search_performed` | User searches events | query, results_count | Search usage |
| `newsletter_open` | Member opens AI newsletter | newsletter_id | Newsletter engagement |

---

## 8. Onboarding Pipeline — Configurable Fraud Prevention

### Default Pipeline (STS Configuration)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING PIPELINE                          │
│                                                                 │
│  Step 1: Phone OTP ──→ Step 2: Email Verify ──→ Step 3: Details│
│     [ON/OFF]              [ON/OFF]                [ALWAYS ON]   │
│                                                                 │
│  Step 4: Tier Select ──→ Step 5: Referral ──→ Step 6: Payment  │
│     [ALWAYS ON]           [ON/OFF]             [ON/OFF]         │
│                                                                 │
│  ──→ AI Fraud Score (background) ──→ Admin Queue or Auto-Approve│
│         [ON/OFF]                      [threshold: 0-100]        │
└─────────────────────────────────────────────────────────────────┘
```

### Fraud Prevention Layers

| Layer | Mechanism | Configurable | Default |
|-------|-----------|-------------|---------|
| L1 — Rate Limiting | Max 3 signups/IP/hour, 5 OTPs/phone/day | Thresholds adjustable | ON |
| L2 — Bot Prevention | reCAPTCHA v3 (invisible) on 2nd attempt | Enable/disable | ON |
| L3 — Phone OTP | SMS verification via Twilio | Enable/disable | ON |
| L4 — Email Verify | Magic link or 6-digit code | Enable/disable | ON |
| L5 — Data Validation | Real-time field validation, format checks | Always on | ON |
| L6 — Duplicate Detection | Fuzzy match: name+DOB+phone+email (>80% similarity) | Threshold adjustable | ON |
| L7 — Member Referral | Existing member must confirm the referral | Mandatory/optional/off | Mandatory |
| L8 — AI Fraud Scoring | Claude API analyzes: velocity, data patterns, device fingerprint, email domain | Enable/disable, threshold | ON (threshold: 70) |
| L9 — Payment Gate | Payment required to activate membership | Enable/disable | ON |
| L10 — Admin Approval | Manual review queue for flagged applications | Auto-approve threshold, always-review | ON (auto-approve <30) |

### Fraud Score Factors (REQ-208 Detail)

| Factor | Weight | Signal |
|--------|--------|--------|
| Registration velocity | 20% | Multiple signups from same IP/device in short window |
| Email domain quality | 15% | Disposable email domains score high risk |
| Phone carrier type | 10% | VoIP/virtual numbers score higher risk |
| Data consistency | 15% | Name vs email mismatch, impossible DOB, etc. |
| Referral validity | 20% | Invalid referrer, referrer declined, no referral |
| Behavioral signals | 10% | Time on form (too fast = bot), copy-paste patterns |
| Historical patterns | 10% | Similar to previously rejected applications |

---

## 9. State Machine — Member Lifecycle

```
                    ┌──────────┐
                    │  GUEST   │ (browsing, not registered)
                    └────┬─────┘
                         │ starts onboarding
                    ┌────▼─────┐
                    │ APPLYING │ (in onboarding pipeline)
                    └────┬─────┘
                         │ completes all steps
                    ┌────▼─────┐
               ┌────┤ PENDING  │ (awaiting admin review)
               │    └────┬─────┘
               │         │ admin approves        │ admin rejects
               │    ┌────▼─────┐           ┌─────▼────┐
               │    │  ACTIVE  │           │ REJECTED │
               │    └────┬─────┘           └──────────┘
               │         │ membership expires
               │    ┌────▼─────┐
               │    │ EXPIRED  │──→ renews ──→ ACTIVE
               │    └──────────┘
               │
               │ auto-approved (fraud score < threshold)
               └──────────────────────────→ ACTIVE
```

### Event Registration States

```
    ┌───────────┐
    │ AVAILABLE │ (event has spots)
    └─────┬─────┘
          │ member registers
    ┌─────▼─────┐
    │ CONFIRMED │──→ member cancels ──→ CANCELLED ──→ spot to waitlist
    └───────────┘
          │ event full
    ┌─────▼─────┐
    │ WAITLISTED│──→ spot opens ──→ CONFIRMED (auto-promote + notify)
    └───────────┘
```

---

## 10. Entity Relationship Overview

### Core Entities

| Entity | Key Fields | Relations |
|--------|-----------|-----------|
| **Tenant** | id, name, slug, branding, config | Has many: Members, Events, Tiers |
| **Member** | id, tenant_id, name, email, phone, status, fraud_score | Belongs to: Tenant, Tier; Has many: Registrations, FamilyMembers |
| **MembershipTier** | id, tenant_id, name, price, duration, benefits | Belongs to: Tenant; Has many: Members |
| **Event** | id, tenant_id, title, description, date, venue, capacity, price, categories | Belongs to: Tenant; Has many: Registrations |
| **Registration** | id, event_id, member_id, status, attendee_count, total_paid | Belongs to: Event, Member |
| **Payment** | id, registration_id OR member_id, amount, provider, status, reference | Belongs to: Registration or Member |
| **OnboardingApplication** | id, tenant_id, step_data, current_step, fraud_score, status | Belongs to: Tenant |
| **ChatConversation** | id, member_id/session_id, messages[], satisfaction | Belongs to: Member (optional) |
| **AuditLog** | id, tenant_id, admin_id, action, entity, details, timestamp | Belongs to: Tenant |

---

## 11. Wireframe Descriptions (Prototype Reference)

### Page 1: Homepage
- **Hero:** Full-width banner with configurable background image, org name, tagline, "Explore Events" + "Join Us" CTAs
- **Upcoming Events:** 3 event cards in horizontal scroll (mobile) or row (desktop)
- **Community Stats:** 4 counters: Members, Events This Year, Volunteer Hours, Years Active
- **AI Chatbot:** Floating widget bottom-right, opens chat panel
- **Footer:** Org info, quick links, social media, powered by CommunityHub

### Page 2: Events Listing
- **Header:** "Events" with toggle: Card View | Calendar View
- **Filters bar:** Category dropdown, Date range picker, Free/Paid toggle, Search input
- **Event cards grid:** 2 cols desktop, 1 col mobile; each card per REQ-102
- **Pagination:** Infinite scroll with "Load more" button

### Page 3: Event Detail
- **Hero image** with overlay: title, date, time, venue
- **Info bar:** Date, time, venue (map link), price, spots remaining
- **Tabs:** Description | Schedule | Speakers | Gallery
- **Registration section:** Inline form (REQ-303); shows "Join to Register" for non-members
- **Share bar:** WhatsApp, Telegram, Copy Link
- **Related events:** 3 cards at bottom

### Page 4: Membership Onboarding (Multi-Step)
- **Progress bar:** Steps 1–6 with labels, current step highlighted
- **Each step full-width** with clear instructions, validation, back/next buttons
- **Step 1 — Phone OTP:** Phone input with country code; "Send OTP" button; 6-digit input; timer
- **Step 2 — Email Verify:** Email input; "Send Code" button; 6-digit input or "Check Email" for magic link
- **Step 3 — Personal Details:** Name, DOB, gender, nationality, address, interests checklist
- **Step 4 — Membership Tier:** Comparison cards (like pricing tables); select one
- **Step 5 — Referral:** Member ID or phone input; referrer name auto-displays; "Skip" if optional
- **Step 6 — Payment:** PayPal button + PayNow QR code; total displayed
- **Confirmation:** Success animation; "Application Submitted" message; status tracker

### Page 5: Member Dashboard
- **Sidebar nav:** My Events, Profile, Membership, Notifications
- **My Events:** Upcoming (with cancel option) + Past (with feedback option)
- **Profile:** Editable personal details, photo upload, interest tags
- **Membership:** Status card, renewal CTA, payment history table

### Page 6: Admin Panel
- **Sidebar nav:** Dashboard, Events, Members, Applications, Configuration, Reports, AI Chatbot
- **Dashboard:** 4 stat cards (members, pending apps, upcoming events, revenue) + recent activity feed
- **Events management:** Table with CRUD actions; click to view registrations
- **Applications queue:** Fraud score badge (green/yellow/red); approve/reject buttons; detail expandable
- **Configuration:** Tabbed: Branding, Tiers, Payments, Onboarding Pipeline, Categories, Emails, Flags

---

## 12. Out of Scope (v1)

- Native mobile apps (iOS/Android) — PWA covers mobile
- Multi-tenant SaaS billing — single-tenant deployable only
- Complex role-based permissions beyond Admin/Super Admin/Member
- Integration with external CRMs (Salesforce, HubSpot)
- Advanced financial accounting (use CSV exports + external tools)
- Event ticketing with seat selection
- Live streaming integration

---

## 13. Dependencies & Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Twilio SMS costs for OTP | Medium | Low | Configurable: can disable OTP; use email-only verify |
| Claude API rate limits | Low | Medium | Implement caching, fallback to static FAQ |
| PayNow integration complexity | Medium | Medium | Start with PayPal; add PayNow in Phase 2 |
| Low admin tech literacy | High | Medium | AI copilot for event creation; simple UI; admin onboarding guide |
| Community adoption resistance | Medium | High | Gradual rollout; keep old site running temporarily |
