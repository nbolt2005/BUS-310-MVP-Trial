import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tripPath } from "../data/trips";
import { listTrips } from "../lib/trips";
import type { Trip } from "../types/trip";

export function TripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    void listTrips().then(setTrips);
  }, []);

  return (
    <div>
      <section className="card">
        <h1>Trips to be led</h1>
        <p className="muted">Curated beginner outings — pick one and share with a friend.</p>
      </section>
      <ul className="trip-list card">
        {trips.map((trip) => (
          <li key={trip.slug}>
            <Link to={tripPath(trip.slug)}>
              <strong>{trip.title}</strong>
            </Link>
            {trip.is_current_week ? <span className="badge live">This week</span> : null}
            <p className="trip-meta">
              {trip.difficulty} · {trip.time_required} · {trip.estimated_cost}
            </p>
          </li>
        ))}
      </ul>
      <p>
        <Link to="/">← Home</Link>
      </p>
    </div>
  );
}
