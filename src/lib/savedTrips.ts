import { trackEvent } from "./analytics";

const SAVES_KEY = "omw-saved-slugs";
const PAYWALL_KEY = "omw-paywall-answered";

export function getSavedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isTripSaved(slug: string): boolean {
  return getSavedSlugs().includes(slug);
}

export async function toggleSaveTrip(slug: string): Promise<{ saved: boolean; saveCount: number }> {
  const slugs = getSavedSlugs();
  const exists = slugs.includes(slug);
  const next = exists ? slugs.filter((s) => s !== slug) : [...slugs, slug];
  localStorage.setItem(SAVES_KEY, JSON.stringify(next));

  if (!exists) await trackEvent("save", slug);

  return { saved: !exists, saveCount: next.length };
}

export function shouldShowPaywallPrompt(saveCount: number): boolean {
  if (localStorage.getItem(PAYWALL_KEY)) return false;
  return saveCount >= 2;
}

export function markPaywallAnswered(): void {
  localStorage.setItem(PAYWALL_KEY, "1");
}
