export type GearCategory = {
  name: string;
  items: string[];
};

export type MapLink = {
  label: string;
  url: string;
};

/** Shape used for local seed JSON (no id/timestamps). */
export type TripSeed = Omit<Trip, "id" | "created_at" | "updated_at">;

/** Curated trip — stored in Supabase `trips` or localStorage. */
export type Trip = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  location: string;
  route: string;
  difficulty: string;
  description: string;
  hero_image_url: string;
  attire: string[];
  gear_checklist: GearCategory[];
  necessities_note: string;
  map_links: MapLink[];
  estimated_cost: string;
  time_required: string;
  is_featured: boolean;
  is_current_week: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export function parseGearChecklist(raw: unknown): GearCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
    .map((x) => ({
      name: String(x.name ?? "Gear"),
      items: Array.isArray(x.items) ? x.items.map((i) => String(i)) : [],
    }))
    .filter((x) => x.items.length > 0 || x.name.length > 0);
}

export function parseMapLinks(raw: unknown): MapLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
    .map((x) => ({
      label: String(x.label ?? "Map"),
      url: String(x.url ?? ""),
    }))
    .filter((x) => x.url.length > 0);
}

export function parseAttire(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x)).filter(Boolean);
}
