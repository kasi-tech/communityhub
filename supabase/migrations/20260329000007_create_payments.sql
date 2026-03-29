-- Migration: Create payments table with payment_provider and payment_status enums

CREATE TYPE payment_provider AS ENUM (
  'stripe',
  'paynow',
  'manual',
  'free'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded'
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  application_id UUID, -- FK added after applications table is created
  donation_id UUID,    -- FK added after donations table is created
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SGD',
  provider payment_provider,
  provider_ref TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  refund_amount DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_registration ON payments(registration_id);
CREATE INDEX idx_payments_provider_ref ON payments(provider_ref);
CREATE INDEX idx_payments_status ON payments(status);
