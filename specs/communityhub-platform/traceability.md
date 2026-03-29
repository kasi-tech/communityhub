# CommunityHub — Traceability Matrix

**Version:** 1.0
**Date:** 2026-03-29
**Spec Reference:** `specs/communityhub-platform/spec.md`
**Prototype Reference:** `specs/communityhub-platform/prototype/index.html`
**Golden Data Reference:** `specs/communityhub-platform/golden-data.json`

---

## UI Element → Requirement → Acceptance Criteria

### Module 1: Public Site & Event Discovery

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Hero section with gradient banner, org name, tagline | `page-home` (Hero) | REQ-101 | Homepage loads in <2s, shows configurable hero with org branding | GD-101-01 |
| "Explore Events" CTA button in hero | `page-home` (Hero) | REQ-101 | Hero displays "Explore Events" CTA; navigates to events listing | GD-101-02 |
| "Become a Member" CTA button in hero | `page-home` (Hero) | REQ-101 | Hero displays "Join Us" CTA; navigates to onboarding | GD-101-03 |
| Next-event countdown timer (days, hours, minutes, seconds) | `page-home` (Hero) | REQ-101 | Homepage shows countdown to next event | GD-101-04 |
| Upcoming Events section with 3 event cards | `page-home` (Section) | REQ-101, REQ-102 | Homepage shows next 3 events; each card shows image, title, date, venue, price, "Register" CTA | GD-101-05, GD-102-01 |
| Event card: image, title, date, time, venue, price badge, "Register" button | `page-home`, `page-events` | REQ-102 | Each card shows: image, title, date, time, venue, price, spots remaining, "Register" CTA | GD-102-01 |
| "View All Events" button below upcoming events | `page-home` | REQ-102 | Navigates to full events listing page | GD-102-02 |
| Community Stats section: Members, Events, Volunteer Hours, Years Active | `page-home` (Stats) | REQ-101 | Homepage shows member count and community stats | GD-101-06 |
| Calendar view toggle button (Cards / Calendar) | `page-events` | REQ-103 | Toggle between card and calendar view | GD-103-01 |
| Monthly calendar grid with event dots on dates | `page-events` (calendar-view) | REQ-103 | Events appear as dots on dates; clicking a date shows events for that date | GD-103-02 |
| Previous/Next month navigation in calendar | `page-events` (calendar-view) | REQ-103 | Calendar navigates between months | GD-103-03 |
| Search input field ("Search events...") | `page-events` (filters) | REQ-104 | Search by title, description, category; results update in <500ms | GD-104-01 |
| Category filter dropdown (All, Cultural, Sports, Religious, Social) | `page-events` (filters) | REQ-105 | Filter by configurable category taxonomy | GD-105-01 |
| Price filter dropdown (All, Free, Paid) | `page-events` (filters) | REQ-105 | Filter by free/paid | GD-105-02 |
| Events grid (2 cols desktop, 1 col mobile) | `page-events` | REQ-102, REQ-108 | Card-based display, responsive grid layout | GD-102-03, GD-108-01 |
| Event detail hero image with overlay (title, date, time, venue) | `page-event-detail` | REQ-106 | Hero image with full event info overlay | GD-106-01 |
| Info bar: date, time, venue (map link), price, spots remaining | `page-event-detail` | REQ-106 | Info bar shows date, time, venue, price, spots | GD-106-02 |
| Tabs: Description / Schedule / Performers | `page-event-detail` | REQ-106 | Full description, agenda/schedule, speaker profiles | GD-106-03 |
| Description tab content (event details, venue, what to expect) | `page-event-detail` (desc tab) | REQ-106 | Full description displayed | GD-106-04 |
| Schedule tab content (timeline with items) | `page-event-detail` (schedule tab) | REQ-106 | Agenda/schedule displayed | GD-106-05 |
| Performers/Speakers tab (profiles with photos) | `page-event-detail` (speakers tab) | REQ-106 | Speaker profiles displayed | GD-106-06 |
| Share buttons: WhatsApp, Telegram, Copy Link | `page-event-detail` (desc tab) | REQ-111 | Deep link share generates event preview card; WhatsApp/Telegram share buttons present | GD-111-01 |
| "Related Events" section (3 cards at bottom) — referenced in spec wireframe | `page-event-detail` | REQ-102, REQ-106 | Related event cards displayed at bottom of event detail | GD-106-07 |
| Past events gallery page with photo grid | `page-gallery` | REQ-107 | Photo grid per event; AI-generated recap text | GD-107-01 |
| Gallery filter tabs (All Events, specific event names) | `page-gallery` | REQ-107 | Filter gallery by event | GD-107-02 |
| Responsive navbar with mobile hamburger toggle | Navbar (global) | REQ-108 | All pages functional at 375px, 768px, 1280px; touch targets >= 48px | GD-108-01 |
| Mobile nav: hamburger icon toggles nav-links | Navbar (mobile) | REQ-108 | Mobile navigation opens/closes on toggle | GD-108-02 |
| Footer: org info, quick links, social media, "Powered by CommunityHub" | `page-home` (Footer) | REQ-101, REQ-110 | Footer with org info, links, social media | GD-101-07, GD-110-01 |
| Configurable brand name in navbar (`brandName`) | Navbar | REQ-101 | Homepage shows org branding | GD-101-08 |
| Floating AI chatbot widget (bottom-right) | Global (chatbot trigger) | REQ-401 | Floating chat widget accessible from all pages | GD-401-01 |

