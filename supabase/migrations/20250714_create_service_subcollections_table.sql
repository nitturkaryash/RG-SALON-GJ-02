-- Create table for service sub-collections
CREATE TABLE IF NOT EXISTS service_subcollections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES service_collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security for this table
ALTER TABLE service_subcollections DISABLE ROW LEVEL SECURITY;

-- Add index on collection_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_subcollections_collection_id ON service_subcollections(collection_id); 