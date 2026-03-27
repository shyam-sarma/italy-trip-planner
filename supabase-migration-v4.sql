-- ============================================
-- Italy Trip Planner — Migration V4 (Flight Legs)
-- Run this in Supabase SQL Editor after migration V3
-- ============================================

-- Multi-leg flight support (outbound and return journeys)
CREATE TABLE flight_legs (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL DEFAULT 'outbound',
  leg_order INT NOT NULL DEFAULT 0,
  origin_code TEXT DEFAULT '',
  origin_city TEXT DEFAULT '',
  dest_code TEXT DEFAULT '',
  dest_city TEXT DEFAULT '',
  airline TEXT DEFAULT '',
  flight_number TEXT DEFAULT '',
  aircraft TEXT DEFAULT '',
  depart_date TEXT DEFAULT '',
  depart_time TEXT DEFAULT '',
  arrive_date TEXT DEFAULT '',
  arrive_time TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  class TEXT DEFAULT '',
  confirm_num TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE flight_legs;

-- Enable RLS (allow all for personal app)
ALTER TABLE flight_legs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON flight_legs FOR ALL USING (true) WITH CHECK (true);
