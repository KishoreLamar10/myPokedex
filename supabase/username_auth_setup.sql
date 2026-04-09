-- 0. Enable the necessary extension for password hashing
create extension if not exists pgcrypto with schema extensions;

-- 1. Add new columns to user_profiles
alter table public.user_profiles 
add column if not exists secret_question text,
add column if not exists secret_answer text;

-- 2. Update the signup trigger function to capture secret metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, favorite_pokemon, secret_question, secret_answer)
  values (
    new.id, 
    coalesce((new.raw_user_meta_data->>'favorite_pokemon')::int, 25),
    new.raw_user_meta_data->>'secret_question',
    new.raw_user_meta_data->>'secret_answer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. Create the Reset Password RPC
-- This allows us to update auth.users.password without an email link.
-- It is 'security definer' so it has permissions to modify auth.users.
create or replace function public.reset_password_with_secret(
  p_username text,
  p_secret_answer text,
  p_new_password text
)
returns boolean
security definer
set search_path = public, auth, extensions
language plpgsql
as $$
declare
  v_user_id uuid;
  v_stored_answer text;
  v_email text;
begin
  -- 1. Derive the internal email from username
  v_email := p_username || '@pokedex.local';

  -- 2. Find the user and their stored secret answer
  select id, secret_answer into v_user_id, v_stored_answer
  from public.user_profiles
  where id in (select id from auth.users where email = v_email);

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  -- 3. Verify the secret answer (case insensitive and trimmed)
  if lower(trim(v_stored_answer)) != lower(trim(p_secret_answer)) then
    raise exception 'Incorrect secret answer';
  end if;

  -- 4. Update the password in auth.users
  -- Uses the pgcrypto extension directly
  update auth.users
  set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_user_id;

  return true;
end;
$$;

-- 4. Create RPC to fetch secret question (unauthenticated)
create or replace function public.get_user_question(p_username text)
returns text
security definer
set search_path = public, auth
language plpgsql
as $$
declare
  v_question text;
  v_email text;
begin
  v_email := p_username || '@pokedex.local';
  
  select secret_question into v_question
  from public.user_profiles
  where id in (select id from auth.users where email = v_email);
  
  return v_question;
end;
$$;
