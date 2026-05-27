-- OMW: extend trips + newsletter_signups + analytics_events (idempotent)

alter table public.trips add column if not exists slug text;
alter table public.trips add column if not exists tagline text default '';
alter table public.trips add column if not exists route text default '';
alter table public.trips add column if not exists hero_image_url text;
alter table public.trips add column if not exists time_required text default '';
alter table public.trips add column if not exists estimated_cost text default '';
alter table public.trips add column if not exists difficulty text default 'beginner';
alter table public.trips add column if not exists attire jsonb default '[]'::jsonb;
alter table public.trips add column if not exists gear_checklist jsonb default '[]'::jsonb;
alter table public.trips add column if not exists necessities_note text default '';
alter table public.trips add column if not exists map_links jsonb default '[]'::jsonb;
alter table public.trips add column if not exists map_url text;
alter table public.trips add column if not exists is_featured boolean not null default false;
alter table public.trips add column if not exists is_current_week boolean not null default false;

create unique index if not exists trips_slug_unique_idx
  on public.trips (slug)
  where slug is not null;

create index if not exists trips_current_week_idx
  on public.trips (is_current_week desc, updated_at desc)
  where is_published = true;

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  experience_level text,
  source text default 'website',
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_signups_email_lower_idx
  on public.newsletter_signups (lower(email));

alter table public.newsletter_signups enable row level security;

drop policy if exists "newsletter_insert_anon" on public.newsletter_signups;
create policy "newsletter_insert_anon"
  on public.newsletter_signups for insert
  with check (true);

drop policy if exists "newsletter_select_all" on public.newsletter_signups;
create policy "newsletter_select_all"
  on public.newsletter_signups for select
  using (true);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('page_view', 'trip_view', 'share', 'save', 'cta_click')
  ),
  trip_id uuid references public.trips (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_type_created_idx
  on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_trip_idx
  on public.analytics_events (trip_id)
  where trip_id is not null;

alter table public.analytics_events enable row level security;

drop policy if exists "analytics_insert_anon" on public.analytics_events;
create policy "analytics_insert_anon"
  on public.analytics_events for insert
  with check (true);

drop policy if exists "analytics_select_all" on public.analytics_events;
create policy "analytics_select_all"
  on public.analytics_events for select
  using (true);

-- Seed Morro Bay (idempotent by slug)
insert into public.trips (
  slug, title, tagline, location, route, description, hero_image_url,
  attire, gear_checklist, necessities_note, map_links, estimated_cost, time_required,
  difficulty, is_featured, is_current_week, is_published,
  nights, capacity, drivers_needed,
  distance_miles, mpg, gas_price_per_gallon,
  campsite_permit_cost, meals_cost, extra_cost
) values (
  'morro-bay-camping',
  'Morro Bay State Beach camping weekend',
  'Beginner-friendly camping + short hikes — low friction, social, shareable.',
  'Morro Bay State Beach camping',
  'SLO → Hwy 1 to Morro Bay',
  E'A low-friction weekend for people new to camping and coastal hikes.

## Saturday
- Morning hike at Serenity Swings (beginner)
- Start: Poly Canyon Trail
- Estimated time: ~2 hours

## Sunday
- Easy pack-up before heading home',
  'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1200&q=80',
  '["Hiking shoes","Long sleeve (optional)","Shirt","Flexible pants"]'::jsonb,
  '[
    {"name":"Dinner","items":["Burgers/tacos","Chips + salsa","S''mores"]},
    {"name":"Breakfast","items":["Instant coffee","Eggs/bacon","Breakfast burritos"]},
    {"name":"Snacks","items":["Trail mix","Fruit","Jerky","Granola bars"]},
    {"name":"Shelter","items":["Tent","Stakes + mallet","Sleeping bag","Sleeping pad","Tarp"]},
    {"name":"Camp Kitchen","items":["Camp stove","Fuel","Lighter","Cooler + ice","Water jug","Plates","Trash bags"]},
    {"name":"Clothing","items":["Warm layers","Beanie","Windbreaker","Hiking shoes","Extra socks"]},
    {"name":"Essentials","items":["Headlamps","Portable charger","Sunscreen","First aid","Camp chairs"]}
  ]'::jsonb,
  'See gear checklist above.',
  '[
    {"label":"Morro Bay State Beach","url":"https://www.google.com/maps/search/?api=1&query=Morro+Bay+State+Beach+Campground"},
    {"label":"Poly Canyon Trailhead","url":"https://www.google.com/maps/search/?api=1&query=Poly+Canyon+Trailhead+San+Luis+Obispo+CA"}
  ]'::jsonb,
  '$35–55/person (gas split + shared food + campsite)',
  'Weekend (Fri eve – Sun)',
  'beginner',
  true,
  true,
  true,
  2, 12, 2,
  120, 25, 4.5,
  80, 40, 25
)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  location = excluded.location,
  route = excluded.route,
  description = excluded.description,
  hero_image_url = excluded.hero_image_url,
  attire = excluded.attire,
  gear_checklist = excluded.gear_checklist,
  necessities_note = excluded.necessities_note,
  map_links = excluded.map_links,
  estimated_cost = excluded.estimated_cost,
  time_required = excluded.time_required,
  difficulty = excluded.difficulty,
  is_featured = excluded.is_featured,
  is_current_week = excluded.is_current_week,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.trips (
  slug, title, tagline, location, route, description, hero_image_url,
  attire, gear_checklist, necessities_note, map_links, estimated_cost, time_required,
  difficulty, is_featured, is_current_week, is_published,
  nights, capacity, drivers_needed,
  distance_miles, mpg, gas_price_per_gallon,
  campsite_permit_cost, meals_cost, extra_cost
) values (
  'serenity-swings-hike',
  'Serenity Swings morning hike',
  'Ultra-low-commitment 2-hour beginner hike — invite a friend.',
  'Poly Canyon → Serenity Swings',
  'Start at Poly Canyon Trail',
  E'Poly Canyon Trail → Serenity Swings (beginner). ~2 hours round trip.',
  'https://images.unsplash.com/photo-1551632811-ec551c64179c?w=1200&q=80',
  '["Hiking shoes","Long sleeve (optional)","Shirt","Flexible pants"]'::jsonb,
  '[{"name":"Pack light","items":["Water","Snacks","Hiking shoes","Layers","Sunscreen"]}]'::jsonb,
  'Water, snacks, and sun protection are enough.',
  '[
    {"label":"Poly Canyon Trailhead","url":"https://www.google.com/maps/search/?api=1&query=Poly+Canyon+Trailhead+San+Luis+Obispo+CA"},
    {"label":"Serenity Swings area","url":"https://www.google.com/maps/search/?api=1&query=Serenity+Swings+San+Luis+Obispo+CA"}
  ]'::jsonb,
  '$5–15/person (gas + snacks)',
  '~2 hours (morning)',
  'beginner',
  true,
  false,
  true,
  1, 8, 1,
  15, 28, 4.5,
  0, 5, 0
)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  location = excluded.location,
  route = excluded.route,
  description = excluded.description,
  hero_image_url = excluded.hero_image_url,
  attire = excluded.attire,
  gear_checklist = excluded.gear_checklist,
  necessities_note = excluded.necessities_note,
  map_links = excluded.map_links,
  estimated_cost = excluded.estimated_cost,
  time_required = excluded.time_required,
  difficulty = excluded.difficulty,
  is_featured = excluded.is_featured,
  is_current_week = excluded.is_current_week,
  is_published = excluded.is_published,
  updated_at = now();

