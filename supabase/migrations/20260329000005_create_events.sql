-- Migration: Create events table with event_status enum

CREATE TYPE event_status AS ENUM (
  'draft',
  'published',
  'cancelled',
  'completed'
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat DECIMAL,
  venue_lng DECIMAL,
  capacity INTEGER,
  price_adult DECIMAL(10,2) DEFAULT 0,
  price_child DECIMAL(10,2) DEFAULT 0,
  status event_status NOT NULL DEFAULT 'draft',
  images JSONB DEFAULT '[]',
  cover_image_url TEXT,
  schedule JSONB DEFAULT '[]',
  speakers JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
