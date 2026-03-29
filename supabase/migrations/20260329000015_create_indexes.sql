-- Migration: Create remaining composite and GIN indexes

-- Composite indexes for common query patterns
CREATE INDEX idx_members_tenant_status ON members(tenant_id, status);
CREATE INDEX idx_members_tenant_role ON members(tenant_id, role);
CREATE INDEX idx_events_tenant_status_date ON events(tenant_id, status, date);
CREATE INDEX idx_registrations_event_status ON registrations(event_id, status);
CREATE INDEX idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX idx_applications_tenant_status ON applications(tenant_id, status);
CREATE INDEX idx_donations_tenant_created ON donations(tenant_id, created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX idx_events_images_gin ON events USING GIN (images);
CREATE INDEX idx_tenants_features_gin ON tenants USING GIN (features);
CREATE INDEX idx_tenants_branding_gin ON tenants USING GIN (branding);
CREATE INDEX idx_applications_step_data_gin ON applications USING GIN (step_data);
CREATE INDEX idx_payments_metadata_gin ON payments USING GIN (metadata);
CREATE INDEX idx_chat_messages_gin ON chat_conversations USING GIN (messages);

-- Array indexes for TEXT[] columns
CREATE INDEX idx_members_interests_gin ON members USING GIN (interests);
CREATE INDEX idx_volunteers_skills_gin ON volunteers USING GIN (skills);
CREATE INDEX idx_volunteers_availability_gin ON volunteers USING GIN (availability);