-- Seed Pismo kayak fishing (idempotent by slug)
insert into public.trips (
  slug, title, tagline, location, route, description, hero_image_url,
  attire, gear_checklist, necessities_note, map_links, estimated_cost, time_required,
  difficulty, is_featured, is_current_week, is_published,
  nights, capacity, drivers_needed,
  distance_miles, mpg, gas_price_per_gallon,
  campsite_permit_cost, meals_cost, extra_cost
) values (
  'pismo-kayak-fishing',
  'Kayak Fishing at Pismo Beach',
  'Beginner-friendly half-day on calm water — social, shareable, no expert gear required.',
  'Pismo Beach, CA',
  'San Luis Obispo → US-101 S → Pismo Beach (~20–30 min)',
  E'Try kayak fishing from shore or a protected bay — calm water, easy to invite a friend.

Rent a sit-on-top kayak, paddle short distances, fish with simple tackle. CA sport fishing license (+ report card if required) before you go.',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
  '["Quick-dry shirt","Water shoes","Light windbreaker","Hat and sunglasses"]'::jsonb,
  '[
    {"name":"Kayak & safety","items":["Kayak + paddle (rent locally if needed)","Coast Guard–approved life jacket (PFD)","Whistle on PFD"]},
    {"name":"Fishing","items":["Rod and reel","Basic tackle: hooks, weights, swivels","Bait","Pliers / line cutters","Small cooler with ice (optional)"]},
    {"name":"Licenses (California)","items":["CA sport fishing license","Ocean report card if required — check CDFW"]},
    {"name":"Sun & hydration","items":["Sunscreen","1–2 L water per person","Snacks"]},
    {"name":"Stay dry & comfortable","items":["Dry bag","Change of clothes","Towel"]},
    {"name":"Tech","items":["Phone in waterproof case"]}
  ]'::jsonb,
  'Rent kayaks near the beach if needed; license info at wildlife.ca.gov.',
  '[
    {"label":"Pismo Beach","url":"https://www.google.com/maps/search/?api=1&query=Pismo+Beach+CA"},
    {"label":"Pismo Beach kayak rentals (area)","url":"https://www.google.com/maps/search/?api=1&query=kayak+rental+Pismo+Beach+CA"},
    {"label":"Port San Luis / Avila launch (calm bay option)","url":"https://www.google.com/maps/search/?api=1&query=Port+San+Luis+Harbor+CA"}
  ]'::jsonb,
  '$45–85/person (kayak rental, license, bait, gas from SLO)',
  'Morning half-day (4–5 hours)',
  'beginner',
  true,
  false,
  true,
  0, 4, 1,
  35, 28, 4.5,
  0, 15, 25
)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  location = excluded.location,
  route = excluded.route,
  description = excluded.description,
  hero_image_url = excluded.hero_image_url,
  attire = excluded.attire,
  gear_checklist = excluded.gear_checklist,
  necessities_note = excluded.necessities_note,
  map_links = excluded.map_links,
  estimated_cost = excluded.estimated_cost,
  time_required = excluded.time_required,
  difficulty = excluded.difficulty,
  is_featured = excluded.is_featured,
  is_current_week = excluded.is_current_week,
  is_published = excluded.is_published,
  updated_at = now();
