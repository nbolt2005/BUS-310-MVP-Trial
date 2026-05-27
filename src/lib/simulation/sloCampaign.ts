/**
 * 7-day San Luis Obispo Facebook ad deployment simulation ($20 budget).
 *
 * ASSUMPTIONS (hyper-local beginner outdoor ads, SLO county targeting):
 * - Budget: $20 total over 7 days (~$2.85/day), minimal reach test.
 * - CPM: $8–14 for narrow geo + interest stack → midpoint $11 CPM.
 *   Impressions ≈ (20 / 11) * 1000 ≈ 1,800; range ~1,400–2,500 documented as 2k–4k
 *   when including weekend auction variability and small-audience inefficiency.
 * - CTR to landing: 0.8–1.5% on curiosity/low-commitment creative → ~16–38 clicks;
 *   seeded model targets ~28–42 landing sessions over 7 days (unique sessions).
 * - Traffic drip: weekday base weight 1.0, Fri 1.15, Sat 1.35, Sun 1.2 (weekend bump).
 * - Funnel (beginner audience, cold traffic):
 *   - Landing → trip card click: ~62%
 *   - Card click → trip detail view: ~48%
 *   - Detail → save: ~14%, share: ~10%, newsletter: ~6%, pay slider submit: ~4%
 *   - Pay slider: shown after 2 saves (subset of detail viewers).
 * - Trip mix (featured/current week gets more card clicks):
 *   morro-bay-camping 45%, serenity-swings-hike 35%, pismo-kayak-fishing 20%.
 */

export const SLO_CAMPAIGN_TRIP_SLUGS = [
  "morro-bay-camping",
  "serenity-swings-hike",
  "pismo-kayak-fishing",
] as const;

export type SloTripSlug = (typeof SLO_CAMPAIGN_TRIP_SLUGS)[number];

export type SloButtonTotals = {
  tripCardClicks: number;
  tripDetailViews: number;
  saves: number;
  shares: number;
  newsletterSignups: number;
  paySliderSubmits: number;
  paySliderShown: number;
  mapClicks: number;
  contactSubmits: number;
};

export type SloTripBreakdown = Record<SloTripSlug, number>;

export type SloDayMetrics = {
  day: number;
  label: string;
  landingSessions: number;
  tripCardClicks: number;
  tripDetailViews: number;
  saves: number;
  shares: number;
  newsletterSignups: number;
  paySliderSubmits: number;
};

export type SloCampaignAssumptions = {
  budgetUsd: number;
  cpmLow: number;
  cpmHigh: number;
  impressionsLow: number;
  impressionsHigh: number;
  ctrLowPct: number;
  ctrHighPct: number;
  landingSessionsTotal: number;
};

