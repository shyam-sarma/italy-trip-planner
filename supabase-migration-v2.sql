-- ============================================
-- Italy Trip Planner — Mobile Redesign Migration (v2)
-- Run this ONCE in Supabase SQL Editor on existing installs
-- (new installs: supabase-migration.sql already has base schema; still run this after)
-- ============================================

-- Cities: cover gradient tone + country label for the mobile redesign
ALTER TABLE cities ADD COLUMN IF NOT EXISTS country    TEXT DEFAULT 'Italy';
ALTER TABLE cities ADD COLUMN IF NOT EXISTS cover_tone TEXT DEFAULT '#d4a574';

-- Day plans: time-of-day + kind (travel/stay/food/sight/free) + ticket ref
ALTER TABLE day_plans ADD COLUMN IF NOT EXISTS time   TEXT DEFAULT '';
ALTER TABLE day_plans ADD COLUMN IF NOT EXISTS kind   TEXT DEFAULT 'sight';
ALTER TABLE day_plans ADD COLUMN IF NOT EXISTS ticket TEXT DEFAULT '';

-- Flights: expanded metadata for the Wallet screen passes
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_from     TEXT DEFAULT 'YYZ';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_to       TEXT DEFAULT 'FCO';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_gate     TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_seat     TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_class    TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_confirm  TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS dep_duration TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_from     TEXT DEFAULT 'LHR';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_to       TEXT DEFAULT 'YYZ';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_gate     TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_seat     TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_class    TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_confirm  TEXT DEFAULT '';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS ret_duration TEXT DEFAULT '';

-- Backfill cover_tone + country per seeded city (prototype values)
UPDATE cities SET cover_tone = '#d4a574', country = 'Italy' WHERE id = 'rome'     AND (cover_tone IS NULL OR cover_tone = '#d4a574');
UPDATE cities SET cover_tone = '#c2d4a3', country = 'Italy' WHERE id = 'sorrento';
UPDATE cities SET cover_tone = '#c99975', country = 'Italy' WHERE id = 'florence';
UPDATE cities SET cover_tone = '#9cb5c9', country = 'Italy' WHERE id = 'venice';
UPDATE cities SET cover_tone = '#a398b8', country = 'UK'    WHERE id = 'london';
