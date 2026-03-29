-- Migration: Create family_members table

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child')),
  dob DATE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_family_members_member ON family_members(member_id);
