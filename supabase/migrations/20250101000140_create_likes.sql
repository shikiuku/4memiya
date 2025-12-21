create table if not exists public.likes (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (id),
  constraint likes_user_id_product_id_key unique (user_id, product_id)
);

-- RLS
alter table public.likes enable row level security;

DROP POLICY IF EXISTS "Users can view their own likes" ON public.likes;
create policy "Users can view their own likes"
  on public.likes for select
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
create policy "Users can create their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Add likes count to products view or just query it? 
-- for sort by likes, we might need a count.
-- Let's add a materialized view or just a function later if needed. For now, basic sorting can use a join count if dataset is small, or a counter cache.
-- Given the "sort by likes" requirement earlier, let's stick to simple implementation first.
