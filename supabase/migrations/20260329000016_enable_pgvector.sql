-- Migration: Enable pgvector extension and add embedding columns

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE members ADD COLUMN embedding vector(1536);
ALTER TABLE events ADD COLUMN embedding vector(1536);

-- Indexes for vector similarity search (IVFFlat)
-- NOTE: These indexes require data to exist before creation in production.
-- For initial setup they will work but may need REINDEX after bulk data load.
CREATE INDEX idx_members_embedding ON members USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_events_embedding ON events USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
