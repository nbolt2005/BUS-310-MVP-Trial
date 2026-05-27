import { Link } from "react-router-dom";
import type { Trip } from "../types/trip";

type Props = { trip: Trip };

export function TripCard({ trip }: Props) {
  return (
    <article className="trip-card">
      {trip.hero_image_url ? (
        <img src={trip.hero_image_url} alt="" className="trip-card-image" loading="lazy" />
      ) : (
        <div className="trip-card-placeholder" aria-hidden>
          🏕️
        </div>
      )}
      <div className="trip-card-body">
        <h3>
          <Link to={`/trips/${trip.slug}`}>{trip.title}</Link>
        </h3>
        <p className="trip-meta">
          {trip.location}
          {trip.time_required ? ` · ${trip.time_required}` : ""}
          {trip.difficulty ? ` · ${trip.difficulty}` : ""}
        </p>
        <p className="trip-blurb">{trip.tagline}</p>
        <Link className="btn primary" to={`/trips/${trip.slug}`}>
          View trip
        </Link>
      </div>
    </article>
  );
}
