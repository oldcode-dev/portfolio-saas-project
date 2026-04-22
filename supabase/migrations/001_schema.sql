-- supabase/migrations/001_schema.sql
-- Run via: supabase db push  OR paste into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name      TEXT NOT NULL,
  client_phone     TEXT NOT NULL,
  client_email     TEXT,
  client_location  TEXT NOT NULL,
  service_name     TEXT NOT NULL,
  service_price    TEXT,
  deposit_amount   INTEGER NOT NULL DEFAULT 0,
  urgency          TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  diagnostic_path  JSONB,
  slot_datetime    TIMESTAMPTZ NOT NULL,
  payment_ref      TEXT UNIQUE,
  status           TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED')),
  notes            TEXT,
  admin_notes      TEXT,
  confirmed_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_slot        ON bookings(slot_datetime);
CREATE INDEX idx_bookings_payment_ref ON bookings(payment_ref);
CREATE INDEX idx_bookings_created_at  ON bookings(created_at DESC);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow client insert"  ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full access"    ON bookings FOR ALL    TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Auth user read all"   ON bookings FOR SELECT TO authenticated USING (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO settings (key, value) VALUES ('admin_available', 'true') ON CONFLICT (key) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin settings"    ON settings FOR ALL    TO service_role USING (true);
CREATE POLICY "Auth read settings"ON settings FOR SELECT TO authenticated USING (true);

-- Services seed
CREATE TABLE IF NOT EXISTS services (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  description TEXT,
  icon       TEXT,
  category   TEXT,
  price      TEXT,
  duration   TEXT,
  deposit    TEXT,
  urgency    TEXT DEFAULT 'MEDIUM',
  is_active  BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON services FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Admin manage services"ON services FOR ALL    TO service_role USING (true) WITH CHECK (true);

INSERT INTO services (slug,name,description,icon,category,price,duration,deposit,urgency,sort_order) VALUES
  ('os-install',    'OS Installation',          'Clean install with driver pack.',                  '💿','Software', '₦8,000',         '2–3 hrs',  '₦3,500','MEDIUM',1),
  ('networking',    'Network Setup & Config',   'Full router setup, Wi-Fi optimisation.',           '📡','Network',  '₦18,000',        'Half day', '₦7,000','LOW',   2),
  ('malware',       'Malware Removal',          'Full scan, adware removal, AV install.',           '🛡️','Security', '₦6,000',         '2 hrs',    '₦3,000','HIGH',  3),
  ('upgrade',       'RAM / SSD Upgrade',        'Source and install RAM or SSD.',                   '🚀','Hardware', '₦6,000',         '2 hrs',    '₦2,500','LOW',   4),
  ('data-recovery', 'Data Recovery',            'Recover files from failed drives.',                '💾','Data',     'From ₦12,000',   '24–72 hrs','₦5,000','HIGH',  5),
  ('thermal',       'Thermal Cleaning',         'Deep clean, thermal paste, fan optimisation.',     '❄️','Hardware', '₦5,000',         '1 hr',     '₦2,000','MEDIUM',6),
  ('security-audit','Security Audit',           'Password hygiene, browser audit, privacy.',        '🔍','Security', '₦7,000',         '2 hrs',    '₦3,000','LOW',   7),
  ('remote',        'Remote Support',           'Screen-share troubleshooting.',                    '🖥️','Remote',  '₦3,000/hr',      '1 hr min', '₦3,000','MEDIUM',8),
  ('custom',        'Custom IT Project',        'Homelab, server, dev env. Quoted after consult.', '🏗️','Custom',  'Quote on Request','TBD',      '₦5,000','LOW',   9)
ON CONFLICT (slug) DO NOTHING;
