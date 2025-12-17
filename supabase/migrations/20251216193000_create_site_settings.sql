create table if not exists site_settings (
    key text primary key,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default value if not exists
insert into site_settings (key, value, description)
values ('inquiry_email', 'メール@gmail.com', 'お問い合わせ用メールアドレス')
on conflict (key) do nothing;

-- RLS
alter table site_settings enable row level security;

-- Everyone can read settings (for public pages)
-- Everyone can read settings (for public pages)
drop policy if exists "Enable read access for all users" on site_settings;
create policy "Enable read access for all users" on site_settings
    for select using (true);

-- Only authenticated users can update (admins)
drop policy if exists "Enable update for authenticated users only" on site_settings;
create policy "Enable update for authenticated users only" on site_settings
    for update using (auth.role() = 'authenticated');

drop policy if exists "Enable insert for authenticated users only" on site_settings;
create policy "Enable insert for authenticated users only" on site_settings
    for insert with check (auth.role() = 'authenticated');
