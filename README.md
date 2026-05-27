# Outdoors Made Weekly (OMW) MVP

Beginner-friendly curated trips, newsletter signups, and analytics — **Supabase** when configured, **localStorage** otherwise. Deploy on **GitHub Pages** with git-tracked SQL migrations (no Vercel).

## Run immediately (no Supabase)

```bash
npm install
npm run dev
```

Open http://localhost:5173. Header badge: **Local demo mode**. Morro Bay + Serenity Swings trips are seeded in the browser.

## Connect Supabase

1. Create or open a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order (paste each file, run once):
   - `supabase/migrations/001_trips_mvp.sql`
   - `supabase/migrations/002_omw_schema.sql`
   - `supabase/migrations/004_analytics_event_types.sql`
3. Copy `.env.example` → `.env.local` (do not commit):
   - `VITE_SUPABASE_URL` — Project Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY` — anon public key
4. Restart: `npm run dev`
5. Badge should show **Supabase connected** (green).

### Curated trips

Trips are read-only in the app. Add rows via SQL Editor / Table Editor on `public.trips`. Required for public URLs:

- `slug` (unique) — e.g. `morro-bay-camping`
- `is_published = true`
- `is_current_week = true` for the “Trip of the week” shortcut (`/trip`)

Migration `002` seeds Morro Bay (current week) and Serenity Swings.

## Verify connection

| Check | Expected |
|-------|----------|
| Header badge | **Supabase connected** |
| Home | Trip of the week + trip list from `trips` |
| Newsletter | Row in `newsletter_signups` |
| Trip page (share / save) | Rows in `analytics_events` |
| `/mvp-analytics` | **MVP Analytics** dashboard (public for class MVP) |

## Environment variables

| Variable | Required for cloud | Description |
|----------|-------------------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anon public key (safe with RLS) |

## Database (migrations)

| Table | Purpose |
|-------|---------|
| `trips` | Curated trips (+ legacy budget columns from 001) |
| `newsletter_signups` | Email + optional experience level |
| `analytics_events` | Views, shares, saves, `newsletter_signup`, `pay_slider_submit`, etc. |

**RLS (MVP):** permissive anon `select` / `insert` on all three — OK for class demos; restrict admin writes and public reads before production.

## GitHub Pages deploy

**Live URL (after deploy):** `https://nbolt2005.github.io/BUS-310-MVP-Trial/`

1. Push to `main` on GitHub.
2. Repo **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
3. Workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) runs on every push to `main` / `master`:
   - Sets `VITE_BASE_PATH=/<repo-name>/`
   - `npm run build` → uploads `dist/` (includes `404.html` for React Router)
   - Deploys via `actions/deploy-pages@v4`

**Permissions** (already in workflow): `contents: read`, `pages: write`, `id-token: write`.

Local production build uses `.env.production` (`VITE_BASE_PATH=/BUS-310-MVP-Trial/`). Rename the repo? CI picks up the new name automatically.

## MVP Analytics (public)

- Route: **`/mvp-analytics`** (aliases: `/admin/analytics`, `/analytics`)
- Footer: **MVP Analytics**
- Shows newsletter signups, pay slider ($0–$20/mo) count/average/median/distribution, trip views per slug, shares, saves, repeat visits

## Tracked events

| Event | When |
|--------|------|
| `newsletter_signup` | Newsletter form submit |
| `pay_slider_submit` | Pay slider submit (`metadata.amount_usd_per_month`) |
| `trip_view` | First trip detail open per browser session |
| `repeat_visit` | Same trip opened again in session |
| `trip_share` / `share` | Share button |
| `trip_save` / `save` | Save trip |
| `paywall_prompt_shown` / `paywall_response` | Optional prompt after 2 saves |
| `contact_submit` | Contact form on home |
| `page_view` | Route change |

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build + `404.html`
- `npm test` — Vitest (budget + analytics aggregation)
