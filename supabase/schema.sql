-- app_users table (CustomAuth)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 6),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'on_sale', 'sold_out')),
  rank INTEGER DEFAULT 1,
  luck_max INTEGER DEFAULT 0,
  gacha_charas INTEGER DEFAULT 0,
  badge_power INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  description_points TEXT,
  description_recommend TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- assessment_rules table
CREATE TABLE IF NOT EXISTS assessment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('rank', 'luck', 'character_bonus')),
  threshold_min INTEGER DEFAULT 0,
  bonus_amount INTEGER NOT NULL DEFAULT 0,
  character_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- app_config table
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Simplified for initial setup)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products, rules, and config
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for assessment_rules" ON assessment_rules FOR SELECT USING (true);
CREATE POLICY "Public read access for app_config" ON app_config FOR SELECT USING (true);

-- Allow full access only to authenticated admins (placeholder for now/manual insert)
-- Ideally, we would check auth.uid() against app_users, but since we are using custom auth,
-- we might handle write permissions via Server Actions (Service Role) and keep RLS read-only for public.

-- tags table (Managed persistent tags)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tags view" ON tags FOR SELECT USING (true);
CREATE POLICY "Admin tags insert" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin tags delete" ON tags FOR DELETE USING (true);
