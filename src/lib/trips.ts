import { SEED_TRIPS } from "../data/trips";
import type { Trip, TripSeed } from "../types/trip";
import { parseAttire, parseGearChecklist, parseMapLinks } from "../types/trip";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY = "omw-trips-v3";

type DbRow = {
  id: string;
  slug: string | null;
  title: string;
  tagline: string | null;
  location: string;
  route: string | null;
  difficulty: string | null;
  description: string | null;
  hero_image_url: string | null;
  attire: unknown;
  gear_checklist: unknown;
  necessities_note: string | null;
  map_links: unknown;
  estimated_cost: string | null;
  time_required: string | null;
  is_featured: boolean | null;
  is_current_week: boolean | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

function seedToTrip(seed: TripSeed, id?: string): Trip {
  const now = new Date().toISOString();
  return {
    id: id ?? crypto.randomUUID(),
    ...seed,
    created_at: now,
    updated_at: now,
  };
}

function rowToTrip(row: DbRow): Trip {
  const mapLinks = parseMapLinks(row.map_links);
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    title: row.title,
    tagline: row.tagline ?? "",
    location: row.location,
    route: row.route ?? "",
    difficulty: row.difficulty ?? "beginner",
    description: row.description ?? "",
    hero_image_url: row.hero_image_url ?? "",
    attire: parseAttire(row.attire),
    gear_checklist: parseGearChecklist(row.gear_checklist),
    necessities_note: row.necessities_note ?? "",
    map_links: mapLinks,
    estimated_cost: row.estimated_cost ?? "",
    time_required: row.time_required ?? "",
    is_featured: row.is_featured ?? false,
    is_current_week: row.is_current_week ?? false,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function readLocal(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = SEED_TRIPS.map((s) => seedToTrip(s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const stored = JSON.parse(raw) as Trip[];
    const bySlug = new Map(stored.map((t) => [t.slug, t]));
    let changed = false;
    for (const seed of SEED_TRIPS) {
      if (!bySlug.has(seed.slug)) {
        bySlug.set(seed.slug, seedToTrip(seed));
        changed = true;
      }
    }
    const merged = [...bySlug.values()];
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    const seeded = SEED_TRIPS.map((s) => seedToTrip(s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export type DataMode = "supabase" | "local";

export function getDataMode(): DataMode {
  return isSupabaseConfigured ? "supabase" : "local";
}

export async function listTrips(): Promise<Trip[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("is_published", true)
      .order("is_current_week", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as DbRow[]).map(rowToTrip);
  }
  return readLocal().filter((t) => t.is_published);
}

export async function getCurrentWeekTrip(): Promise<Trip | null> {
  const trips = await listTrips();
  return trips.find((t) => t.is_current_week) ?? trips[0] ?? null;
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToTrip(data as DbRow) : null;
  }
  return readLocal().find((t) => t.slug === slug && t.is_published) ?? null;
}

export async function getTripIdBySlug(slug: string): Promise<string | null> {
  const trip = await getTripBySlug(slug);
  return trip?.id ?? null;
}

/** Alias used by trip list page. */
export async function listPublishedTrips(): Promise<Trip[]> {
  return listTrips();
}
