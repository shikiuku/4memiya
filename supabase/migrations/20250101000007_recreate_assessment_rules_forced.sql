-- Drop table if exists to ensure clean slate due to previous failed migration
drop table if exists public.assessment_rules;

-- Recreate assessment_rules table
create table public.assessment_rules (
    id uuid not null default gen_random_uuid(),
    rule_type text not null check (rule_type in ('range', 'boolean')),
    category text not null,
    label text,
    threshold integer,
    price_adjustment integer not null default 0,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,

    constraint assessment_rules_pkey primary key (id)
);

-- RLS Policies
alter table public.assessment_rules enable row level security;

-- Allow read access to everyone
create policy "Allow public read access"
    on public.assessment_rules for select
    using (true);

-- Allow all access to service role (admin)
-- Service role bypasses RLS, but explicit policies can be useful if we ever switch to user-based auth for admin.
-- For now, relying on service role key for admin mutations.
