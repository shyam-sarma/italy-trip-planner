-- ============================================
-- Italy Trip Planner — Migration V2 (New Features)
-- Run this in Supabase SQL Editor after the initial migration
-- ============================================

-- Inter-city transport bookings
CREATE TABLE transports (
  id TEXT PRIMARY KEY,
  from_city_id TEXT DEFAULT '',
  to_city_id TEXT DEFAULT '',
  type TEXT DEFAULT 'train',
  departure_date TEXT DEFAULT '',
  departure_time TEXT DEFAULT '',
  arrival_time TEXT DEFAULT '',
  booking_ref TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  cost NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Restaurant & cafe bookmarks
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  city_id TEXT DEFAULT '',
  name TEXT NOT NULL,
  cuisine TEXT DEFAULT '',
  price_range TEXT DEFAULT '$$',
  maps_url TEXT DEFAULT '',
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  visited BOOLEAN DEFAULT false,
  rating INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photo journal entries
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  city_id TEXT DEFAULT '',
  day_index INT DEFAULT 0,
  caption TEXT DEFAULT '',
  url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transports;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- Enable RLS (allow all for personal app)
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON transports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON restaurants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON photos FOR ALL USING (true) WITH CHECK (true);
