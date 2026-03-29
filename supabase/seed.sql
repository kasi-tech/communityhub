-- Seed data for Singapore Telugu Samajam (STS)

-- ============================================================
-- TENANT
-- ============================================================
INSERT INTO tenants (id, name, slug, branding, config, features, onboarding_steps) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Singapore Telugu Samajam',
  'sts',
  '{
    "primary_color": "#6366F1",
    "secondary_color": "#EC4899",
    "logo_url": "/images/sts-logo.png",
    "favicon_url": "/images/sts-favicon.ico",
    "font_family": "Inter",
    "hero_image_url": "/images/sts-hero.jpg",
    "tagline": "Connecting Telugu Community in Singapore"
  }'::jsonb,
  '{
    "default_currency": "SGD",
    "timezone": "Asia/Singapore",
    "locale": "en-SG",
    "support_email": "info@sts.org.sg",
    "max_family_members": 5
  }'::jsonb,
  '{
    "membership": true,
    "events": true,
    "donations": true,
    "volunteers": true,
    "chat": true,
    "family_membership": true,
    "referral_verification": true,
    "fraud_detection": true,
    "email_templates": true,
    "audit_logs": true
  }'::jsonb,
  '[
    {"step": 1, "key": "phone_verification", "label": "Phone Verification", "required": true},
    {"step": 2, "key": "personal_info", "label": "Personal Information", "required": true},
    {"step": 3, "key": "residential_info", "label": "Residential Information", "required": true},
    {"step": 4, "key": "interests", "label": "Interests & Preferences", "required": false},
    {"step": 5, "key": "membership_tier", "label": "Membership Tier Selection", "required": true},
    {"step": 6, "key": "family_members", "label": "Family Members", "required": false},
    {"step": 7, "key": "referrer", "label": "Referrer Details", "required": true},
    {"step": 8, "key": "payment", "label": "Payment", "required": true}
  ]'::jsonb
);

-- ============================================================
-- MEMBERSHIP TIERS
-- ============================================================
INSERT INTO membership_tiers (id, tenant_id, name, price, duration_months, is_family, is_lifetime, benefits, sort_order) VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Individual Annual',
    16.00,
    12,
    false,
    false,
    '["Access to all community events", "Monthly newsletter", "Voting rights at AGM", "Member directory listing"]'::jsonb,
    1
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'Family Annual',
    26.00,
    12,
    true,
    false,
    '["All Individual benefits", "Family event discounts", "Up to 5 family members", "Family directory listing"]'::jsonb,
    2
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    'Individual Life',
    151.00,
    NULL,
    false,
    true,
    '["All Individual benefits", "Lifetime membership", "Priority event registration", "Special recognition at events"]'::jsonb,
    3
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000001',
    'Family Life',
    251.00,
    NULL,
    true,
    true,
    '["All Family benefits", "Lifetime membership", "Priority event registration", "Special recognition at events", "VIP seating at major events"]'::jsonb,
    4
  );

-- ============================================================
-- SAMPLE MEMBERS
-- ============================================================
INSERT INTO members (id, tenant_id, name, email, phone, dob, gender, nationality, postal_code, residential_status, interests, role, status, member_number, tier_id, membership_expires) VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'Ravi Kumar',
    'ravi.kumar@email.com',
    '+6591234567',
    '1985-03-15',
    'Male',
    'Indian',
    '530201',
    'Citizen',
    ARRAY['Cultural Events', 'Sports', 'Volunteering'],
    'admin',
    'active',
    'STS-2024-0001',
    '00000000-0000-0000-0000-000000000103',
    NULL -- lifetime member
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'priya.sharma@email.com',
    '+6598765432',
    '1990-07-22',
    'Female',
    'Indian',
    '680302',
    'PR',
    ARRAY['Music', 'Dance', 'Cultural Events'],
    'member',
    'active',
    'STS-2024-0042',
    '00000000-0000-0000-0000-000000000102',
    '2027-01-15T00:00:00+08:00'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    'Suresh Reddy',
    'suresh.reddy@email.com',
    '+6587654321',
    '1978-11-08',
    'Male',
    'Indian',
    '460123',
    'EP',
    ARRAY['Cricket', 'Networking', 'Technology'],
    'member',
    'expired',
    'STS-2023-0105',
    '00000000-0000-0000-0000-000000000101',
    '2025-12-31T00:00:00+08:00'
  );

