import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { tripPath } from "../data/trips";
import { getCurrentWeekTrip } from "../lib/trips";

/** `/trip` → current week’s slug (bookmark-friendly). */
export function WeeklyTripRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    void getCurrentWeekTrip().then((t) => {
      setTarget(t ? tripPath(t.slug) : "/");
    });
  }, []);

  if (!target) {
    return <p className="muted">Loading this week&apos;s trip…</p>;
  }

  return <Navigate to={target} replace />;
}
