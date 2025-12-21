-- Add user_id to reviews table
alter table public.reviews add column if not exists user_id uuid references auth.users(id);

-- Update RLS policies
-- Allow users to update/delete their OWN reviews
DROP POLICY IF EXISTS "Allow user update own" ON public.reviews;
create policy "Allow user update own" on public.reviews
for update using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user delete own" ON public.reviews;
create policy "Allow user delete own" on public.reviews
for delete using (auth.uid() = user_id);

-- Note: Admin policies usually cover everything via "service_role" or explicit role checks.
-- If we need explicit admin policy for these:
-- create policy "Allow admin all" ... (already exists or covered)
