import { useMemo } from "react";
import {
  runSloCampaignSimulation,
  SLO_CAMPAIGN_ASSUMPTIONS_FOOTNOTE,
  SLO_CAMPAIGN_TRIP_SLUGS,
  type SloCampaignResult,
} from "../lib/simulation/sloCampaign";

function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

type Props = {
  /** Optional seed override for reproducible demos. */
  seed?: number;
};

export function SloCampaignSimulation({ seed }: Props) {
  const sim: SloCampaignResult = useMemo(
    () => runSloCampaignSimulation(seed),
    [seed],
  );

  const { assumptions, days, totals } = sim;

  return (
    <section
      className="card simulation-panel"
      aria-labelledby="slo-sim-heading"
      data-testid="slo-campaign-simulation"
    >
      <div className="simulation-banner" role="note">
        <strong>Projection only</strong> — modeled outcomes for a $20 SLO Facebook ad test.
        Not mixed with live visitor data below.
      </div>

      <h2 id="slo-sim-heading">SLO Campaign Simulation (7 days · $20 FB ads)</h2>
      <p className="muted">
        Deterministic model (seed {sim.seed}) · ~{assumptions.landingSessionsTotal} projected
        landing sessions · CPM {assumptions.cpmLow}–${assumptions.cpmHigh}
      </p>

      <div className="metrics-grid simulation-summary-grid">
        <div className="metric card">
          <span className="metric-value">{totals.landingSessions}</span>
          <span className="metric-label">Site sessions (landing)</span>
        </div>
        <div className="metric card">
          <span className="metric-value">{totals.tripCardClicks}</span>
          <span className="metric-label">Trip card clicks</span>
        </div>
        <div className="metric card">
          <span className="metric-value">{totals.tripDetailViews}</span>
          <span className="metric-label">Trip detail views</span>
        </div>
        <div className="metric card">
          <span className="metric-value">{totals.newsletterSignups}</span>
          <span className="metric-label">Newsletter signups</span>
        </div>
        <div className="metric card">
          <span className="metric-value">{totals.paySliderSubmits}</span>
          <span className="metric-label">Pay slider submits</span>
        </div>
      </div>

      <h3>Per day (days 1–7)</h3>
      <div className="table-scroll">
        <table className="metrics-table simulation-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Visits</th>
              <th>Trip clicks</th>
              <th>Detail views</th>
              <th>Saves</th>
              <th>Shares</th>
              <th>Subscribe</th>
              <th>Pay slider</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day}>
                <td>
                  {d.day} · {d.label}
                </td>
                <td>{d.landingSessions}</td>
                <td>{d.tripCardClicks}</td>
                <td>{d.tripDetailViews}</td>
                <td>{d.saves}</td>
                <td>{d.shares}</td>
                <td>{d.newsletterSignups}</td>
                <td>{d.paySliderSubmits}</td>
              </tr>
            ))}
            <tr className="sim-total-row">
              <td>
                <strong>Total</strong>
              </td>
              <td>{totals.landingSessions}</td>
              <td>{totals.tripCardClicks}</td>
              <td>{totals.tripDetailViews}</td>
              <td>{totals.saves}</td>
              <td>{totals.shares}</td>
              <td>{totals.newsletterSignups}</td>
              <td>{totals.paySliderSubmits}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Per-button / action totals</h3>
      <table className="metrics-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Projected count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trip card clicks (landing)</td>
            <td>{totals.buttonTotals.tripCardClicks}</td>
          </tr>
          <tr>
            <td>Trip detail views</td>
            <td>{totals.buttonTotals.tripDetailViews}</td>
          </tr>
          <tr>
            <td>Saves (“I want to do this”)</td>
            <td>{totals.buttonTotals.saves}</td>
          </tr>
          <tr>
            <td>Shares</td>
            <td>{totals.buttonTotals.shares}</td>
          </tr>
          <tr>
            <td>Newsletter signups</td>
            <td>{totals.buttonTotals.newsletterSignups}</td>
          </tr>
          <tr>
            <td>Pay slider shown (after 2 saves)</td>
            <td>{totals.buttonTotals.paySliderShown}</td>
          </tr>
          <tr>
            <td>Pay slider submits</td>
            <td>{totals.buttonTotals.paySliderSubmits}</td>
          </tr>
          <tr>
            <td>Map / directions clicks</td>
            <td>{totals.buttonTotals.mapClicks}</td>
          </tr>
          <tr>
            <td>Contact form submits</td>
            <td>{totals.buttonTotals.contactSubmits}</td>
          </tr>
        </tbody>
      </table>

      <h3>Per-trip detail views</h3>
      <table className="metrics-table">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Detail views</th>
          </tr>
        </thead>
        <tbody>
          {SLO_CAMPAIGN_TRIP_SLUGS.map((slug) => (
            <tr key={slug}>
              <td>{formatSlug(slug)}</td>
              <td>{totals.tripDetailViewsByTrip[slug]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <details className="simulation-footnote">
        <summary>Model assumptions (estimates)</summary>
        <ul>
          {SLO_CAMPAIGN_ASSUMPTIONS_FOOTNOTE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
