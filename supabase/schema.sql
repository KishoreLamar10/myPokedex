-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) to create the caught table.
--
-- Also enable Anonymous sign-in: Dashboard → Authentication → Providers → Anonymous → Enable.

-- Table: one row per (user, pokemon) when the user has "caught" that Pokémon
create table if not exists public.caught (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pokemon_id int not null,
  created_at timestamptz not null default now(),
  unique(user_id, pokemon_id)
);

-- RLS: users can only see and modify their own rows
alter table public.caught enable row level security;

create policy "Users can read own caught"
  on public.caught for select
  using (auth.uid() = user_id);

create policy "Users can insert own caught"
  on public.caught for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own caught"
  on public.caught for delete
  using (auth.uid() = user_id);

-- Optional: index for fast lookups by user
create index if not exists caught_user_id_idx on public.caught(user_id);
