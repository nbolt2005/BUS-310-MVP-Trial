import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GearChecklist } from "../components/GearChecklist";
import { NewsletterForm } from "../components/NewsletterForm";
import { PaySlider } from "../components/PaySlider";
import { TripActions } from "../components/TripActions";
import { renderDescription } from "../lib/description";
import { recordTripVisit } from "../lib/analytics";
import { getTripBySlug } from "../lib/trips";
import type { Trip } from "../types/trip";

export function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    void getTripBySlug(slug)
      .then((t) => {
        if (!t) {
          setError("Trip not found.");
          return;
        }
        setTrip(t);
        recordTripVisit(slug);
      })
      .catch(() => setError("Could not load trip."));
  }, [slug]);

  if (error) {
    return (
      <div className="card">
        <p className="form-error">{error}</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  if (!trip) {
    return <p className="muted">Loading trip…</p>;
  }

  const blocks = renderDescription(trip.description);

  return (
    <article className="trip-detail">
      <div className="trip-hero" style={{ backgroundImage: `url(${trip.hero_image_url})` }}>
        <div className="trip-hero-overlay">
          <p className="eyebrow">{trip.difficulty} · {trip.time_required}</p>
          <h1>{trip.title}</h1>
          <p className="lead">{trip.tagline}</p>
        </div>
      </div>

      <TripActions slug={trip.slug} title={trip.title} />

      <section className="card">
        <h2>Logistics</h2>
        <dl className="fact-list">
          <div>
            <dt>Route</dt>
            <dd>{trip.route}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{trip.location}</dd>
          </div>
          <div>
            <dt>Estimated cost</dt>
            <dd>{trip.estimated_cost}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{trip.time_required}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Plan</h2>
        <div className="description-blocks">
          {blocks.map((block, i) => {
            if (block.type === "h2") return <h3 key={i}>{block.content}</h3>;
            if (block.type === "li")
              return (
                <ul key={i}>
                  <li>{block.content}</li>
                </ul>
              );
            return <p key={i}>{block.content}</p>;
          })}
        </div>
      </section>

      <section className="card">
        <h2>What to wear</h2>
        <ul className="attire-list">
          {trip.attire.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Gear &amp; food checklist</h2>
        <GearChecklist categories={trip.gear_checklist} />
        <p className="muted necessities">
          <strong>Necessities:</strong> {trip.necessities_note}
        </p>
      </section>

      <NewsletterForm />

      <PaySlider compact tripSlug={trip.slug} />

      <section className="card">
        <h2>Maps</h2>
        <ul className="map-links">
          {trip.map_links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p>
        <Link to="/">← All trips</Link>
      </p>
    </article>
  );
}
