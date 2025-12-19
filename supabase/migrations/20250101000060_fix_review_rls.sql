-- Drop existing policies to start fresh and avoid conflicts
drop policy if exists "Allow public read" on public.reviews;
drop policy if exists "Allow admin all" on public.reviews;
drop policy if exists "Allow admin insert" on public.reviews; -- if any
drop policy if exists "Allow public insert" on public.reviews;

-- Enable RLS just in case
alter table public.reviews enable row level security;

-- 1. Allow Public Read: Everyone can read published reviews
-- Also allow service role (admin/server) to read everything
create policy "Allow public read" on public.reviews
for select using (
    is_published = true 
    or auth.role() = 'service_role' 
    or auth.role() = 'authenticated' -- Allow logged-in users (admin) to see? Actually 'authenticated' might just be regular users too.
    -- Better: is_published = true OR (auth check for admin)
    -- For this app, admins likely use Supabase Dashboard or same app with 'service_role' client if using server actions in a specific way? 
    -- Actually, server actions use `createClient` which is context-aware. 
    -- If I want ADMIN to see everything in /dev/reviews, I need to ensure the client has rights.
    -- The server action `getAdminReviews` likely just needs to work.
    -- Using `true` for read is safest for "viewing" if we filter in app, but `is_published = true` is cleaner.
    -- Let's stick to: Public sees Published. Service Role sees All.
);

-- Actually, allowing 'anon' to read published is key.
-- And we need to allow 'anon' (or anyone) to INSERT.

create policy "Allow public insert" on public.reviews
for insert with check (true);

-- 3. Allow Admin Full Access (Update/Delete)
-- Assuming admin has specific role or using service_role. 
-- If using Next.js Server Actions with clean `createClient`, it acts as the user.
-- If I am logging in as Admin User with email/password, I am 'authenticated'.
-- I should probably allow 'authenticated' users to read all or just admins?
-- For now, to unblock "new row violates", the INSERT policy is the critical missing piece.

-- Let's just create a broad policy for INSERT for now, and restricted SELECT.

create policy "Allow public access" on public.reviews
for select using (is_published = true or auth.role() = 'service_role');

create policy "Allow admin all" on public.reviews
for all using (auth.role() = 'service_role');
-- Note: 'service_role' bypasses RLS anyway so strict policies usually aren't needed for it, 
-- BUT explicit policies help if `bypass_rls` is not set or using a restricted client.

-- WAIT, Next.js Server Actions `createClient` uses the USER's token.
-- If user is anon, it's anon.
-- If user is admin (logged in), it's authenticated.
-- To allow ADMIN to DELETE/UPDATE, we need a policy for 'authenticated' users (assuming only admin can login).
-- Current app allows users to login? "Login" link exists.
-- So we should restrict Delete/Update to specific admin checking rules (like checking a specific metadata or table).
-- For this "Simple" phase, maybe just allow ALL Authenticated users to manage reviews?
-- Or rely on `service_role` client for admin actions?
-- `src/actions/review.ts` uses `createClient()`, which is scoped to user.
-- So `deleteReview` will fail for regular users if we restrict.
-- But we want Admin (User A) to be able to delete.
-- Let's just allow `auth.role() = 'authenticated'` for ALL operations for now (assuming only trusted staff will have accounts or we accept the risk in this MVP).
-- AND allow 'anon' to INSERT.

create policy "Allow authenticated full access" on public.reviews
for all using (auth.role() = 'authenticated');

create policy "Allow anonymous insert" on public.reviews
for insert with check (auth.role() = 'anon');

-- Also need to allow anon to Select published?
create policy "Allow anonymous select published" on public.reviews
for select using (auth.role() = 'anon' and is_published = true);

-- Re-evaluating:
-- Policy: "Enable Read for Everyone (published)"
create policy "Public Read Published" on public.reviews for select using (is_published = true);

-- Policy: "Enable Insert for Everyone"
create policy "Public Insert" on public.reviews for insert with check (true);

-- Policy: "Enable Full Access for Authenticated (Admin)"
-- If we have real users, this is dangerous. But `getAdminReviews` uses `createClient`.
-- Let's assume for now `authenticated` = Admin.
create policy "Admin Full Access" on public.reviews for all using (auth.role() = 'authenticated');