-- ============================================================
-- SAMPLE EVENTS
-- ============================================================
INSERT INTO events (id, tenant_id, title, description, category, date, start_time, end_time, venue_name, venue_address, venue_lat, venue_lng, capacity, price_adult, price_child, status, cover_image_url, schedule, speakers, created_by) VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    'Ugadi Celebrations 2026',
    'Join us for the grand Ugadi festival celebration with cultural performances, traditional food, and community bonding. Ugadi marks the Telugu New Year and is one of our most anticipated events.',
    'Cultural',
    '2026-04-14',
    '16:00',
    '21:00',
    'Singapore Expo',
    '1 Expo Drive, Singapore 486150',
    1.3350,
    103.9614,
    500,
    25.00,
    10.00,
    'published',
    '/images/events/ugadi-2026.jpg',
    '[
      {"time": "16:00", "title": "Registration & Welcome Drinks"},
      {"time": "16:30", "title": "Lamp Lighting Ceremony"},
      {"time": "17:00", "title": "Cultural Performances"},
      {"time": "18:30", "title": "Ugadi Pachadi Ceremony"},
      {"time": "19:00", "title": "Dinner"},
      {"time": "20:00", "title": "Entertainment & Prize Draw"}
    ]'::jsonb,
    '[
      {"name": "Dr. Lakshmi Narayana", "title": "Chief Guest", "bio": "Community leader and philanthropist"}
    ]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    'Badminton Tournament',
    'Monthly badminton tournament for all skill levels. Singles and doubles categories available. Shuttlecocks provided, bring your own racket.',
    'Sports',
    '2026-04-20',
    '09:00',
    '14:00',
    'Clementi Sports Hall',
    '518 Clementi Ave 1, Singapore 129907',
    1.3145,
    103.7652,
    40,
    5.00,
    0.00,
    'published',
    '/images/events/badminton.jpg',
    '[
      {"time": "09:00", "title": "Warm-up & Registration"},
      {"time": "09:30", "title": "Singles Round Robin"},
      {"time": "11:00", "title": "Doubles Round Robin"},
      {"time": "13:00", "title": "Finals & Prize Ceremony"}
    ]'::jsonb,
    '[]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000001',
    'Telugu Movie Night',
    'Enjoy a blockbuster Telugu movie screening with the community. Popcorn and drinks included. Family-friendly entertainment for all ages.',
    'Entertainment',
    '2026-05-03',
    '18:30',
    '22:00',
    'Golden Village Vivocity',
    '1 HarbourFront Walk, Singapore 098585',
    1.2644,
    103.8224,
    100,
    15.00,
    8.00,
    'published',
    '/images/events/movie-night.jpg',
    '[
      {"time": "18:30", "title": "Doors Open & Snacks"},
      {"time": "19:00", "title": "Movie Screening"},
      {"time": "21:30", "title": "Post-Movie Discussion"}
    ]'::jsonb,
    '[]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000001',
    'Blood Donation Drive',
    'Community blood donation drive in partnership with Singapore Red Cross. Walk-ins welcome. Light refreshments provided to all donors.',
    'Community Service',
    '2026-05-17',
    '10:00',
    '16:00',
    'Suntec City Convention Centre',
    '1 Raffles Blvd, Singapore 039593',
    1.2944,
    103.8576,
    200,
    0.00,
    0.00,
    'published',
    '/images/events/blood-donation.jpg',
    '[
      {"time": "10:00", "title": "Registration Opens"},
      {"time": "10:00 - 15:30", "title": "Blood Donation Sessions"},
      {"time": "15:30", "title": "Last Registration"},
      {"time": "16:00", "title": "Close & Thank You"}
    ]'::jsonb,
    '[]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000305',
    '00000000-0000-0000-0000-000000000001',
    'Bathukamma Festival',
    'Celebrate the vibrant Bathukamma festival with flower arrangements, traditional songs, and community gathering. Traditional attire encouraged.',
    'Cultural',
    '2026-10-10',
    '16:00',
    '20:00',
    'East Coast Park Area D',
    'East Coast Park Service Road, Singapore 449876',
    1.3008,
    103.9126,
    300,
    10.00,
    5.00,
    'draft',
    '/images/events/bathukamma.jpg',
    '[
      {"time": "16:00", "title": "Flower Arrangement Workshop"},
      {"time": "17:00", "title": "Bathukamma Songs & Dance"},
      {"time": "18:30", "title": "Immersion Ceremony"},
      {"time": "19:00", "title": "Dinner & Cultural Program"}
    ]'::jsonb,
    '[]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000306',
    '00000000-0000-0000-0000-000000000001',
    'Annual General Meeting 2026',
    'STS Annual General Meeting for all members. Review of past year activities, financial report, election of new committee members, and planning for upcoming year.',
    'Governance',
    '2026-06-28',
    '14:00',
    '17:00',
    'NTUC Centre Auditorium',
    '1 Marina Blvd, Singapore 018989',
    1.2800,
    103.8535,
    150,
    0.00,
    0.00,
    'published',
    '/images/events/agm.jpg',
    '[
      {"time": "14:00", "title": "Registration & Attendance"},
      {"time": "14:30", "title": "President Address"},
      {"time": "15:00", "title": "Financial Report"},
      {"time": "15:30", "title": "Activity Review"},
      {"time": "16:00", "title": "Committee Election"},
      {"time": "16:45", "title": "Open Forum & Q&A"}
    ]'::jsonb,
    '[]'::jsonb,
    '00000000-0000-0000-0000-000000000201'
  );

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
INSERT INTO email_templates (tenant_id, template_key, subject, body_html, merge_tags) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'welcome',
    'Welcome to {{tenant_name}}, {{member_name}}!',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Welcome to {{tenant_name}}!</h1>
      <p>Dear {{member_name}},</p>
      <p>We are thrilled to welcome you to our community. Your membership ({{member_number}}) is now active.</p>
      <p>Here''s what you can do:</p>
      <ul>
        <li>Browse and register for upcoming events</li>
        <li>Connect with fellow community members</li>
        <li>Access exclusive member benefits</li>
      </ul>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "member_name", "member_number"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'event_confirmation',
    'Registration Confirmed: {{event_title}}',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Registration Confirmed!</h1>
      <p>Dear {{member_name}},</p>
      <p>Your registration for <strong>{{event_title}}</strong> has been confirmed.</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Date:</strong> {{event_date}}</p>
        <p><strong>Time:</strong> {{event_time}}</p>
        <p><strong>Venue:</strong> {{event_venue}}</p>
        <p><strong>Adults:</strong> {{attendee_adults}} | <strong>Children:</strong> {{attendee_children}}</p>
        <p><strong>Total:</strong> {{currency}} {{total_amount}}</p>
      </div>
      <p>We look forward to seeing you there!</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "member_name", "event_title", "event_date", "event_time", "event_venue", "attendee_adults", "attendee_children", "currency", "total_amount"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'payment_receipt',
    'Payment Receipt — {{currency}} {{amount}}',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Payment Receipt</h1>
      <p>Dear {{member_name}},</p>
      <p>We have received your payment. Here are the details:</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
        <p><strong>Reference:</strong> {{payment_ref}}</p>
        <p><strong>Date:</strong> {{payment_date}}</p>
        <p><strong>Purpose:</strong> {{payment_purpose}}</p>
      </div>
      <p>Thank you for your support!</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "member_name", "currency", "amount", "payment_ref", "payment_date", "payment_purpose"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'event_reminder_48h',
    'Reminder: {{event_title}} is in 2 days!',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Event Reminder</h1>
      <p>Dear {{member_name}},</p>
      <p>This is a friendly reminder that <strong>{{event_title}}</strong> is happening in 2 days!</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Date:</strong> {{event_date}}</p>
        <p><strong>Time:</strong> {{event_time}}</p>
        <p><strong>Venue:</strong> {{event_venue}}</p>
      </div>
      <p>We look forward to seeing you there!</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "member_name", "event_title", "event_date", "event_time", "event_venue"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'application_approved',
    'Your {{tenant_name}} Membership Application is Approved!',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Application Approved!</h1>
      <p>Dear {{applicant_name}},</p>
      <p>We are pleased to inform you that your membership application for <strong>{{tenant_name}}</strong> has been approved.</p>
      <p>Your member number is: <strong>{{member_number}}</strong></p>
      <p>You can now log in to your account and start exploring all the benefits of your membership.</p>
      <p>Welcome to the community!</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "applicant_name", "member_number"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'application_rejected',
    'Update on Your {{tenant_name}} Membership Application',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Application Update</h1>
      <p>Dear {{applicant_name}},</p>
      <p>Thank you for your interest in joining <strong>{{tenant_name}}</strong>.</p>
      <p>After careful review, we regret to inform you that your application could not be approved at this time.</p>
      {{#if rejection_reason}}
      <p><strong>Reason:</strong> {{rejection_reason}}</p>
      {{/if}}
      <p>If you believe this is an error or would like to discuss further, please contact us at {{support_email}}.</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "applicant_name", "rejection_reason", "support_email"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'membership_renewal',
    'Your {{tenant_name}} Membership is Expiring Soon',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Membership Renewal Reminder</h1>
      <p>Dear {{member_name}},</p>
      <p>Your <strong>{{tier_name}}</strong> membership with {{tenant_name}} will expire on <strong>{{expiry_date}}</strong>.</p>
      <p>To continue enjoying all member benefits, please renew your membership before the expiry date.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="{{renewal_url}}" style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Renew Now</a>
      </div>
      <p>If you have any questions, contact us at {{support_email}}.</p>
      <p>Best regards,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "member_name", "tier_name", "expiry_date", "renewal_url", "support_email"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'donation_thankyou',
    'Thank You for Your Generous Donation!',
    '<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366F1;">Thank You!</h1>
      <p>Dear {{donor_name}},</p>
      <p>Thank you so much for your generous donation of <strong>{{currency}} {{amount}}</strong> to {{tenant_name}}.</p>
      <p>Your contribution helps us continue serving the community through cultural events, educational programs, and community services.</p>
      {{#if message}}
      <p>Your message: <em>"{{message}}"</em></p>
      {{/if}}
      <p>With heartfelt gratitude,<br/>{{tenant_name}} Team</p>
    </div>',
    '["tenant_name", "donor_name", "currency", "amount", "message"]'::jsonb
  );
