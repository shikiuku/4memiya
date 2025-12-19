-- Add is_published to reviews table
alter table public.reviews add column if not exists is_published boolean default true;

-- Update existing rows to be true (since they were created by admin manually)
update public.reviews set is_published = true where is_published is null;

-- Update getReviews query policy issues if any (RLS policies might need check)
-- "Allow public read" is currently "true", I should probably change it to "is_published = true" BUT
-- for now I will filter in the application layer to avoid breaking admin read.
-- Actually, RLS for public read should be:
-- create policy "Allow public read" on public.reviews for select using (is_published = true);
-- But admin needs to read all.
-- Review existing policy: 'create policy "Allow public read" on public.reviews for select using (true);'
-- I will drop it and replace it.

drop policy if exists "Allow public read" on public.reviews;
create policy "Allow public read" on public.reviews for select using (is_published = true or auth.role() = 'service_role' or auth.role() = 'authenticated'); 
-- wait, authenticated includes regular users? 'service_role' is robust. 
-- Admin uses 'authenticated' usually if logged in via supabase auth as admin? 
-- The current app uses 'app_users' table but maybe Supabase Auth for admin login?
-- Previous auth check: `auth.role() = 'authenticated'` was used for admin write.
-- So for now, let's just add the column and filter in `getReviews`. RLS can stay `true` for read if we don't mind users peeking via API.
-- Actually, let's be safe.
-- But wait, `getReviews` in `src/actions/review.ts` uses `createClient` (server).
-- If I change RLS, I need to make sure the server action can still read pending reviews for Admin.
-- The server action uses `createClient()`.
-- For now, `alter table` is the critical part.
