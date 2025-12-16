-- 1. Create table if NOT exists (just in case)
create table if not exists public.site_settings (
    key text primary key,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.site_settings enable row level security;

-- 3. Create Policies (Drop first to avoid conflicts if they exist)
drop policy if exists "Enable read access for all users" on site_settings;
create policy "Enable read access for all users" on site_settings for select using (true);

drop policy if exists "Enable update for authenticated users only" on site_settings;
create policy "Enable update for authenticated users only" on site_settings for update using (auth.role() = 'authenticated');

drop policy if exists "Enable insert for authenticated users only" on site_settings;
create policy "Enable insert for authenticated users only" on site_settings for insert with check (auth.role() = 'authenticated');

-- 4. Insert Default Values (Idempotent)
insert into site_settings (key, value, description)
values ('inquiry_email', 'メール@gmail.com', 'お問い合わせ用メールアドレス')
on conflict (key) do nothing;

insert into site_settings (key, value, description)
values ('inquiry_note', '※ 通常24時間以内にご返信いたします。' || chr(10) || '※ 買取査定に関するお問い合わせは「買取査定」ページからも可能です。', 'お問い合わせページ下部の注釈テキスト')
on conflict (key) do nothing;

-- 5. ★★★ FORCE RELOAD SCHEMA CACHE ★★★
NOTIFY pgrst, 'reload schema';
