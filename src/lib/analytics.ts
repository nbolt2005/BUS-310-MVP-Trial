import { getNewsletterSignupCount, listNewsletterSignups } from "./newsletter";
import { getTripIdBySlug } from "./trips";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type AnalyticsEventType =
  | "page_view"
  | "trip_view"
  | "share"
  | "save"
  | "cta_click"
  | "trip_share"
  | "trip_save"
  | "trip_unsave"
  | "newsletter_signup"
  | "contact_submit"
  | "paywall_prompt_shown"
  | "paywall_response"
  | "pay_slider_submit"
  | "repeat_visit";

/** App-level names normalized before persisting to `analytics_events`. */
export type TrackEventType =
  | AnalyticsEventType
  | "trip_share"
  | "trip_save"
  | "trip_unsave"
  | "contact_submit"
  | "paywall_prompt_shown"
  | "paywall_response"
  | "pay_slider_submit"
  | "newsletter_signup"
  | "repeat_visit";

export type AnalyticsEvent = {
  id: string;
  event_type: AnalyticsEventType;
  trip_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AnalyticsSummary = {
  page_views: number;
  trip_views: number;
  shares: number;
  saves: number;
  cta_clicks: number;
  newsletter_signups: number;
  trip_view_counts: { trip_slug: string; count: number }[];
};

const STORAGE_KEY = "omw-analytics-v2";
const VISIT_KEY = "omw-visit-slugs";

function readLocal(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(events: AnalyticsEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

type AggregateInput = {
  event_type: string;
  trip_slug?: string | null;
  trip_id?: string | null;
};

export function aggregateEvents(events: AggregateInput[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    page_views: 0,
    trip_views: 0,
    shares: 0,
    saves: 0,
    cta_clicks: 0,
    newsletter_signups: 0,
    trip_view_counts: [],
  };
  const viewCounts = new Map<string, number>();

  for (const e of events) {
    const slug = e.trip_slug ?? e.trip_id ?? null;
    switch (e.event_type) {
      case "page_view":
        summary.page_views += 1;
        break;
      case "trip_view":
        summary.trip_views += 1;
        if (slug) viewCounts.set(slug, (viewCounts.get(slug) ?? 0) + 1);
        break;
      case "share":
      case "trip_share":
        summary.shares += 1;
        break;
      case "save":
      case "trip_save":
        summary.saves += 1;
        break;
      case "cta_click":
        summary.cta_clicks += 1;
        break;
      case "newsletter_signup":
        summary.newsletter_signups += 1;
        break;
      default:
        break;
    }
  }

  summary.trip_view_counts = [...viewCounts.entries()]
    .map(([trip_slug, count]) => ({ trip_slug, count }))
    .sort((a, b) => b.count - a.count);

  return summary;
}

async function resolveTripId(tripSlug: string | null): Promise<string | null> {
  if (!tripSlug) return null;
  return getTripIdBySlug(tripSlug);
}

function normalizeTrackEvent(
  type: TrackEventType,
  metadata: Record<string, unknown>,
): { event_type: AnalyticsEventType; metadata: Record<string, unknown> } {
  switch (type) {
    case "trip_share":
      return { event_type: "share", metadata: { ...metadata, omw_action: "trip_share" } };
    case "trip_save":
      return { event_type: "save", metadata: { ...metadata, omw_action: "trip_save" } };
    case "trip_unsave":
      return { event_type: "save", metadata: { ...metadata, omw_action: "trip_unsave" } };
    case "contact_submit":
      return { event_type: "cta_click", metadata: { ...metadata, cta: "contact_submit" } };
    case "paywall_prompt_shown":
      return { event_type: "cta_click", metadata: { ...metadata, cta: "paywall_prompt_shown" } };
    case "paywall_response":
      return { event_type: "cta_click", metadata: { ...metadata, cta: "paywall_response" } };
    case "pay_slider_submit":
      return { event_type: "cta_click", metadata: { ...metadata, cta: "pay_slider_submit" } };
    case "newsletter_signup":
      return { event_type: "cta_click", metadata: { ...metadata, cta: "newsletter_signup" } };
    case "repeat_visit":
      return { event_type: "trip_view", metadata: { ...metadata, repeat: true } };
    default:
      return { event_type: type, metadata };
  }
}

export async function trackEvent(
  type: TrackEventType,
  tripSlug: string | null = null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const normalized = normalizeTrackEvent(type, metadata);
  const trip_id = tripSlug ? await resolveTripId(tripSlug) : null;
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    event_type: normalized.event_type,
    trip_id,
    metadata: {
      ...normalized.metadata,
      ...(tripSlug ? { trip_slug: tripSlug } : {}),
    },
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: event.event_type,
      trip_id: event.trip_id,
      metadata: event.metadata,
    });
    if (error) console.warn("[OMW] analytics insert failed:", error.message);
    return;
  }

  const events = readLocal();
  events.push(event);
  writeLocal(events);
}

