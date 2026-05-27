type SimRun = {
  name: string;
  audience: string;
  creativeAngle: string;
  hook: string;
  impressions: number;
  reach: number;
  ctrPct: number;
  landingVisits: number;
  emailCvR: number;
  emailSignups: number;
  costPerSignup: number;
  saveClicks: number;
  sendToFriendClicks: number;
  mapClicks: number;
  repeatVisits: number;
  assumptionTested: string;
  successCriteria: string;
  failureCriteria: string;
  nextAction: string;
};

const BUDGET_USD = 150;
const DURATION_DAYS = 10;
const AUDIENCE_POOL = 1000;

const RUNS: SimRun[] = [
  {
    name: "Run 1 · Cal Poly student-focused",
    audience:
      "Ages 18–26 · interests: hiking, camping, beaches, road trips, outdoor recreation, national parks, travel, student life",
    creativeAngle: "Low-effort weekend plan",
    hook: "Need a low-effort SLO trip this weekend?",
    impressions: 8200,
    reach: 790,
    ctrPct: 1.25,
    landingVisits: 93,
    emailCvR: 10.8,
    emailSignups: 10,
    costPerSignup: 15,
    saveClicks: 27,
    sendToFriendClicks: 14,
    mapClicks: 24,
    repeatVisits: 18,
    assumptionTested:
      "Students respond when planning burden is reduced and trip feasibility is clear enough to drive signups.",
    successCriteria: ">=10 signups with cost/signup <=$15 and >=25 saves.",
    failureCriteria: "<7 signups or cost/signup >$21.",
    nextAction:
      "Keep student targeting but split creatives by 'free/cheap' vs 'short-drive' to improve signup rate.",
  },
  {
    name: "Run 2 · Social/friend-focused",
    audience:
      "Ages 18–35 · interests: hiking, travel, beaches, wellness, coffee shops, photography, casual fitness",
    creativeAngle: "Send this to a friend",
    hook: "Stop saying 'we should do something' and never planning it.",
    impressions: 8600,
    reach: 840,
    ctrPct: 1.55,
    landingVisits: 119,
    emailCvR: 8.4,
    emailSignups: 10,
    costPerSignup: 15,
    saveClicks: 31,
    sendToFriendClicks: 24,
    mapClicks: 28,
    repeatVisits: 21,
    assumptionTested:
      "Social motivation and sharing behavior can outperform pure solo-intent messaging at top and mid funnel.",
    successCriteria: ">=10 signups, >=20 send-to-friend clicks, and >=30 saves.",
    failureCriteria: "<8 signups and <15 send-to-friend clicks.",
    nextAction:
      "Scale this audience while testing stronger signup CTAs so sharing traffic converts better.",
  },
  {
    name: "Run 3 · Broad local outdoor-curious",
    audience: "Ages 18–35 · local-only broad targeting (no detailed interests)",
    creativeAngle: "Weekly SLO trip drop",
    hook: "One realistic local outdoor trip every week.",
    impressions: 9400,
    reach: 930,
    ctrPct: 0.95,
    landingVisits: 80,
    emailCvR: 7.5,
    emailSignups: 6,
    costPerSignup: 25,
    saveClicks: 18,
    sendToFriendClicks: 9,
    mapClicks: 16,
    repeatVisits: 10,
    assumptionTested:
      "Broad local audience can still self-select into intent without interest filtering.",
    successCriteria: ">=8 signups with cost/signup <=$18.",
    failureCriteria: "<7 signups or cost/signup >$22.",
    nextAction:
      "Reduce spend here and recycle only the best broad-ad copy into retargeting.",
  },
];

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function MetaAdRunSimulation() {
  const bestRun = RUNS.reduce((best, run) =>
    run.costPerSignup < best.costPerSignup ? run : best,
  );
  const cutRun = RUNS.reduce((worst, run) =>
    run.costPerSignup > worst.costPerSignup ? run : worst,
  );

  return (
    <section
      className="card simulation-panel"
      aria-labelledby="meta-sim-heading"
      data-testid="meta-ad-run-simulation"
    >
      <div className="simulation-banner" role="note">
        <strong>Projection only</strong> — 3 simulated Meta runs (Facebook + Instagram placements)
        using a 1,000-person local audience pool, {DURATION_DAYS} days, and ${BUDGET_USD} spend
        each.
      </div>

      <h2 id="meta-sim-heading">Meta Test Runs Simulation (10 days · $150 each)</h2>
      <p className="muted">
        Core question tested: can users quickly decide "I can realistically do this trip" and
        "it is worth inviting a friend" when planning burden is removed?
      </p>

      <div className="table-scroll">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Impressions</th>
              <th>Reach</th>
              <th>CTR</th>
              <th>Landing visits</th>
              <th>Email CVR</th>
              <th>Email signups</th>
              <th>Cost/signup</th>
              <th>Saves</th>
              <th>Send-to-friend</th>
              <th>Map clicks</th>
              <th>Repeat visits</th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map((run) => (
              <tr key={run.name}>
                <td>{run.name}</td>
                <td>{run.impressions}</td>
                <td>{run.reach}</td>
                <td>{formatPercent(run.ctrPct)}</td>
                <td>{run.landingVisits}</td>
                <td>{formatPercent(run.emailCvR)}</td>
                <td>{run.emailSignups}</td>
                <td>{formatMoney(run.costPerSignup)}</td>
                <td>{run.saveClicks}</td>
                <td>{run.sendToFriendClicks}</td>
                <td>{run.mapClicks}</td>
                <td>{run.repeatVisits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {RUNS.map((run) => (
        <details key={`${run.name}-details`} className="simulation-footnote">
          <summary>{run.name} analysis</summary>
          <ul>
            <li>
              <strong>Audience:</strong> {run.audience}
            </li>
            <li>
              <strong>Creative angle:</strong> {run.creativeAngle}
            </li>
            <li>
              <strong>Main hook:</strong> {run.hook}
            </li>
            <li>
              <strong>Assumption tested best:</strong> {run.assumptionTested}
            </li>
            <li>
              <strong>Success threshold:</strong> {run.successCriteria}
            </li>
            <li>
              <strong>Failure threshold:</strong> {run.failureCriteria}
            </li>
            <li>
              <strong>Recommended next action:</strong> {run.nextAction}
            </li>
          </ul>
        </details>
      ))}

      <h3>Cross-run recommendation</h3>
      <ul>
        <li>
          <strong>Scale:</strong> {bestRun.name} (best blended efficiency and strongest share
          behavior).
        </li>
        <li>
          <strong>Cut:</strong> {cutRun.name} (weak signup efficiency at this budget).
        </li>
        <li>
          <strong>Improve creative angle:</strong> "Weekly SLO trip drop" needs stronger
          feasibility proof (time, cost, and drive-time in first frame).
        </li>
        <li>
          <strong>MVP signal:</strong> positive but early; enough signal to continue if signup
          cost stays near or under $15 and save + share behavior remains strong.
        </li>
        <li>
          <strong>Test next:</strong> retarget visitors who clicked save/send-to-friend but did not
          sign up, with social-proof + urgency variants.
        </li>
      </ul>

      <p className="muted">
        Early-stage realism notes: local CPM inflation, creative fatigue from small audience size
        ({AUDIENCE_POOL}), and first-touch cold traffic all suppress conversion expectations.
      </p>
    </section>
  );
}
