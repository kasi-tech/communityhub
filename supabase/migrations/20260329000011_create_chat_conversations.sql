-- Migration: Create chat_conversations table

CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  session_id TEXT,
  messages JSONB DEFAULT '[]',
  satisfaction INTEGER,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversations_tenant ON chat_conversations(tenant_id);
CREATE INDEX idx_chat_conversations_member ON chat_conversations(member_id);
CREATE INDEX idx_chat_conversations_session ON chat_conversations(session_id);
