import { describe, expect, it } from "vitest";
import { runSloCampaignSimulation, SLO_CAMPAIGN_TRIP_SLUGS } from "./sloCampaign";

describe("runSloCampaignSimulation", () => {
  it("is deterministic for a fixed seed", () => {
    const a = runSloCampaignSimulation(42);
    const b = runSloCampaignSimulation(42);
    expect(b.totals.landingSessions).toBe(a.totals.landingSessions);
    expect(b.days).toEqual(a.days);
  });

  it("returns 7 days and plausible funnel totals", () => {
    const sim = runSloCampaignSimulation(3102026);
    expect(sim.isSimulation).toBe(true);
    expect(sim.days).toHaveLength(7);
    expect(sim.assumptions.budgetUsd).toBe(20);
    expect(sim.totals.landingSessions).toBeGreaterThanOrEqual(16);
    expect(sim.totals.landingSessions).toBeLessThanOrEqual(60);
    expect(sim.totals.tripDetailViews).toBeLessThanOrEqual(sim.totals.tripCardClicks);
    const tripSum = SLO_CAMPAIGN_TRIP_SLUGS.reduce(
      (n, slug) => n + sim.totals.tripDetailViewsByTrip[slug],
      0,
    );
    expect(tripSum).toBe(sim.totals.tripDetailViews);
  });
});
