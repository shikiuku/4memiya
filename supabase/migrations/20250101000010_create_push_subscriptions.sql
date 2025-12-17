-- Create table for storing Web Push subscriptions
create table if not exists public.push_subscriptions (
    id uuid not null default gen_random_uuid(),
    endpoint text not null,
    p256dh text not null,
    auth text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    
    constraint push_subscriptions_pkey primary key (id),
    constraint push_subscriptions_endpoint_key unique (endpoint)
);

-- Enable RLS (though this is for public anonymous subscription mostly, or admin reading)
alter table public.push_subscriptions enable row level security;

-- Policy: Allow anyone to insert (subscribe)
-- Policy: Allow anyone to insert (subscribe)
drop policy if exists "Allow anonymous insert" on public.push_subscriptions;
create policy "Allow anonymous insert"
    on public.push_subscriptions
    for insert
    to anon, authenticated
    with check (true);

-- Policy: Allow admin select
drop policy if exists "Allow admin select" on public.push_subscriptions;
create policy "Allow admin select"
    on public.push_subscriptions
    for select
    to service_role, authenticated
    using (true);
    
-- Allow service_role to manage all
drop policy if exists "Allow service_role all" on public.push_subscriptions;
create policy "Allow service_role all"
    on public.push_subscriptions
    for all
    to service_role
    using (true)
    with check (true);
