-- Migration: Create members table with member_status enum

CREATE TYPE member_status AS ENUM (
  'pending',
  'active',
  'expired',
  'suspended',
  'rejected'
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tier_id UUID REFERENCES membership_tiers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  gender TEXT,
  nationality TEXT,
  postal_code TEXT,
  residential_status TEXT,
  interests TEXT[],
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  status member_status NOT NULL DEFAULT 'pending',
  fraud_score INTEGER,
  member_number TEXT UNIQUE,
  membership_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_tenant ON members(tenant_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_member_number ON members(member_number);
CREATE INDEX idx_members_status ON members(status);
