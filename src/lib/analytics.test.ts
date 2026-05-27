import { describe, expect, it } from "vitest";
import { aggregateEvents } from "./analytics";

describe("aggregateEvents", () => {
  it("counts standard event types and trip views by slug", () => {
    const summary = aggregateEvents([
      { event_type: "page_view", trip_id: null },
      { event_type: "page_view", trip_id: null },
      { event_type: "trip_view", trip_slug: "morro-bay-camping" },
      { event_type: "trip_view", trip_slug: "morro-bay-camping" },
      { event_type: "trip_view", trip_slug: "serenity-swings-hike" },
      { event_type: "save", trip_slug: "morro-bay-camping" },
      { event_type: "share", trip_slug: "morro-bay-camping" },
      { event_type: "cta_click", trip_id: null },
    ]);

    expect(summary.page_views).toBe(2);
    expect(summary.trip_views).toBe(3);
    expect(summary.saves).toBe(1);
    expect(summary.shares).toBe(1);
    expect(summary.cta_clicks).toBe(1);
    expect(summary.trip_view_counts[0]).toEqual({
      trip_slug: "morro-bay-camping",
      count: 2,
    });
  });
});
