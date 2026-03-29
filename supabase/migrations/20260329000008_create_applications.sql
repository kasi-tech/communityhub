-- Migration: Create applications table with application_status enum

CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'payment_pending'
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  step_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  referrer_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  referrer_confirmed BOOLEAN,
  fraud_score INTEGER,
  fraud_factors JSONB,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  tier_id UUID REFERENCES membership_tiers(id) ON DELETE SET NULL,
  status application_status NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Add the deferred FK from payments to applications
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_application
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;

CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_phone ON applications(phone);
