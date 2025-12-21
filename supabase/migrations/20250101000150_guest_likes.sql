-- Add guest_id column
alter table public.likes add column if not exists guest_id text;

-- Make user_id nullable
alter table public.likes alter column user_id drop not null;

-- Drop old unique constraint
alter table public.likes drop constraint if exists likes_user_id_product_id_key;

-- Add new constraints to ensure one like per user OR guest per product
create unique index if not exists likes_user_product_idx on public.likes (user_id, product_id) where user_id is not null;
create unique index if not exists likes_guest_product_idx on public.likes (guest_id, product_id) where guest_id is not null;

-- Ensure at least one id is present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_owner_check') THEN
    alter table public.likes add constraint likes_owner_check check (user_id is not null or guest_id is not null);
  END IF;
END $$;

-- Update RLS policies
drop policy if exists "Users can view their own likes" on public.likes;
drop policy if exists "Users can create their own likes" on public.likes;
drop policy if exists "Users can delete their own likes" on public.likes;

-- Allow public read of likes (for counting)
drop policy if exists "Public view likes" on public.likes;
create policy "Public view likes" on public.likes for select using (true);

-- Authenticated users policies
drop policy if exists "Users insert own likes" on public.likes;
create policy "Users insert own likes" on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own likes" on public.likes;
create policy "Users delete own likes" on public.likes for delete using (auth.uid() = user_id);

-- Anonymous policies
drop policy if exists "Anon insert guest likes" on public.likes;
create policy "Anon insert guest likes" on public.likes for insert with check (auth.role() = 'anon' and guest_id is not null);
-- For delete, we need to ensure the guest owns it. 
-- Since we can't easily verify the cookie in RLS without custom headers/claims, 
-- we will omit the Delete policy for Anon here and rely on the Server Action using a Service Role client for guest deletions (unlikes).
