-- Migration: Create registrations table with registration_status enum

CREATE TYPE registration_status AS ENUM (
  'confirmed',
  'waitlisted',
  'cancelled',
  'checked_in'
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'confirmed',
  attendee_adults INTEGER DEFAULT 1,
  attendee_children INTEGER DEFAULT 0,
  dietary_preference TEXT,
  special_requirements TEXT,
  total_amount DECIMAL(10,2),
  waitlist_position INTEGER,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, member_id)
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_member ON registrations(member_id);
CREATE INDEX idx_registrations_status ON registrations(status);
