-- 1. Create the function that will handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, favorite_pokemon)
  values (
    new.id, 
    coalesce((new.raw_user_meta_data->>'favorite_pokemon')::int, 25)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger that calls the function after each signup
-- NOTE: If you already had a trigger or some profiles, you might need to
-- "drop trigger if exists on_auth_user_created on auth.users;" first.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. (Optional but recommended) Fill in missing profiles for existing users
insert into public.user_profiles (id, favorite_pokemon)
select id, 25 from auth.users
on conflict (id) do nothing;
