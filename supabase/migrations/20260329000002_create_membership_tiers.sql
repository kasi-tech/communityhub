-- Migration: Create membership_tiers table

CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER, -- NULL for lifetime
  is_family BOOLEAN NOT NULL DEFAULT false,
  is_lifetime BOOLEAN NOT NULL DEFAULT false,
  benefits JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_membership_tiers_tenant ON membership_tiers(tenant_id);
