import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SloCampaignSimulation } from "../components/SloCampaignSimulation";
import { getMvpAnalytics, getDataModeLabel, type MvpAnalytics } from "../lib/analytics";
import { listTrips } from "../lib/trips";

export function MvpAnalyticsPage() {
  const [metrics, setMetrics] = useState<MvpAnalytics | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, trips] = await Promise.all([getMvpAnalytics(), listTrips()]);
        setMetrics(data);
        const map: Record<string, string> = { _site: "(site-wide)" };
        for (const t of trips) map[t.slug] = t.title;
        setTitles(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const slugs = metrics
    ? [...new Set([...Object.keys(metrics.tripViews), ...Object.keys(metrics.tripShares), ...Object.keys(metrics.tripSaves)])].filter(
        (s) => s !== "_site",
      )
    : [];

  return (
    <div className="mvp-analytics">
      <section className="card">
        <h1>MVP Analytics</h1>
        <p className="muted">
          Live aggregates from {getDataModeLabel()}. The SLO ad simulation below is a separate
          projection — not mixed into live counts.
        </p>
        <p>
          <Link to="/">← Back to site</Link>
        </p>
      </section>

      {loading && <p className="muted">Loading metrics…</p>}
      {error && <div className="error-banner">{error}</div>}

      {metrics && (
        <>
          <section className="card live-metrics-panel">
            <h2>Live data (actual events)</h2>

            <h3>Newsletter</h3>
            <dl className="stats-grid">
              <div>
                <dt>Signup events</dt>
                <dd>{metrics.newsletterSignups}</dd>
              </div>
              <div>
                <dt>Distinct emails</dt>
                <dd>{metrics.distinctNewsletterEmails}</dd>
              </div>
            </dl>
          </section>

          <section className="card">
            <h2>Pay slider ($0–$20/mo)</h2>
            <dl className="stats-grid">
              <div>
                <dt>Submissions</dt>
                <dd>{metrics.paySliderCount}</dd>
              </div>
              <div>
                <dt>Average</dt>
                <dd>{metrics.paySliderAverage != null ? `$${metrics.paySliderAverage}` : "—"}</dd>
              </div>
              <div>
                <dt>Median</dt>
                <dd>{metrics.paySliderMedian != null ? `$${metrics.paySliderMedian}` : "—"}</dd>
              </div>
            </dl>
            {metrics.paySliderDistribution.length > 0 ? (
              <ul className="distribution-list">
                {metrics.paySliderDistribution.map(({ amount, count }) => (
                  <li key={amount}>
                    ${amount}/mo — {count} {count === 1 ? "response" : "responses"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No pay slider submissions yet.</p>
            )}
          </section>

          <section className="card">
            <h2>Trip detail views</h2>
            <p>
              <strong>Total:</strong> {metrics.totalTripViews}
            </p>
            {slugs.length === 0 ? (
              <p className="muted">No trip views recorded yet.</p>
            ) : (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Views</th>
                    <th>Shares</th>
                    <th>Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {slugs.map((slug) => (
                    <tr key={slug}>
                      <td>
                        <Link to={`/trips/${slug}`}>{titles[slug] ?? slug}</Link>
                      </td>
                      <td>{metrics.tripViews[slug] ?? 0}</td>
                      <td>{metrics.tripShares[slug] ?? 0}</td>
                      <td>{metrics.tripSaves[slug] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2>Engagement totals</h2>
            <dl className="stats-grid">
              <div>
                <dt>Total shares</dt>
                <dd>{metrics.totalShares}</dd>
              </div>
              <div>
                <dt>Total saves</dt>
                <dd>{metrics.totalSaves}</dd>
              </div>
              <div>
                <dt>Repeat visits</dt>
                <dd>{metrics.repeatVisits}</dd>
              </div>
              <div>
                <dt>Contact form submits</dt>
                <dd>{metrics.contactSubmits}</dd>
              </div>
            </dl>
          </section>

          <section className="card">
            <h2>Legacy paywall prompt (after 2 saves)</h2>
            <p className="muted">
              Shown {metrics.paywallShown} times — yes {metrics.paywallYes}, maybe{" "}
              {metrics.paywallMaybe}, no {metrics.paywallNo}
            </p>
          </section>

          <SloCampaignSimulation />
        </>
      )}
    </div>
  );
}
