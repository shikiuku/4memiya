-- Create products table
create table public.products (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  price integer not null,
  status text not null default 'draft' check (status in ('draft', 'on_sale', 'sold_out')),
  rank integer not null default 0,
  luck_max integer not null default 0,
  gacha_charas integer not null default 0,
  badge_power integer not null default 0,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  description_points text,
  description_recommend text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create app_users table
create table public.app_users (
  id uuid not null default gen_random_uuid() primary key,
  username text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Create assessment_rules table
create table public.assessment_rules (
  id uuid not null default gen_random_uuid() primary key,
  category text not null check (category in ('rank', 'luck', 'character_bonus')),
  threshold_min integer not null default 0,
  bonus_amount integer not null default 0,
  character_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Create app_config table
create table public.app_config (
  key text not null primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Enable RLS (Row Level Security) - permissive for now or restrict?
-- For now, enable RLS but allow public read for products/config
alter table public.products enable row level security;
alter table public.app_users enable row level security;
alter table public.assessment_rules enable row level security;
alter table public.app_config enable row level security;

-- Policies (Simple for development)
create policy "Public read products" on public.products for select using (true);
create policy "Public read config" on public.app_config for select using (true);
create policy "Public read rules" on public.assessment_rules for select using (true);
-- Write policies omitted for now (service role can write)
