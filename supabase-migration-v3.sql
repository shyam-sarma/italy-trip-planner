-- ============================================
-- Italy Trip Planner — Migration V3 (Document Vault)
-- Run this in Supabase SQL Editor after migration V2
-- ============================================

-- Document vault for storing bookings, tickets, and travel docs
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  city_id TEXT DEFAULT '',
  title TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  content TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  parsed_type TEXT DEFAULT '',
  parsed_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- Enable RLS (allow all for personal app)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON documents FOR ALL USING (true) WITH CHECK (true);
