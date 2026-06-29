create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  identity text not null,
  email text not null,
  mobile_number text not null,
  location text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can create profiles" on public.profiles;
create policy "Anyone can create profiles"
on public.profiles
for insert
to anon, authenticated
with check (
  length(trim(name)) > 0
  and length(trim(identity)) > 0
  and length(trim(email)) > 0
  and length(trim(mobile_number)) > 0
  and length(trim(location)) > 0
);

create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
