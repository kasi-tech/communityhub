-- Migration: Create donations table

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  donor_name TEXT,
  donor_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  message TEXT,
  show_on_wall BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add the deferred FK from payments to donations
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_donation
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE SET NULL;

CREATE INDEX idx_donations_tenant ON donations(tenant_id);
CREATE INDEX idx_donations_show_on_wall ON donations(show_on_wall);
