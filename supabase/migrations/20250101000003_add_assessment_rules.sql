-- Create assessment_rules table
create table if not exists public.assessment_rules (
    id uuid not null default gen_random_uuid(),
    rule_type text not null check (rule_type in ('range', 'boolean')), -- 'range' for numeric comparisons, 'boolean' for checkboxes
    category text not null, -- 'rank', 'luck_max', 'character', 'other' etc.
    label text, -- For display (e.g., "Lucifer", or "Rank")
    threshold integer, -- For range rules (e.g., 1000)
    price_adjustment integer not null default 0, -- e.g., 5000
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,

    constraint assessment_rules_pkey primary key (id)
);

-- RLS Policies
alter table public.assessment_rules enable row level security;

-- Allow read access to everyone (public calculator needs it)
create policy "Allow public read access"
    on public.assessment_rules for select
    using (true);

-- Allow all access to service role (admin)
-- Note: Admin actions use service role key, so explicit RLS for authenticated users might not be strictly needed if we stick to server actions with service role, but good to have if we switch auth methods.
-- For now, we'll keep it simple and rely on service role for mutations.
