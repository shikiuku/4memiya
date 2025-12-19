-- 1. Enable RLS on app_users if not already (it usually is)
alter table public.app_users enable row level security;

-- 2. Allow PUBLIC read access to app_users (so everyone can see reviewer names)
-- Drop existing policy if it conflicts or just create new one
drop policy if exists "Public profiles are viewable by everyone" on public.app_users;
create policy "Public profiles are viewable by everyone"
on public.app_users for select
using (true);

-- 3. Update the handle_new_user function to use email prefix as fallback
create or replace function public.handle_new_user()
returns trigger as $$
declare
  username_fallback text;
begin
  -- Get email prefix (e.g., 'aaa' from 'aaa@example.com')
  username_fallback := split_part(new.email, '@', 1);
  
  -- If split failed or empty, fall back to 'User ...'
  if username_fallback is null or length(username_fallback) = 0 then
    username_fallback := 'User ' || substr(new.id::text, 1, 8);
  end if;

  insert into public.app_users (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', username_fallback),
    'user'
  )
  on conflict (id) do update
  set username = excluded.username
  where public.app_users.username like 'User %'; -- Only update if we had a bad fallback before

  return new;
end;
$$ language plpgsql security definer;

-- 4. Retroactively update existing "User ..." names using email
update public.app_users
set username = split_part(auth.users.email, '@', 1)
from auth.users
where public.app_users.id = auth.users.id
and public.app_users.username like 'User %'
and auth.users.email is not null;

-- 5. Notify PostgREST to reload schema cache (essential for new foreign keys/policies)
NOTIFY pgrst, 'reload config';
