-- Migration: Create email_templates table

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  merge_tags JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, template_key)
);

CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
