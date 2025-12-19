-- Create a trigger function to copy new users to public.app_users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.app_users (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'User ' || new.id), -- Fallback username
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users
insert into public.app_users (id, username, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'username', raw_user_meta_data->>'name', 'User ' || substr(id::text, 1, 8)),
  'user'
from auth.users
where id not in (select id from public.app_users)
on conflict (id) do nothing;