export function recordTripVisit(slug: string): void {
  try {
    const raw = sessionStorage.getItem(VISIT_KEY);
    const visited: string[] = raw ? JSON.parse(raw) : [];
    if (visited.includes(slug)) {
      void trackEvent("repeat_visit", slug);
      return;
    }
    visited.push(slug);
    sessionStorage.setItem(VISIT_KEY, JSON.stringify(visited));
  } catch {
    /* ignore */
  }
  void trackEvent("trip_view", slug);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const newsletter_signups = await getNewsletterSignupCount();
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, trip_id, metadata");
    if (error) throw error;
    const rows: AggregateInput[] = (data ?? []).map((row) => ({
      event_type: row.event_type as string,
      trip_slug: (row.metadata as Record<string, unknown>)?.trip_slug as string | undefined,
      trip_id: row.trip_id as string | null,
    }));
    return { ...aggregateEvents(rows), newsletter_signups };
  }

  const rows: AggregateInput[] = readLocal().map((e) => ({
    event_type: e.event_type,
    trip_slug: e.metadata.trip_slug as string | undefined,
    trip_id: e.trip_id,
  }));
  return { ...aggregateEvents(rows), newsletter_signups };
}

export type AssumptionMetrics = {
  newsletterSignups: number;
  contactSubmits: number;
  tripViews: Record<string, number>;
  tripShares: Record<string, number>;
  tripSaves: Record<string, number>;
  repeatVisits: number;
  paywallShown: number;
  paywallYes: number;
  paywallNo: number;
  paywallMaybe: number;
};

