-- Create teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Team',
  pokemon jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.teams enable row level security;

-- Policies
create policy "Users can read own teams"
  on public.teams for select
  using (auth.uid() = user_id);

create policy "Users can insert own teams"
  on public.teams for insert
  with check (auth.uid() = user_id);

create policy "Users can update own teams"
  on public.teams for update
  using (auth.uid() = user_id);

create policy "Users can delete own teams"
  on public.teams for delete
  using (auth.uid() = user_id);