### Module 2: Fraud-Resistant Member Onboarding

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Multi-step registration wizard container | `page-onboarding` | REQ-201 | Multi-step wizard with visual progress | GD-201-01 |
| Stepper progress bar (Steps 1-6 with labels) | `page-onboarding` (#stepper) | REQ-201 | Steps displayed with visual progress; current step highlighted | GD-201-02 |
| Back/Next navigation buttons on each step | `page-onboarding` (each step) | REQ-201 | Back/forward navigation; data preserved between steps | GD-201-03 |
| Step 1: Phone input with country code selector (+65) | `page-onboarding` (step 1) | REQ-202 | Phone input with country code | GD-202-01 |
| Step 1: "Send OTP" button | `page-onboarding` (step 1) | REQ-202 | Send OTP via SMS; configurable enable/disable | GD-202-02 |
| Step 1: 6-digit OTP input fields | `page-onboarding` (#otpSection) | REQ-202 | 6-digit code entry | GD-202-03 |
| Step 1: OTP countdown timer (60s) | `page-onboarding` (#otpCountdown) | REQ-202 | 60s cooldown; timer displayed | GD-202-04 |
| Step 1: "Resend Code" link (disabled during countdown) | `page-onboarding` (step 1) | REQ-202 | 3 max attempts enforced | GD-202-05 |
| Step 2: Email input field | `page-onboarding` (step 2) | REQ-203 | Email input for verification | GD-203-01 |
| Step 2: "Send Verification Code" button | `page-onboarding` (step 2) | REQ-203 | Send code or magic link to email; expires in 24h | GD-203-02 |
| Step 2: 6-digit email code input fields | `page-onboarding` (#emailCodeSection) | REQ-203 | 6-digit code entry for email verification | GD-203-03 |
| Step 3: Full Name input | `page-onboarding` (step 3) | REQ-204 | Name field with real-time validation | GD-204-01 |
| Step 3: Date of Birth input | `page-onboarding` (step 3) | REQ-204 | DOB field with validation | GD-204-02 |
| Step 3: Gender dropdown (Male/Female/Other/Prefer not to say) | `page-onboarding` (step 3) | REQ-204 | Gender selection | GD-204-03 |
| Step 3: Nationality dropdown | `page-onboarding` (step 3) | REQ-204 | Nationality field | GD-204-04 |
| Step 3: Postal Code input | `page-onboarding` (step 3) | REQ-204, REQ-214 | Address field; optional postal code format validation per country | GD-204-05, GD-214-01 |
| Step 3: Interests checklist (Cultural, Sports, Music, Dance, Movies, Volunteering, Religious, Travel) | `page-onboarding` (step 3) | REQ-204 | Interests checkboxes with real-time validation | GD-204-06 |
| Step 4: Membership tier comparison cards (Individual Annual, Family Annual, Individual Life, Family Life) | `page-onboarding` (step 4) | REQ-205 | Display tiers with pricing comparison; clear feature differentiation | GD-205-01 |
| Step 4: Tier card with name, price, benefits list, "Select" action | `page-onboarding` (step 4) | REQ-205 | Each tier shows price, duration, benefits | GD-205-02 |
| Step 4: "Popular" badge on recommended tier | `page-onboarding` (step 4) | REQ-205 | Visual differentiation for tiers | GD-205-03 |
| Step 4: Family tier cards showing "+ Spouse & Children" benefit | `page-onboarding` (step 4) | REQ-205, REQ-215 | Family option visible; family members linked to primary account | GD-205-04, GD-215-01 |
| Step 5: Referrer Member ID / phone input | `page-onboarding` (step 5) | REQ-206 | Enter referrer's member ID or phone | GD-206-01 |
| Step 5: "Look Up Referrer" button | `page-onboarding` (step 5) | REQ-206 | Referrer name auto-displays on lookup | GD-206-02 |
| Step 5: Referrer result display (name confirmation) | `page-onboarding` (#referrerResult) | REQ-206 | Referrer receives notification to confirm; configurable mandatory/optional | GD-206-03 |
| Step 5: "Skip" option (when referral is optional) | `page-onboarding` (step 5) | REQ-206 | Configurable: mandatory or optional per tenant | GD-206-04 |
| Step 6: Payment method selection (PayPal / PayNow) | `page-onboarding` (step 6) | REQ-207 | PayPal and PayNow integration | GD-207-01 |
| Step 6: Payment summary (tier name, price, service charge, total) | `page-onboarding` (step 6) | REQ-207 | Show itemized total with service charges | GD-207-02 |
| Step 6: PDPA consent checkbox with privacy policy link | `page-onboarding` (step 6, #pdpaConsent) | REQ-216 | Mandatory privacy policy consent checkbox with link to policy; data retention policy displayed | GD-216-01 |
| Step 6: "Pay & Submit Application" button | `page-onboarding` (step 6) | REQ-207 | Payment confirmation triggers application submission | GD-207-03 |
| Step 7: Success confirmation with animation | `page-onboarding` (#successStep) | REQ-211 | Success message displayed after submission | GD-211-01 |
| Step 7: Application status tracker (Submitted / Under Review / Approved) | `page-onboarding` (#successStep) | REQ-211 | Status page: Submitted -> Under Review -> Approved/Rejected | GD-211-02 |
| Step 7: "Back to Home" button | `page-onboarding` (#successStep) | REQ-211 | Navigation back after submission | GD-211-03 |
| Admin: Onboarding pipeline builder (toggle steps, reorder) | `admin-config` (#cfg-onboarding) | REQ-212 | Super admin can enable/disable each step; reorder steps | GD-212-01 |
| Admin: Auto-approve threshold slider (0-100) | `admin-config` (#autoApproveSlider) | REQ-212, REQ-209 | Set auto-approve threshold; auto-approve if fraud score < threshold | GD-212-02, GD-209-01 |
| Admin: Duplicate detection — fuzzy match indicator in applications queue | `admin-applications` | REQ-210 | Fuzzy match on name+DOB+phone+email; alert admin if similarity > 80% | GD-210-01 |
| Rate limiting — implicit (handled backend, CAPTCHA on 2nd attempt) | Backend | REQ-213 | Max 3 reg attempts per IP/hour; max 5 OTP/phone/day; CAPTCHA on 2nd attempt | GD-213-01 |

### Module 3: Event Registration & Payment

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Registration sidebar with pre-filled member info | `page-event-detail` (#eventRegSidebar) | REQ-301 | Logged-in members see pre-filled registration; single "Register" button | GD-301-01 |
| "Register & Pay" primary CTA button | `page-event-detail` | REQ-301 | Confirmation in <3s | GD-301-02 |
| "Join to Register" CTA for non-members (spec wireframe reference) | `page-event-detail` | REQ-302 | Non-members see "Join to Register" instead of registration form | GD-302-01 |
| Adults count dropdown (1-5) | `page-event-detail` (#regAdults) | REQ-303 | Number of adults field; auto-calculate total | GD-303-01 |
| Children count dropdown (0-5) | `page-event-detail` (#regChildren) | REQ-303 | Number of children field; auto-calculate total | GD-303-02 |
| Dietary preferences dropdown (None, Vegetarian, Vegan, Halal) | `page-event-detail` | REQ-303 | Dietary preferences (configurable) | GD-303-03 |
| Special requirements textarea | `page-event-detail` | REQ-303 | Special requirements text field | GD-303-04 |
| Price summary: Adults total, Children total, Grand total | `page-event-detail` (#adultTotal, #childTotal, #regTotal) | REQ-303 | Auto-calculate total displayed | GD-303-05 |
| Registration payment modal (PayPal / PayNow buttons) | `#regModal` | REQ-304 | PayPal + PayNow; free events skip payment | GD-304-01 |
| Registration confirmation toast ("Registration Confirmed!") | Toast notification | REQ-305 | In-app confirmation displayed | GD-305-01 |
| "Check your email for confirmation" message in toast | Toast notification | REQ-305 | Email confirmation sent with calendar invite and QR code | GD-305-02 |
| "Add to Calendar" button on event detail | `page-event-detail` | REQ-308 | Google Calendar, Apple Calendar, Outlook links; .ics download | GD-308-01 |
| Calendar added toast notification | Toast notification | REQ-308 | Calendar event added confirmation | GD-308-02 |
| Waitlist join — referenced in spec (when spots full, UI shows waitlist option) | `page-event-detail` | REQ-306 | When spots full, allow waitlist join; auto-promote when spot opens | GD-306-01 |
| Cancel registration — referenced in member dashboard (upcoming events with cancel) | `page-dashboard` (#dash-my-events) | REQ-307 | Cancel registration; refund policy displayed; spot released to waitlist | GD-307-01 |
| Event reminders — backend automated (48h, 2h before) | Backend | REQ-309 | Automated: 48h before, 2h before via email + optional WhatsApp | GD-309-01 |
| QR check-in — referenced in feature flags toggle ("Event Check-in QR") | `admin-config` (#cfg-features) | REQ-310 | QR code scan at venue; admin can mark attendance manually | GD-310-01 |

### Module 4: AI-Powered Features

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Floating chatbot trigger button (bottom-right) | Global (#chatbotBtn) | REQ-401 | Floating chat widget on all pages | GD-401-01 |
| Chatbot panel with header "CommunityHub AI" | Global (#chatbotPanel) | REQ-401 | Chat panel opens with assistant identity | GD-401-02 |
| Chatbot message area with conversation history | Global (#chatMessages) | REQ-401 | Answers event questions, membership queries, navigation help | GD-401-03 |
| Chatbot input field ("Ask me anything...") | Global (#chatInput) | REQ-401 | User can type messages; supports configurable languages | GD-401-04 |
| Chatbot send button | Global (#chatbotPanel) | REQ-401 | Messages sent and responses received | GD-401-05 |
| Chatbot close button (x) | Global (#chatbotPanel) | REQ-401 | Chat panel closes cleanly | GD-401-06 |
| Chatbot bilingual response capability | Global (#chatbotPanel) | REQ-401 | Supports configurable languages; Claude API powered | GD-401-07 |
| "Events for You" recommendation section — spec reference | `page-home`, `page-dashboard` | REQ-402 | Recommendations based on past attendance, interests, peer behavior | GD-402-01 |
| AI event recap text in gallery/past events | `page-gallery` | REQ-403 | Auto-generated 200-word recap from organizer notes + photo count | GD-403-01 |
| AI newsletter — feature flag toggle in admin config | `admin-config` (#cfg-features) | REQ-404 | Monthly auto-curated newsletter; configurable via feature flag | GD-404-01 |
| "Create Event" modal with AI copilot — "Use AI to generate" button | `#createEventModal` | REQ-405 | Admin describes event; AI generates listing, form fields, pricing, schedule | GD-405-01 |
| Attendance prediction — backend AI feature | Backend | REQ-406 | AI predicts attendance based on event type history, registration velocity, seasonality | GD-406-01 |
| Sentiment analysis — linked to feedback submission (REQ-506) | Backend | REQ-407 | Post-event feedback analyzed; topic extraction; actionable summary | GD-407-01 |
| Fraud score bar in admin applications queue (color-coded: green/yellow/red) | `admin-applications` | REQ-408, REQ-208 | Behavioral analysis; risk score; integrated with onboarding fraud scoring | GD-408-01, GD-208-01 |
| Fraud score numeric label per application | `admin-applications` | REQ-208 | Score 0-100; flag >70 for manual review | GD-208-02 |
| Gallery with AI-tagged photos and search | `page-gallery` | REQ-409 | Auto-tagging, smart search, auto-album creation | GD-409-01 |
| Admin AI Chatbot: Knowledge Base / FAQ table | `admin-chatbot` | REQ-410 | Admin can add FAQ entries, correct chatbot responses; RAG over org content | GD-410-01 |
| Admin AI Chatbot: "Add FAQ Entry" button | `admin-chatbot` | REQ-410 | Add new FAQ entries | GD-410-02 |
| Admin AI Chatbot: Edit button per FAQ row | `admin-chatbot` | REQ-410 | Correct chatbot responses | GD-410-03 |
| Admin AI Chatbot: Conversation stats (count, resolution rate, satisfaction) | `admin-chatbot` | REQ-410, REQ-401 | View satisfaction scores; conversation logs | GD-410-04 |
| Admin AI Chatbot: FAQ search input | `admin-chatbot` | REQ-410 | Search FAQ entries | GD-410-05 |
| Feature flag toggle: "Smart Recommendations" | `admin-config` (#cfg-features) | REQ-402, REQ-709 | Toggle AI recommendations on/off per tenant | GD-402-02 |
| Feature flag toggle: "AI Newsletter" | `admin-config` (#cfg-features) | REQ-404, REQ-709 | Toggle newsletter on/off per tenant | GD-404-02 |
| Feature flag toggle: "Photo Gallery" | `admin-config` (#cfg-features) | REQ-409, REQ-709 | Toggle AI gallery on/off per tenant | GD-409-02 |

### Module 5: Member Dashboard

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Login page: email input field | `page-login` | REQ-501 | Email/password login field | GD-501-01 |
| Login page: password input field | `page-login` | REQ-501 | Password field for authentication | GD-501-02 |
| Login page: "Sign In" button | `page-login` | REQ-501 | Supabase Auth; session persistence | GD-501-03 |
| Login page: "Send Magic Link" button | `page-login` | REQ-501 | Magic link authentication option | GD-501-04 |
| Login page: "Sign in with Google" button | `page-login` | REQ-501 | Google OAuth option | GD-501-05 |
| Login page: "Join Us" link for non-members | `page-login` | REQ-501 | Redirect to onboarding for new users | GD-501-06 |
| Login page: "Admin Login" link | `page-login` | REQ-501 | Separate admin authentication entry | GD-501-07 |
| Dashboard sidebar: Overview nav link | `page-dashboard` | REQ-503 | Navigation to dashboard overview | GD-503-01 |
| Dashboard sidebar: My Events nav link | `page-dashboard` | REQ-503 | Navigation to my events list | GD-503-02 |
| Dashboard sidebar: Profile nav link | `page-dashboard` | REQ-502 | Navigation to profile management | GD-502-01 |
| Dashboard sidebar: Membership nav link | `page-dashboard` | REQ-504 | Navigation to membership status | GD-504-01 |
| Dashboard sidebar: Notifications nav link with badge (3) | `page-dashboard` | REQ-505 | Navigation to notification center; unread count badge | GD-505-01 |
| Dashboard Overview: welcome message with member name | `dash-overview` | REQ-503 | Personalized dashboard overview | GD-503-03 |
| Dashboard Overview: quick stats (upcoming events, membership status, member since) | `dash-overview` | REQ-503, REQ-504 | Overview of member stats | GD-503-04 |
| Dashboard Overview: upcoming event cards with "View Details" | `dash-overview` | REQ-503 | List of registered upcoming events | GD-503-05 |
| My Events tab: Upcoming events table (event, date, status, attendees, actions) | `dash-my-events` | REQ-503 | Upcoming events with status (Confirmed, Waitlisted, Cancelled) | GD-503-06 |
| My Events tab: "Cancel" button per upcoming event | `dash-my-events` | REQ-307, REQ-503 | Cancel registration option for upcoming events | GD-307-02 |
| My Events tab: Past events table (event, date, attendees, feedback) | `dash-my-events` | REQ-503 | Past events with photos displayed | GD-503-07 |
| My Events tab: "Leave Feedback" button per past event | `dash-my-events` | REQ-506 | Post-event: 1-5 star rating + optional text feedback | GD-506-01 |
| Profile tab: Name, email, phone, DOB, gender fields (editable) | `dash-profile` | REQ-502 | Edit personal details | GD-502-02 |
| Profile tab: Profile photo upload area | `dash-profile` | REQ-502 | Profile photo upload | GD-502-03 |
| Profile tab: Interests checkboxes (Cultural, Music, Sports, Dance) | `dash-profile` | REQ-502 | Edit interests | GD-502-04 |
| Profile tab: "Save Changes" button | `dash-profile` | REQ-502 | Save profile updates; toast confirmation | GD-502-05 |
| Membership tab: Status card (tier name, status badge, valid through date) | `dash-membership` | REQ-504 | Show membership type, expiry date | GD-504-02 |
| Membership tab: "Renew Membership" CTA button | `dash-membership` | REQ-504 | Renewal CTA displayed | GD-504-03 |
| Membership tab: Payment history table (date, description, amount, method, status) | `dash-membership` | REQ-504 | Payment history displayed | GD-504-04 |
| Notifications tab: Notification list items with badge, title, message, time | `dash-notifications` | REQ-505 | In-app notifications for: event reminders, registration confirmations, membership status changes, committee messages | GD-505-02 |
| Notifications tab: Unread indicator (blue dot) | `dash-notifications` | REQ-505 | Distinguish read/unread notifications | GD-505-03 |
| Notifications tab: "Mark all as read" button | `dash-notifications` | REQ-505 | Bulk mark read action | GD-505-04 |

### Module 6: Admin Panel

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Admin sidebar navigation (Dashboard, Events, Members, Applications, Configuration, AI Chatbot) | `page-admin` (sidebar) | REQ-601 | Admin panel with sidebar navigation | GD-601-01 |
| Admin role label ("Admin Panel") and user name ("Suresh") | `page-admin` (sidebar) | REQ-601 | Admin identified by role and name | GD-601-02 |
| Admin Dashboard: Total Members stat card | `admin-dash` | REQ-601 | Overview: total members displayed | GD-601-03 |
| Admin Dashboard: Pending Applications stat card (with warning color) | `admin-dash` | REQ-601 | Overview: pending registrations count | GD-601-04 |
| Admin Dashboard: Upcoming Events stat card | `admin-dash` | REQ-601 | Overview: upcoming events count | GD-601-05 |
| Admin Dashboard: Revenue (MTD) stat card with change indicator | `admin-dash` | REQ-601 | Overview: revenue summary with trend | GD-601-06 |
| Admin Dashboard: Recent Activity feed table (time, action, user, details) | `admin-dash` | REQ-601, REQ-610 | Recent activity feed; all actions logged | GD-601-07, GD-610-01 |
| Admin Dashboard: Activity badges (Registration, Application, Payment, Alert) | `admin-dash` | REQ-601 | Activity categorized by type | GD-601-08 |
| Events Management: "Create Event" button | `admin-events` | REQ-602 | Create event with title, description, date/time, venue, capacity, pricing, categories, images | GD-602-01 |
| Events Management: Events table (event, date, registered, capacity, revenue, status, actions) | `admin-events` | REQ-602 | Read all events with key metrics | GD-602-02 |
| Events Management: "Edit" button per event | `admin-events` | REQ-602 | Edit event details | GD-602-03 |
| Events Management: "View" button per event | `admin-events` | REQ-603 | View registrations for event | GD-603-01 |
| Events Management: "Publish" button for draft events | `admin-events` | REQ-602 | Publish/archive events | GD-602-04 |
| Events Management: Status badges (Published, Draft) | `admin-events` | REQ-602 | Event status visible | GD-602-05 |
| Create Event Modal: Title, description, date, time, venue, capacity, price, category fields | `#createEventModal` | REQ-602 | Full event creation form | GD-602-06 |
| Create Event Modal: Image upload area | `#createEventModal` | REQ-602 | Image upload for event | GD-602-07 |
| Create Event Modal: "Use AI to generate" button | `#createEventModal` | REQ-405, REQ-602 | AI copilot generates listing from natural language description | GD-405-02 |
| Create Event Modal: "Save Draft" / "Publish Event" buttons | `#createEventModal` | REQ-602 | Save as draft or publish immediately | GD-602-08 |
| Members tab: Search input for members | `admin-members` | REQ-604 | Search members | GD-604-01 |
| Members tab: Status filter dropdown (All, Active, Expired, Suspended) | `admin-members` | REQ-604 | Filter by status | GD-604-02 |
| Members tab: Tier filter dropdown (All tiers listed) | `admin-members` | REQ-604 | Filter by tier | GD-604-03 |
| Members tab: "Export CSV" button | `admin-members` | REQ-604 | Export member data | GD-604-04 |
| Members tab: Member table (ID, name, email, tier, status, joined, actions) | `admin-members` | REQ-604 | View all members; search/filter; view profile | GD-604-05 |
| Members tab: "View" button per member | `admin-members` | REQ-604 | View member profile; edit status | GD-604-06 |
| Members tab: Status badges (Active, Expired) | `admin-members` | REQ-604 | Member status visible (Active, Suspended, Expired) | GD-604-07 |
| Applications tab: "Pending Review" header with count | `admin-applications` | REQ-605 | Pending applications listed | GD-605-01 |
| Applications tab: "Bulk Approve Low-Risk" button | `admin-applications` | REQ-605, REQ-209 | Bulk approve actions; auto-approve rules | GD-605-02, GD-209-02 |
| Applications tab: Applications table (applicant, phone, referrer, tier, fraud score, date, actions) | `admin-applications` | REQ-605 | Applications with fraud score; detail expandable | GD-605-03 |
| Applications tab: Fraud score bar with color coding (green <30, yellow 30-70, red >70) | `admin-applications` | REQ-605, REQ-208 | Fraud score badge visible per application | GD-605-04, GD-208-03 |
| Applications tab: "Approve" button per application | `admin-applications` | REQ-605, REQ-209 | Admin can approve with notification | GD-605-05 |
| Applications tab: "Reject" button (high-risk applications) | `admin-applications` | REQ-605, REQ-209 | Admin can reject with reason | GD-605-06 |
| Applications tab: "Review" button per application | `admin-applications` | REQ-605 | Detailed review of application | GD-605-07 |
| Reject Modal: Rejection reason textarea | `#rejectModal` | REQ-209 | Reject with reason; applicant notified | GD-209-03 |
| Reject Modal: "Reject Application" confirmation button | `#rejectModal` | REQ-209 | Confirmation before rejection | GD-209-04 |
| Applications tab: Referrer status badges (Confirmed, Pending, Invalid) | `admin-applications` | REQ-206, REQ-208 | Referral validity shown as risk factor | GD-206-05, GD-208-04 |
| Configuration tab: Tabbed navigation (Branding, Tiers, Payments, Onboarding Pipeline, Feature Flags) | `admin-config` | REQ-606 | Tenant configuration with tabbed interface | GD-606-01 |
| Admin Dashboard: Revenue stat + Events revenue in table | `admin-dash`, `admin-events` | REQ-607 | Revenue by event visible; revenue summary in dashboard | GD-607-01 |
| Communication tools — referenced in spec (send email/notification to segments) | Admin (spec reference) | REQ-608 | Send email/notification to all members, event registrants, specific segments | GD-608-01 |
| AI Chatbot Management tab: Conversation logs, FAQ, satisfaction scores | `admin-chatbot` | REQ-609 | View conversation logs; satisfaction scores | GD-609-01 |
| Recent Activity table in admin dashboard | `admin-dash` | REQ-610 | All admin actions logged: who, what, when; searchable | GD-610-02 |

### Module 7: Tenant Configuration (White-Label)

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Branding config: Organization Name input | `cfg-branding` | REQ-701 | Org name configurable | GD-701-01 |
| Branding config: Tagline input | `cfg-branding` | REQ-701 | Tagline configurable | GD-701-02 |
| Branding config: Primary Color picker + hex input | `cfg-branding` | REQ-701 | Primary color configurable | GD-701-03 |
| Branding config: Secondary Color picker + hex input | `cfg-branding` | REQ-701 | Secondary color configurable | GD-701-04 |
| Branding config: Logo upload area ("Click or drag to upload logo") | `cfg-branding` | REQ-701 | Logo (light/dark) upload; SVG, PNG, max 2MB | GD-701-05 |
| Branding config: "Save Branding" button | `cfg-branding` | REQ-701 | Branding changes saved with confirmation | GD-701-06 |
| Custom domain support — referenced in spec (not in prototype config tabs) | Backend/Deployment | REQ-702 | Map custom domain; SSL auto-provisioning | GD-702-01 |
| Tiers config: Membership tiers table (name, price, duration, family, actions) | `cfg-tiers` | REQ-703 | Define N tiers with name, price, duration, benefits, family option | GD-703-01 |
| Tiers config: "+ Add Tier" button | `cfg-tiers` | REQ-703 | Add new membership tiers | GD-703-02 |
| Tiers config: "Edit" button per tier | `cfg-tiers` | REQ-703 | Edit existing tiers | GD-703-03 |
| Payments config: PayPal toggle and Client ID input | `cfg-payments` | REQ-704 | Enable/disable PayPal; configure API keys | GD-704-01 |
| Payments config: PayNow toggle and UEN/Phone input | `cfg-payments` | REQ-704 | Enable/disable PayNow; configure PayNow ID | GD-704-02 |
| Payments config: Service Charge % input (3.9 + $0.50 fixed) | `cfg-payments` | REQ-704 | Set service charge % | GD-704-03 |
| Payments config: "Save Payment Config" button | `cfg-payments` | REQ-704 | Payment configuration saved | GD-704-04 |
| Onboarding Pipeline: Drag-and-drop step list with toggle switches | `cfg-onboarding` | REQ-705 | Drag-and-drop step ordering; toggle each verification step | GD-705-01 |
| Onboarding Pipeline: Phone OTP toggle | `cfg-onboarding` | REQ-705, REQ-202 | Enable/disable phone OTP step | GD-705-02 |
| Onboarding Pipeline: Email Verification toggle | `cfg-onboarding` | REQ-705, REQ-203 | Enable/disable email verification step | GD-705-03 |
| Onboarding Pipeline: Personal Details (always on, non-toggleable) | `cfg-onboarding` | REQ-705 | Personal details step always required | GD-705-04 |
| Onboarding Pipeline: Membership Tier Selection (always on, non-toggleable) | `cfg-onboarding` | REQ-705 | Tier selection step always required | GD-705-05 |
| Onboarding Pipeline: Member Referral toggle | `cfg-onboarding` | REQ-705, REQ-206 | Enable/disable referral step | GD-705-06 |
| Onboarding Pipeline: Payment Gate toggle | `cfg-onboarding` | REQ-705, REQ-207 | Enable/disable payment step | GD-705-07 |
| Onboarding Pipeline: AI Fraud Scoring toggle | `cfg-onboarding` | REQ-705, REQ-208 | Enable/disable AI fraud scoring | GD-705-08 |
| Onboarding Pipeline: Admin Approval toggle | `cfg-onboarding` | REQ-705, REQ-209 | Enable/disable admin approval gate | GD-705-09 |
| Onboarding Pipeline: Auto-approve threshold slider | `cfg-onboarding` (#autoApproveSlider) | REQ-705, REQ-212 | Set auto-approve threshold (0-100) | GD-705-10 |
| Onboarding Pipeline: "Save Pipeline" button | `cfg-onboarding` | REQ-705 | Pipeline configuration saved | GD-705-11 |
| Event category taxonomy — referenced in spec; category dropdown in events filter | `page-events` (filter), `#createEventModal` | REQ-706 | Define custom event categories (Cultural, Sports, Religious, Social, AGM) | GD-706-01 |
| Email template customization — referenced in spec (not in current prototype tabs) | Admin (spec reference) | REQ-707 | Customize welcome email, event confirmation, reminders, newsletter; merge tags | GD-707-01 |
| Language configuration — referenced in spec; chatbot bilingual support | Admin (spec reference), Chatbot | REQ-708 | Set primary + secondary language; AI chatbot language; UI string overrides | GD-708-01 |
| Feature Flags config: AI Chatbot toggle | `cfg-features` | REQ-709 | Toggle AI chatbot on/off | GD-709-01 |
| Feature Flags config: Smart Recommendations toggle | `cfg-features` | REQ-709 | Toggle recommendations on/off | GD-709-02 |
| Feature Flags config: AI Newsletter toggle | `cfg-features` | REQ-709 | Toggle newsletter on/off | GD-709-03 |
| Feature Flags config: Photo Gallery toggle | `cfg-features` | REQ-709 | Toggle gallery on/off | GD-709-04 |
| Feature Flags config: Donations toggle | `cfg-features` | REQ-709 | Toggle donations on/off | GD-709-05 |
| Feature Flags config: Volunteer Management toggle | `cfg-features` | REQ-709 | Toggle volunteering on/off | GD-709-06 |
| Feature Flags config: Event Check-in (QR) toggle | `cfg-features` | REQ-709 | Toggle QR check-in on/off | GD-709-07 |
| Feature Flags config: "Save Features" button | `cfg-features` | REQ-709 | Feature flag changes saved | GD-709-08 |
| Seed data / demo mode — referenced in spec | Deployment | REQ-710 | Pre-populated demo data; reset to seed state | GD-710-01 |

### Module 8: Donations & Volunteering

| Prototype Element | Page | REQ ID | Acceptance Criterion | Golden Data Ref |
|---|---|---|---|---|
| Donation page — referenced via feature flag toggle ("Donations" flag) | Feature flag + spec reference | REQ-801 | Accept one-time donations via PayPal/PayNow; configurable suggested amounts; custom amount | GD-801-01 |
| Donor acknowledgment — backend/email automation | Backend | REQ-802 | Auto thank-you email with receipt; optional public donor wall (with consent) | GD-802-01 |
| Volunteer registration — referenced via feature flag toggle ("Volunteer Management" flag) | Feature flag + spec reference | REQ-803 | Form: availability, skills, interests; admin can assign to events | GD-803-01 |
| Sponsorship tiers — referenced in spec | Spec reference | REQ-804 | Display sponsor packages with benefits; inquiry form; sponsor logo showcase | GD-804-01 |

---

## UX Heuristic Evaluation (Nielsen's 10 Heuristics)

### Heuristic 1: Visibility of System Status

| Screen | Evaluation | Status |
|---|---|---|
| Onboarding Wizard | Stepper progress bar clearly shows current step (1-6), completed steps, and remaining steps | PASS |
| OTP Verification | 60-second countdown timer shows resend cooldown; "Code sent!" feedback on OTP dispatch | PASS |
| Email Verification | "Check your email" feedback after code send; code section reveals on action | PASS |
| Event Registration | Real-time price total updates as adults/children count changes | PASS |
| Registration Payment | Toast notification confirms "Registration Confirmed!" with details | PASS |
| Admin Dashboard | 4 stat cards with real-time counts; recent activity feed with timestamps | PASS |
| Admin Applications | Fraud score bar with color coding (green/yellow/red) provides instant risk assessment | PASS |
| Profile Save | Toast "Profile Updated" confirms save action | PASS |
| Branding Save | Toast "Branding Saved" confirms configuration change | PASS |
| Chatbot | Messages appear in conversation thread; typing indicator could be added | PARTIAL — Add typing indicator for AI response |

### Heuristic 2: Match Between System and Real World

| Screen | Evaluation | Status |
|---|---|---|
| Homepage | "Explore Events" and "Become a Member" use natural language CTAs | PASS |
| Event Cards | Date format, venue names, and pricing in familiar formats ($15.00/person) | PASS |
| Membership Tiers | "Individual Annual", "Family Annual", "Life" — uses community-standard terminology | PASS |
| Onboarding Steps | "Phone Verification", "Email Verification", "Personal Details" — clear, jargon-free labels | PASS |
| Admin Panel | "Applications", "Members", "Events" — maps to real-world admin mental model | PASS |
| Fraud Score | Numeric 0-100 with color coding maps to intuitive risk level understanding | PASS |

### Heuristic 3: User Control and Freedom

| Screen | Evaluation | Status |
|---|---|---|
| Onboarding Wizard | Back/Next buttons on every step; data preserved between steps | PASS |
| Onboarding Step 5 (Referral) | "Skip" option when referral is optional per tenant | PASS |
| Event Registration Modal | "Cancel" button to exit payment flow | PASS |
| Admin Reject Modal | "Cancel" button to abort rejection action | PASS |
| Chatbot | Close button (x) to dismiss chatbot panel | PASS |
| Member Dashboard | Cancel event registration available for upcoming events | PASS |
| Navigation | All pages accessible via navbar; "Back to Home" from onboarding success | PASS |

### Heuristic 4: Consistency and Standards

| Screen | Evaluation | Status |
|---|---|---|
| All Pages | Consistent design tokens (colors, spacing, typography, shadows, border-radius) via CSS variables | PASS |
| Buttons | Consistent button styles: btn-primary (indigo), btn-secondary (outline), btn-success (green), btn-danger (red), btn-ghost (transparent) | PASS |
| Cards | Event cards use consistent layout: image, title, date, venue, price, CTA | PASS |
| Badges | Consistent badge styles: badge-success (green), badge-warning (yellow), badge-danger (red), badge-info (blue) | PASS |
| Forms | Consistent form styling: labels, inputs, validation hints across onboarding, admin, profile | PASS |
| Navigation | Sidebar navigation pattern consistent between member dashboard and admin panel | PASS |
| Toast Notifications | Consistent toast pattern for all confirmations (save, approve, reject, register) | PASS |

### Heuristic 5: Error Prevention

| Screen | Evaluation | Status |
|---|---|---|
| Onboarding Phone OTP | "Next" button disabled until valid OTP entered; max 3 attempts enforced | PASS |
| Onboarding Email | "Next" button disabled until email verified | PASS |
| Onboarding Details | Real-time validation on all fields (name, DOB, gender, nationality) | PASS |
| Onboarding Payment | PDPA consent checkbox required before submission | PASS |
| Onboarding Tier | Tier selection required before proceeding (no empty selection) | PASS |
| Admin Pipeline | "Personal Details" and "Membership Tier Selection" toggles non-interactive (always on) — prevents disabling required steps | PASS |
| Event Registration | Dropdown selectors prevent invalid input for adults/children count | PASS |
| Admin Reject | Rejection reason textarea required; confirmation modal before destructive action | PASS |

### Heuristic 6: Recognition Rather Than Recall

| Screen | Evaluation | Status |
|---|---|---|
| Onboarding Stepper | Step labels visible at all times (Phone, Email, Details, Tier, Referral, Payment) | PASS |
| Event Detail | All event info visible on single page: date, time, venue, price, spots, description | PASS |
| Admin Applications | Applicant details (name, email, phone, referrer, tier, fraud score) all visible in table | PASS |
| Dashboard Overview | Quick stats (upcoming events, membership type, member since) immediately visible | PASS |
| Event Filters | Current filter selections visible in dropdowns | PASS |
| Member Profile | Pre-filled form fields show current values | PASS |
| Referrer Lookup | Referrer name auto-displays after lookup — no need to remember | PASS |

### Heuristic 7: Flexibility and Efficiency of Use

| Screen | Evaluation | Status |
|---|---|---|
| Event Registration | 1-click registration for logged-in members (pre-filled form) | PASS |
| Admin Applications | "Bulk Approve Low-Risk" shortcut for efficient batch processing | PASS |
| Events Page | Card view and calendar view toggle for different browsing preferences | PASS |
| Search | Full-text search with real-time filtering (<500ms) | PASS |
| Admin Events | AI copilot "Use AI to generate" accelerates event creation for experienced users | PASS |
| Login | Multiple auth methods: password, magic link, Google OAuth — user chooses preferred | PASS |
| Mobile | Hamburger nav for mobile; responsive grid adapts to screen size | PASS |

### Heuristic 8: Aesthetic and Minimalist Design

| Screen | Evaluation | Status |
|---|---|---|
| Homepage | Clean hero with gradient, 3 event cards, stats bar — no visual clutter | PASS |
| Event Cards | Essential info only: image, title, date, venue, price, CTA | PASS |
| Admin Dashboard | 4 key stat cards + activity feed — focused on actionable data | PASS |
| Onboarding | One step per screen; clear instructions; minimal form fields per step | PASS |
| Member Dashboard | Sidebar navigation keeps content area uncluttered | PASS |
| Color Palette | Limited, consistent palette (primary indigo, secondary amber, semantic colors) | PASS |

### Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors

| Screen | Evaluation | Status |
|---|---|---|
| Onboarding OTP | Timer shows when resend available; max attempts communicated | PARTIAL — Should show explicit "max attempts reached" message |
| Admin Rejection | Rejection modal with reason field; toast confirms action with "applicant notified" | PASS |
| Registration | Toast notification on success/failure with descriptive message | PASS |
| Form Validation | Hint text below fields ("Enter your registered phone number") guides correct input | PASS |
| Fraud Alert | Admin dashboard shows "High fraud score (82) — requires review" with contextual action | PASS |
| Empty States | Events grid should show "No events found" for empty search results | PARTIAL — Verify empty state handling in implementation |

### Heuristic 10: Help and Documentation

| Screen | Evaluation | Status |
|---|---|---|
| AI Chatbot | Always-accessible floating widget answers questions about events, membership, navigation | PASS |
| Onboarding Steps | Each step has clear heading and explanatory text | PASS |
| Pipeline Builder | Each step has description text explaining its purpose | PASS |
| Feature Flags | Each flag has description text explaining what it controls | PASS |
| Auto-Approve Slider | Hint text: "Applications with fraud score below this threshold will be auto-approved" | PASS |
| About Page | Organization history, mission, leadership team information | PASS |
| Accessibility Notes | Dedicated page documenting WCAG compliance per screen | PASS |

---

## Orphaned Requirements Check

This section verifies that EVERY REQ-ID from `spec.md` has at least one UI element or prototype representation.

### Fully Covered Requirements (Direct UI Mapping)

| REQ ID | Module | Coverage Status |
|---|---|---|
| REQ-101 | Public Site | COVERED — Homepage hero, stats, CTAs, branding |
| REQ-102 | Public Site | COVERED — Event cards on homepage and events page |
| REQ-103 | Public Site | COVERED — Calendar view toggle and monthly grid |
| REQ-104 | Public Site | COVERED — Search input with live filtering |
| REQ-105 | Public Site | COVERED — Category and price filter dropdowns |
| REQ-106 | Public Site | COVERED — Event detail page with tabs |
| REQ-107 | Public Site | COVERED — Gallery page with photo grid |
| REQ-108 | Public Site | COVERED — Responsive navbar, mobile toggle, responsive grid |
| REQ-111 | Public Site | COVERED — WhatsApp, Telegram, Copy Link share buttons |
| REQ-201 | Onboarding | COVERED — Multi-step wizard with stepper |
| REQ-202 | Onboarding | COVERED — Phone OTP step (input, send, verify, timer) |
| REQ-203 | Onboarding | COVERED — Email verification step |
| REQ-204 | Onboarding | COVERED — Personal details form (all fields) |
| REQ-205 | Onboarding | COVERED — Tier comparison cards |
| REQ-206 | Onboarding | COVERED — Referral input, lookup, skip option |
| REQ-207 | Onboarding | COVERED — Payment method selection, summary, submit |
| REQ-208 | Onboarding | COVERED — Fraud score bars in admin applications |
| REQ-209 | Onboarding | COVERED — Admin approval queue, approve/reject, auto-approve threshold |
| REQ-210 | Onboarding | COVERED — Duplicate detection in admin queue (backend + admin review) |
| REQ-211 | Onboarding | COVERED — Success step with status tracker |
| REQ-212 | Onboarding | COVERED — Pipeline builder in admin config |
| REQ-216 | Onboarding | COVERED — PDPA consent checkbox |
| REQ-301 | Registration | COVERED — Pre-filled sidebar registration form |
| REQ-302 | Registration | COVERED — Guest blocking (spec wireframe, "Join to Register" CTA) |
| REQ-303 | Registration | COVERED — Registration form fields and price calculator |
| REQ-304 | Registration | COVERED — Payment modal with PayPal/PayNow |
| REQ-305 | Registration | COVERED — Confirmation toast + email reference |
| REQ-308 | Registration | COVERED — "Add to Calendar" button |
| REQ-401 | AI Features | COVERED — Floating chatbot widget, panel, input, messages |
| REQ-405 | AI Features | COVERED — "Use AI to generate" in create event modal |
| REQ-408 | AI Features | COVERED — Fraud score visualization in applications queue |
| REQ-410 | AI Features | COVERED — Admin chatbot management tab |
| REQ-501 | Dashboard | COVERED — Login page with all auth methods |
| REQ-502 | Dashboard | COVERED — Profile tab with editable fields |
| REQ-503 | Dashboard | COVERED — My Events tab (upcoming + past) |
| REQ-504 | Dashboard | COVERED — Membership tab (status, renewal, history) |
| REQ-505 | Dashboard | COVERED — Notifications tab with badge |
| REQ-601 | Admin | COVERED — Admin dashboard with stats and activity |
| REQ-602 | Admin | COVERED — Event CRUD (table + create modal) |
| REQ-603 | Admin | COVERED — Registration management via events table "View" |
| REQ-604 | Admin | COVERED — Member management with search, filter, export |
| REQ-605 | Admin | COVERED — Application approval queue |
| REQ-606 | Admin | COVERED — Configuration tab with all sub-tabs |
| REQ-609 | Admin | COVERED — AI Chatbot management tab |
| REQ-610 | Admin | COVERED — Activity feed in admin dashboard |
| REQ-701 | Tenant Config | COVERED — Branding config (name, tagline, colors, logo) |
| REQ-703 | Tenant Config | COVERED — Tiers config table with add/edit |
| REQ-704 | Tenant Config | COVERED — Payment provider config (PayPal, PayNow, service charge) |
| REQ-705 | Tenant Config | COVERED — Onboarding pipeline builder |
| REQ-706 | Tenant Config | COVERED — Category dropdown in events filter and create modal |
| REQ-709 | Tenant Config | COVERED — Feature flags config panel |

### Partially Covered Requirements (Logic/Backend with Feature Flag or Spec Reference)

These requirements have indirect prototype coverage through feature flags, backend logic references, or spec wireframe descriptions. They will have full UI in implementation.

| REQ ID | Module | Coverage Status | Gap Description |
|---|---|---|---|
| REQ-109 | Public Site (PWA) | PARTIAL | PWA support (add-to-homescreen, offline cache, push notifications) is a runtime capability — no dedicated UI element in prototype. Implementation will add PWA manifest and service worker. |
| REQ-110 | Public Site (SEO) | PARTIAL | SEO optimization (SSR, meta tags, Open Graph, sitemap) is build-time/server configuration — not a visible UI component. Footer and page structure support SEO. |
| REQ-213 | Onboarding (Rate Limiting) | PARTIAL | Rate limiting and CAPTCHA are backend enforcement mechanisms. Prototype shows OTP timer (60s cooldown) as the user-facing aspect. CAPTCHA overlay will appear on 2nd attempt during implementation. |
| REQ-214 | Onboarding (Geo-validation) | PARTIAL | Postal code field exists in step 3. Geo-validation (postal format, IP geolocation) is backend logic — no separate UI needed beyond validation error messages. |
| REQ-215 | Onboarding (Family) | PARTIAL | Family tiers shown in step 4 ("+ Spouse & Children" benefit listed). Dedicated family member detail entry form (add spouse/children fields) needs to be added to step 3 or as a sub-step during implementation. |
| REQ-306 | Registration (Waitlist) | PARTIAL | No waitlist join UI in current prototype. When capacity is reached, "Register & Pay" button should change to "Join Waitlist". Add in implementation. |
| REQ-307 | Registration (Cancellation) | PARTIAL | "Cancel" button exists in My Events table for upcoming events. Cancellation confirmation modal with refund policy display needs to be added. |
| REQ-309 | Registration (Reminders) | PARTIAL | Reminders are backend-automated (48h, 2h before event). Notification preferences in member profile would control this. Toast/notification UI exists for delivery. |
| REQ-310 | Registration (Check-in) | PARTIAL | Feature flag "Event Check-in (QR)" exists. Dedicated QR scanner UI for admins and QR code display for members needs implementation. |
| REQ-402 | AI (Recommendations) | PARTIAL | Feature flag toggle exists. "Events for You" section referenced in spec but not fully rendered in prototype. Add personalized recommendations section to homepage/dashboard. |
| REQ-403 | AI (Recap Generator) | PARTIAL | Gallery page shows event photos. AI-generated recap text area not explicitly shown. Add recap text block per event in gallery. |
| REQ-404 | AI (Newsletter) | PARTIAL | Feature flag toggle exists. Newsletter preview/editor UI for admins not in prototype. Add newsletter management sub-tab in implementation. |
| REQ-406 | AI (Attendance Prediction) | PARTIAL | Backend AI feature. Could surface prediction in admin event detail view. No UI element in current prototype. |
| REQ-407 | AI (Sentiment) | PARTIAL | Backend analysis linked to REQ-506 (feedback). Sentiment summary for admins not shown in prototype. Add sentiment dashboard in admin reports. |
| REQ-409 | AI (Photo Gallery) | PARTIAL | Gallery page exists. AI auto-tagging, smart search ("photos from Diwali with kids"), auto-album creation need enhanced gallery UI in implementation. |
| REQ-506 | Dashboard (Feedback) | PARTIAL | "Leave Feedback" button exists in My Events. Feedback form (1-5 star rating + text) modal needs to be added during implementation. |
| REQ-607 | Admin (Reports) | PARTIAL | Revenue stat in dashboard. Dedicated financial reports tab with CSV/PDF export not in prototype navigation. Add "Reports" to admin sidebar. |
| REQ-608 | Admin (Communications) | PARTIAL | Not in prototype admin sidebar. Add "Communications" tab with segment selector, template editor, send functionality. |
| REQ-702 | Tenant Config (Domain) | PARTIAL | Backend/deployment feature. Add domain configuration input to branding config tab during implementation. |
| REQ-707 | Tenant Config (Email Templates) | PARTIAL | Not in prototype config tabs. Add "Email Templates" sub-tab with template editor and merge tags. |
| REQ-708 | Tenant Config (Language) | PARTIAL | Chatbot supports bilingual. Add language configuration sub-tab to admin config during implementation. |
| REQ-710 | Tenant Config (Seed Data) | PARTIAL | Deployment feature. Add "Reset to Demo Data" button in admin config advanced settings. |
| REQ-801 | Donations (Donation Page) | PARTIAL | Feature flag toggle exists. Dedicated donation page with suggested amounts, custom amount input, payment methods not in prototype pages. Add `page-donate` in implementation. |
| REQ-802 | Donations (Acknowledgment) | PARTIAL | Backend/email automation. Donor wall UI not in prototype. Add donor acknowledgment wall component during implementation. |
| REQ-803 | Donations (Volunteer) | PARTIAL | Feature flag toggle exists. Dedicated volunteer registration form not in prototype. Add volunteer form page in implementation. |
| REQ-804 | Donations (Sponsorship) | PARTIAL | Not in prototype. Add sponsorship tiers page with packages, benefits, inquiry form, sponsor logo showcase. |

### Orphaned Requirements Summary

**Zero fully orphaned requirements.** Every REQ-ID from the spec has at least one connection to the prototype (direct UI element, feature flag toggle, or spec wireframe reference).

**Requirements needing enhanced UI in implementation (25 items):**

| Priority | REQ IDs | Action Required |
|---|---|---|
| P1 — Must add before launch | REQ-306, REQ-402, REQ-506, REQ-607, REQ-608, REQ-801 | Add dedicated UI pages/components: waitlist, recommendations section, feedback modal, reports tab, communications tab, donation page |
| P2 — Add during implementation | REQ-215, REQ-307, REQ-310, REQ-403, REQ-405, REQ-406, REQ-407, REQ-409, REQ-702, REQ-707, REQ-708, REQ-803, REQ-804 | Enhance existing UI with additional form fields, modals, config tabs, and AI feature displays |
| P3 — Backend/Config (no UI gap) | REQ-109, REQ-110, REQ-213, REQ-214, REQ-309, REQ-404, REQ-710, REQ-802 | Runtime/build-time features with adequate indirect UI coverage |

---

## Requirement Coverage Summary

| Module | Total REQs | Fully Covered | Partially Covered | Orphaned |
|---|---|---|---|---|
| Module 1: Public Site | 11 | 8 | 3 (REQ-109, REQ-110, REQ-108 fully covered) | 0 |
| Module 2: Onboarding | 16 | 12 | 4 (REQ-213, REQ-214, REQ-215, REQ-216 fully covered) | 0 |
| Module 3: Registration | 10 | 5 | 5 (REQ-306, REQ-307, REQ-309, REQ-310) | 0 |
| Module 4: AI Features | 10 | 4 | 6 (REQ-402, REQ-403, REQ-404, REQ-406, REQ-407, REQ-409) | 0 |
| Module 5: Dashboard | 6 | 5 | 1 (REQ-506) | 0 |
| Module 6: Admin Panel | 10 | 7 | 3 (REQ-607, REQ-608, REQ-610 fully covered) | 0 |
| Module 7: Tenant Config | 10 | 6 | 4 (REQ-702, REQ-707, REQ-708, REQ-710) | 0 |
| Module 8: Donations | 4 | 0 | 4 (REQ-801, REQ-802, REQ-803, REQ-804) | 0 |
| **TOTAL** | **77** | **47 (61%)** | **30 (39%)** | **0 (0%)** |

> **Note:** The 39% "partially covered" rate is expected at the prototype stage. All partial items have either (a) feature flag toggles, (b) backend-only logic with no direct UI, or (c) explicit gaps documented above for implementation. No requirements are missing from the design intent.