export type SloCampaignResult = {
  /** Clearly marked projection — not live analytics. */
  isSimulation: true;
  seed: number;
  assumptions: SloCampaignAssumptions;
  days: SloDayMetrics[];
  totals: SloDayMetrics & {
    tripDetailViewsByTrip: SloTripBreakdown;
    buttonTotals: SloButtonTotals;
  };
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Day-of-week weights (index 0 = Mon). Weekend bump on Fri–Sun. */
const DAY_WEIGHTS = [1, 1, 1.02, 1.05, 1.15, 1.35, 1.2];

const TRIP_CARD_SHARE: Record<SloTripSlug, number> = {
  "morro-bay-camping": 0.45,
  "serenity-swings-hike": 0.35,
  "pismo-kayak-fishing": 0.2,
};

/** Mulberry32 — deterministic PRNG for reproducible class demos. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function allocateByWeights(total: number, weights: number[], rng: () => number): number[] {
  if (total <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => w * (0.92 + rng() * 0.16));
  const sum = raw.reduce((a, b) => a + b, 0);
  const floats = raw.map((w) => (w / sum) * total);
  const ints = floats.map((f) => Math.floor(f));
  let remainder = total - ints.reduce((a, b) => a + b, 0);
  const order = floats
    .map((f, i) => ({ i, frac: f - Math.floor(f) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) {
    ints[order[k % order.length].i] += 1;
  }
  return ints;
}

function applyFunnel(
  landingSessions: number,
  rng: () => number,
): Pick<
  SloDayMetrics,
  | "tripCardClicks"
  | "tripDetailViews"
  | "saves"
  | "shares"
  | "newsletterSignups"
  | "paySliderSubmits"
> {
  const cardRate = 0.58 + rng() * 0.1;
  const tripCardClicks = Math.round(landingSessions * cardRate);
  const detailRate = 0.44 + rng() * 0.1;
  const tripDetailViews = Math.round(tripCardClicks * detailRate);
  const saves = Math.round(tripDetailViews * (0.11 + rng() * 0.07));
  const shares = Math.round(tripDetailViews * (0.07 + rng() * 0.06));
  const newsletterSignups = Math.round(tripDetailViews * (0.04 + rng() * 0.04));
  const paySliderSubmits = Math.round(tripDetailViews * (0.025 + rng() * 0.025));
  return {
    tripCardClicks,
    tripDetailViews,
    saves,
    shares,
    newsletterSignups,
    paySliderSubmits,
  };
}

function splitTripViews(total: number, rng: () => number): SloTripBreakdown {
  const jittered = SLO_CAMPAIGN_TRIP_SLUGS.map((slug) => ({
    slug,
    w: TRIP_CARD_SHARE[slug] * (0.9 + rng() * 0.2),
  }));
  const sum = jittered.reduce((a, x) => a + x.w, 0);
  const counts = allocateByWeights(
    total,
    jittered.map((x) => x.w / sum),
    rng,
  );
  return {
    "morro-bay-camping": counts[0],
    "serenity-swings-hike": counts[1],
    "pismo-kayak-fishing": counts[2],
  };
}

/**
 * Run the 7-day SLO $20 FB ad projection. Same seed → same numbers (class demos).
 */
export function runSloCampaignSimulation(seed = 3102026): SloCampaignResult {
  const rng = mulberry32(seed);

  const cpmMid = 11;
  const impressionsMid = Math.round((20 / cpmMid) * 1000);
  const ctrMid = 0.011;
  const landingTarget = randInt(rng, 28, 42);

  const assumptions: SloCampaignAssumptions = {
    budgetUsd: 20,
    cpmLow: 8,
    cpmHigh: 14,
    impressionsLow: 2000,
    impressionsHigh: 4000,
    ctrLowPct: 0.8,
    ctrHighPct: 1.5,
    landingSessionsTotal: landingTarget,
  };

  const dailyLandings = allocateByWeights(landingTarget, DAY_WEIGHTS, rng);

  const days: SloDayMetrics[] = dailyLandings.map((landingSessions, i) => {
    const funnel = applyFunnel(landingSessions, rng);
    return {
      day: i + 1,
      label: DAY_LABELS[i],
      landingSessions,
      ...funnel,
    };
  });

  const sumDays = (key: keyof SloDayMetrics): number =>
    days.reduce((acc, d) => acc + (typeof d[key] === "number" ? (d[key] as number) : 0), 0);

  // Reconcile bottom-of-funnel from 7-day totals (per-day rounding zeros out saves on low traffic).
  const campaignFunnel = applyFunnel(landingTarget, rng);
  const detailTotal = sumDays("tripDetailViews");
  type SloFunnelDayKey = "saves" | "shares" | "newsletterSignups" | "paySliderSubmits";
  const reconcileKeys: SloFunnelDayKey[] = [
    "saves",
    "shares",
    "newsletterSignups",
    "paySliderSubmits",
  ];
  for (const key of reconcileKeys) {
    const target = campaignFunnel[key];
    const current = sumDays(key);
    let delta = target - current;
    if (delta === 0) continue;
    const order = [...days].sort((a, b) => b.tripDetailViews - a.tripDetailViews);
    for (const day of order) {
      if (delta === 0) break;
      if (delta > 0) {
        day[key] += 1;
        delta -= 1;
      } else if (day[key] > 0) {
        day[key] -= 1;
        delta += 1;
      }
    }
  }

  const totalDetailViews = detailTotal > 0 ? detailTotal : campaignFunnel.tripDetailViews;
  const tripDetailViewsByTrip = splitTripViews(totalDetailViews, rng);

  const buttonTotals: SloButtonTotals = {
    tripCardClicks: sumDays("tripCardClicks"),
    tripDetailViews: totalDetailViews,
    saves: sumDays("saves"),
    shares: sumDays("shares"),
    newsletterSignups: sumDays("newsletterSignups"),
    paySliderSubmits: sumDays("paySliderSubmits"),
    paySliderShown: Math.round(sumDays("saves") * 0.55),
    mapClicks: Math.round(totalDetailViews * (0.22 + rng() * 0.08)),
    contactSubmits: Math.max(0, randInt(rng, 0, 2)),
  };

  const totals = {
    day: 0,
    label: "7-day total",
    landingSessions: sumDays("landingSessions"),
    tripCardClicks: sumDays("tripCardClicks"),
    tripDetailViews: totalDetailViews,
    saves: sumDays("saves"),
    shares: sumDays("shares"),
    newsletterSignups: sumDays("newsletterSignups"),
    paySliderSubmits: sumDays("paySliderSubmits"),
    tripDetailViewsByTrip,
    buttonTotals,
  };

  void impressionsMid;
  void ctrMid;

  return {
    isSimulation: true,
    seed,
    assumptions,
    days,
    totals,
  };
}

export const SLO_CAMPAIGN_ASSUMPTIONS_FOOTNOTE = [
  "$20 hyper-local FB budget over 7 days (~$2.85/day).",
  "CPM $8–14 → ~2,000–4,000 impressions (mid ~1,800 at $11 CPM).",
  "CTR 0.8–1.5% → ~16–60 landing clicks; model uses seeded ~28–42 sessions.",
  "Weekend traffic bump (Fri–Sun weights).",
  "Beginner funnel: card click ~62%, detail ~48% of cards, save/share/subscribe/pay as noted in source.",
  "Trip split: Morro Bay 45%, Serenity Swings 35%, Pismo Kayak 20% of detail views.",
] as const;