export async function getAssumptionMetrics(): Promise<AssumptionMetrics> {
  const supabase = getSupabase();
  const raw = supabase
    ? (
        (
          await supabase
            .from("analytics_events")
            .select("event_type, trip_id, metadata, created_at")
            .order("created_at", { ascending: false })
            .limit(1000)
        ).data ?? []
      )
    : readLocal();

  const metrics: AssumptionMetrics = {
    newsletterSignups: await getNewsletterSignupCount(),
    contactSubmits: 0,
    tripViews: {},
    tripShares: {},
    tripSaves: {},
    repeatVisits: 0,
    paywallShown: 0,
    paywallYes: 0,
    paywallNo: 0,
    paywallMaybe: 0,
  };

  for (const row of raw) {
    const meta =
      "metadata" in row && row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {};
    const slug = String(meta.trip_slug ?? ("trip_id" in row ? row.trip_id : null) ?? "_site");
    const event_type = "event_type" in row ? row.event_type : "";

    switch (event_type) {
      case "trip_view":
        metrics.tripViews[slug] = (metrics.tripViews[slug] ?? 0) + 1;
        break;
      case "repeat_visit":
        metrics.repeatVisits += 1;
        break;
      case "share":
      case "trip_share":
        metrics.tripShares[slug] = (metrics.tripShares[slug] ?? 0) + 1;
        break;
      case "save":
      case "trip_save":
        metrics.tripSaves[slug] = (metrics.tripSaves[slug] ?? 0) + 1;
        break;
      case "newsletter_signup":
        metrics.newsletterSignups += 1;
        break;
      case "contact_submit":
        metrics.contactSubmits += 1;
        break;
      case "paywall_prompt_shown":
        metrics.paywallShown += 1;
        break;
      case "paywall_response": {
        const answer = String(meta.answer ?? "");
        if (answer === "yes") metrics.paywallYes += 1;
        else if (answer === "no") metrics.paywallNo += 1;
        else metrics.paywallMaybe += 1;
        break;
      }
      case "cta_click": {
        const cta = String(meta.cta ?? "");
        if (cta === "contact_submit") metrics.contactSubmits += 1;
        if (cta === "newsletter_signup") metrics.newsletterSignups += 1;
        if (cta === "paywall_prompt_shown") metrics.paywallShown += 1;
        if (cta === "paywall_response") {
          const answer = String(meta.answer ?? "");
          if (answer === "yes") metrics.paywallYes += 1;
          else if (answer === "no") metrics.paywallNo += 1;
          else metrics.paywallMaybe += 1;
        }
        break;
      }
      default:
        break;
    }
  }

  return metrics;
}

export type MvpAnalytics = AssumptionMetrics & {
  distinctNewsletterEmails: number;
  totalTripViews: number;
  totalShares: number;
  totalSaves: number;
  paySliderCount: number;
  paySliderAverage: number | null;
  paySliderMedian: number | null;
  paySliderDistribution: { amount: number; count: number }[];
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export async function getMvpAnalytics(): Promise<MvpAnalytics> {
  const base = await getAssumptionMetrics();
  const signups = await listNewsletterSignups();
  const distinctNewsletterEmails = new Set(signups.map((s) => s.email)).size;

  const supabase = getSupabase();
  const payRows = supabase
    ? (
        (
          await supabase
            .from("analytics_events")
            .select("event_type, metadata")
            .in("event_type", ["pay_slider_submit", "cta_click"])
        ).data ?? []
      )
    : readLocal().filter(
        (e) => e.event_type === "pay_slider_submit" || e.event_type === "cta_click",
      );

  const payAmounts: number[] = [];
  const payDist = new Map<number, number>();

  for (const row of payRows) {
    const meta =
      "metadata" in row && row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {};
    const event_type = "event_type" in row ? row.event_type : "";
    const isPay =
      event_type === "pay_slider_submit" || String(meta.cta ?? "") === "pay_slider_submit";
    if (!isPay) continue;
    const amount = Number(meta.amount_usd_per_month);
    if (!Number.isNaN(amount)) {
      payAmounts.push(amount);
      payDist.set(amount, (payDist.get(amount) ?? 0) + 1);
    }
  }

  const totalTripViews = Object.entries(base.tripViews)
    .filter(([slug]) => slug !== "_site")
    .reduce((sum, [, n]) => sum + n, 0);

  return {
    ...base,
    distinctNewsletterEmails,
    totalTripViews,
    totalShares: Object.values(base.tripShares).reduce((a, b) => a + b, 0),
    totalSaves: Object.values(base.tripSaves).reduce((a, b) => a + b, 0),
    paySliderCount: payAmounts.length,
    paySliderAverage:
      payAmounts.length > 0
        ? Math.round((payAmounts.reduce((a, b) => a + b, 0) / payAmounts.length) * 10) / 10
        : null,
    paySliderMedian: median(payAmounts),
    paySliderDistribution: [...payDist.entries()]
      .map(([amount, count]) => ({ amount, count }))
      .sort((a, b) => a.amount - b.amount),
  };
}

export function getDataModeLabel(): string {
  return isSupabaseConfigured ? "Supabase connected" : "Local demo mode";
}
