-- Run in Supabase SQL Editor (or via supabase db push)

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  description text default '',
  nights int not null check (nights > 0),
  capacity int not null check (capacity > 0),
  drivers_needed int not null default 1 check (drivers_needed >= 0),

  distance_miles numeric not null check (distance_miles >= 0),
  mpg numeric not null check (mpg > 0),
  gas_price_per_gallon numeric not null check (gas_price_per_gallon >= 0),
  campsite_permit_cost numeric not null default 0,
  meals_cost numeric not null default 0,
  extra_cost numeric not null default 0,

  image_url text,
  permit_file_url text,
  permit_notes text default '',
  lead_admin_name text default '',

  is_published boolean not null default false,
  budget_snapshot jsonb,
  assumptions text default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_published_idx on public.trips (is_published, updated_at desc);

alter table public.trips enable row level security;

-- MVP: open read for anon/authenticated; tighten before production
create policy "trips_select_all"
  on public.trips for select
  using (true);

create policy "trips_insert_all"
  on public.trips for insert
  with check (true);

create policy "trips_update_all"
  on public.trips for update
  using (true);

create policy "trips_delete_all"
  on public.trips for delete
  using (true);

-- Seed example (optional)
insert into public.trips (
  title, location, description, nights, capacity, drivers_needed,
  distance_miles, mpg, gas_price_per_gallon,
  campsite_permit_cost, meals_cost, extra_cost,
  permit_notes, lead_admin_name, assumptions
) values (
  'Sykes Hot Springs',
  'Big Sur, CA',
  'Overnight backpack to Sykes — permit required.',
  2, 12, 2,
  180, 22, 4.50,
  120, 45, 30,
  'Wilderness permit via Recreation.gov',
  'Alex',
  'Assumption: 12 people keeps per-person under $40.'
);
