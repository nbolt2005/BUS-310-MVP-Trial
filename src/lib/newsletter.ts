import { trackEvent } from "./analytics";
import { getSupabase } from "./supabase";

const STORAGE_KEY = "omw-newsletter-v2";

export type NewsletterSignup = {
  id: string;
  email: string;
  experience_level: string | null;
  created_at: string;
};

function readLocal(): NewsletterSignup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NewsletterSignup[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(signups: NewsletterSignup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signups));
}

export async function subscribeNewsletter(
  email: string,
  experienceLevel?: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    throw new Error("Enter a valid email.");
  }

  const signup: NewsletterSignup = {
    id: crypto.randomUUID(),
    email: normalized,
    experience_level: experienceLevel?.trim() || null,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("newsletter_signups").insert({
      email: signup.email,
      experience_level: signup.experience_level,
      source: "website",
    });
    if (error && error.code !== "23505") {
      throw error;
    }
  } else {
    const existing = readLocal();
    if (!existing.some((s) => s.email === normalized)) {
      writeLocal([signup, ...existing]);
    }
  }

  await trackEvent("newsletter_signup", null, {
    experience_level: signup.experience_level,
  });
}

export async function listNewsletterSignups(): Promise<NewsletterSignup[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("newsletter_signups")
      .select("id, email, experience_level, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as NewsletterSignup[];
  }
  return readLocal();
}

export async function getNewsletterSignupCount(): Promise<number> {
  const supabase = getSupabase();
  if (supabase) {
    const { count, error } = await supabase
      .from("newsletter_signups")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }
  return readLocal().length;
}
