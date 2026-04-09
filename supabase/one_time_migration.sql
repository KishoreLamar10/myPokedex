-- ONE-TIME MIGRATION SCRIPT
-- Moves balakishore619@gmail.com data to the new username system.

do $$
declare
  v_user_id uuid;
begin
  -- 1. Find the existing user
  select id into v_user_id 
  from auth.users 
  where email = 'balakishore619@gmail.com';

  if v_user_id is null then
    raise notice 'User with email balakishore619@gmail.com not found. Nothing to migrate.';
  else
    -- 2. Update their email to the new 'shadow' format
    update auth.users
    set email = 'balakishore619@pokedex.local',
        email_confirmed_at = now(),
        updated_at = now()
    where id = v_user_id;

    -- 3. Set a default Secret Question and Answer in their profile
    -- This allows them to log in with username 'balakishore619' 
    -- and use recovery features if needed.
    update public.user_profiles
    set secret_question = 'What city were you born in?',
        secret_answer = 'chennai',
        updated_at = now()
    where id = v_user_id;

    -- 4. Set a temporary password so you can log back in
    -- This uses the extensions.crypt/gen_salt we just verified
    update auth.users
    set encrypted_password = extensions.crypt('pokedex123', extensions.gen_salt('bf')),
        updated_at = now()
    where id = v_user_id;

    raise notice 'Migration successful! Log in using:';
    raise notice 'Username: balakishore619';
    raise notice 'Temporary Password: pokedex123';
  end if;
end $$;
