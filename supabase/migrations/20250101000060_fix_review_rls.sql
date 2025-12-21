-- Drop existing policies to start fresh and avoid conflicts
-- We try to drop any potential policy names used in previous attempts
DROP POLICY IF EXISTS "Allow public read" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin all" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin insert" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert" ON public.reviews;
DROP POLICY IF EXISTS "Allow public access" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous select published" ON public.reviews;
DROP POLICY IF EXISTS "Public Read Published" ON public.reviews;
DROP POLICY IF EXISTS "Public Insert" ON public.reviews;
DROP POLICY IF EXISTS "Admin Full Access" ON public.reviews;

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public Read: Allow reading published reviews + allow Admins (authenticated/service) to read all
CREATE POLICY "Public Read Published" ON public.reviews
FOR SELECT USING (
    is_published = true 
    OR auth.role() = 'service_role' 
    OR auth.role() = 'authenticated'
);

-- 2. Public Insert: Allow anyone to submit a review
CREATE POLICY "Public Insert" ON public.reviews
FOR INSERT WITH CHECK (true);

-- 3. Admin Full Access: Allow authenticated users (Admins) and Service Role to Update/Delete
CREATE POLICY "Admin Full Access" ON public.reviews
FOR ALL USING (
    auth.role() = 'service_role' 
    OR auth.role() = 'authenticated'
);
