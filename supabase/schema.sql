-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor) to create the caught table.
--
-- Also enable Anonymous sign-in: Dashboard → Authentication → Providers → Anonymous → Enable.

-- Table: user profiles with favorite pokemon
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  favorite_pokemon int not null default 25,
  shiny_ids int[] not null default '{}',
  hidden_ability_ids int[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists shiny_ids int[] not null default '{}';

alter table public.user_profiles
  add column if not exists hidden_ability_ids int[] not null default '{}';

-- RLS: users can only see and modify their own profile
alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

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

-- Table: analytics events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create policy "Users can insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);
