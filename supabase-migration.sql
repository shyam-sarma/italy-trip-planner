-- ============================================
-- Italy Trip Planner — Supabase Migration
-- Run this in Supabase SQL Editor (one time)
-- ============================================

-- Flights (singleton row for trip bookends)
CREATE TABLE flights (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  depart_date TEXT DEFAULT '',
  depart_time TEXT DEFAULT '',
  return_date TEXT DEFAULT '',
  return_time TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO flights (id) VALUES (1);

-- Cities (itinerary stops)
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🏙️',
  tagline TEXT DEFAULT 'New destination',
  arrive TEXT DEFAULT '',
  depart TEXT DEFAULT '',
  color TEXT DEFAULT '#C45B28',
  accent TEXT DEFAULT '#E8A87C',
  must_see JSONB DEFAULT '[]',
  tips JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Accommodation stays per city
CREATE TABLE stays (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  checkin TEXT DEFAULT '',
  checkin_time TEXT DEFAULT '15:00',
  checkout TEXT DEFAULT '',
  checkout_time TEXT DEFAULT '11:00',
  confirm_num TEXT DEFAULT '',
  cost NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  add_to_budget BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Day plans (activities per day per city)
CREATE TABLE day_plans (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Budget expenses (manual entries)
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  city_id TEXT DEFAULT '',
  label TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  city_id TEXT DEFAULT '',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Packing categories and items
CREATE TABLE packing_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE packing_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES packing_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE flights;
ALTER PUBLICATION supabase_realtime ADD TABLE cities;
ALTER PUBLICATION supabase_realtime ADD TABLE stays;
ALTER PUBLICATION supabase_realtime ADD TABLE day_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE packing_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE packing_items;

-- Enable RLS but allow all (no auth needed for a personal trip planner)
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON flights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON day_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON packing_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON packing_items FOR ALL USING (true) WITH CHECK (true);

-- Seed default cities
INSERT INTO cities (id, name, emoji, tagline, arrive, depart, color, accent, must_see, tips, sort_order) VALUES
('rome', 'Rome', '🏛️', 'The Eternal City', '', '', '#C45B28', '#E8A87C', '["Colosseum","Vatican & Sistine Chapel","Trevi Fountain","Pantheon","Roman Forum","Trastevere neighborhood"]', '["Book Vatican tickets weeks in advance","Avoid restaurants right next to tourist spots","Get gelato at small artisan shops"]', 0),
('sorrento', 'Sorrento & Amalfi', '🍋', 'The Lemon Coast', '', '', '#2E7D6F', '#A8D5BA', '["Positano","Ravello gardens","Path of the Gods hike","Amalfi Cathedral","Capri day trip","Limoncello tasting"]', '["Rent a boat for the best coastal views","Book SITA bus tickets early","Visit Positano early morning"]', 1),
('florence', 'Florence', '🎨', 'Renaissance Heart', '', '', '#8B4513', '#D4A574', '["Uffizi Gallery","Duomo & Brunelleschis Dome","Ponte Vecchio","Piazzale Michelangelo (sunset)","Accademia (David)","San Lorenzo Market"]', '["Climb the Duomo dome — book online","Try lampredotto from a street vendor","Piazzale Michelangelo at golden hour"]', 2),
('venice', 'Venice', '🎭', 'City of Canals', '', '', '#1A5276', '#85C1E9', '["St. Marks Basilica","Doges Palace","Rialto Market (morning)","Murano island","Burano island","Grand Canal water bus ride"]', '["Get lost on purpose","Eat cicchetti at bacari bars","Take the vaporetto at sunset"]', 3),
('london', 'London', '🇬🇧', 'The Grand Finale', '', '', '#2C3E50', '#95A5A6', '["Tower of London","Borough Market","British Museum","Camden or Portobello Market","Thames river walk","West End show"]', '["Oyster card or contactless for transit","Sunday roast at a proper pub","Free museums — V&A and Tate Modern"]', 4);

-- Seed default packing
INSERT INTO packing_categories (id, name, sort_order) VALUES ('ess','Essentials',0),('cloth','Clothing',1),('cam','Camera Gear',2),('day','Day Bag',3);
INSERT INTO packing_items (id, category_id, name, sort_order) VALUES
('e1','ess','Passports',0),('e2','ess','Travel insurance docs',1),('e3','ess','Phone chargers & power bank',2),('e4','ess','EU/UK power adapters',3),('e5','ess','Credit/debit cards (notify bank)',4),('e6','ess','Copies of reservations',5),
('c1','cloth','Comfortable walking shoes',0),('c2','cloth','Light layers for May weather',1),('c3','cloth','Dressy outfit for dinners',2),('c4','cloth','Sunglasses & sun hat',3),('c5','cloth','Light rain jacket',4),('c6','cloth','Swimwear (Amalfi!)',5),
('g1','cam','Nikon Z5 II body',0),('g2','cam','35mm lens',1),('g3','cam','Extra batteries & SD cards',2),('g4','cam','Lens cleaning kit',3),('g5','cam','Small tripod / gorilla pod',4),('g6','cam','Camera bag insert',5),
('d1','day','Refillable water bottle',0),('d2','day','Snacks for transit days',1),('d3','day','Guidebook or offline maps',2),('d4','day','Sunscreen SPF 50',3),('d5','day','Small first aid kit',4),('d6','day','Neck wallet / anti-theft pouch',5);

-- Seed default expenses
INSERT INTO expenses (id, city_id, label, amount, category) VALUES ('exp1', 'rome', 'Flights (YYZ → FCO)', 1200, 'transport');

-- Seed default notes
INSERT INTO notes (id, city_id, text) VALUES
('n1', 'rome', 'Check if Borghese Gallery needs advance booking'),
('n2', 'sorrento', 'Research ferry schedule to Capri'),
('n3', 'florence', 'Find that pasta place someone recommended');
