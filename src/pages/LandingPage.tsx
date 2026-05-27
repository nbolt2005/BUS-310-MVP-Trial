import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NewsletterForm } from "../components/NewsletterForm";
import { PaySlider } from "../components/PaySlider";
import { TripCard } from "../components/TripCard";
import { tripPath } from "../data/trips";
import { trackEvent } from "../lib/analytics";
import { getCurrentWeekTrip, listTrips } from "../lib/trips";
import type { Trip } from "../types/trip";

export function LandingPage() {
  const [weekTrip, setWeekTrip] = useState<Trip | null>(null);
  const [moreTrips, setMoreTrips] = useState<Trip[]>([]);
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    void getCurrentWeekTrip().then(setWeekTrip);
    void listTrips().then((all) => {
      setMoreTrips(all.filter((t) => !t.is_current_week));
    });
  }, []);

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    await trackEvent("cta_click", null, {
      cta: "contact_submit",
      name: String(data.get("name") ?? ""),
      topic: String(data.get("topic") ?? ""),
    });
    setContactStatus("Thanks — we'll reply by email (demo: logged to analytics).");
    form.reset();
  }

  return (
    <div className="landing">
      <section className="hero card">
        <p className="eyebrow">Outdoors Made Weekly</p>
        <h2>Make going outside feel easy, social, and worth it.</h2>
        <p className="lead">
          One curated beginner trip each week — photos, directions, gear checklist, and realistic
          cost — so you can answer:{" "}
          <strong>Can I actually do this, and is it worth inviting someone?</strong>
        </p>
      </section>

      {weekTrip ? (
        <section className="card trip-of-week">
          <p className="eyebrow">Trip of the week</p>
          <div className="trip-of-week-grid">
            <img src={weekTrip.hero_image_url ?? ""} alt="" className="trip-hero-thumb" />
            <div>
              <h2>{weekTrip.title}</h2>
              <p className="muted">{weekTrip.tagline}</p>
              <p>
                <strong>{weekTrip.time_required}</strong> · {weekTrip.estimated_cost}
              </p>
              <Link className="btn primary" to={tripPath(weekTrip.slug)}>
                View trip details
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <NewsletterForm />

      <PaySlider />

      {moreTrips.length > 0 ? (
        <section className="card">
          <h2>More beginner-friendly ideas</h2>
          <p className="muted">
            Other curated drops — each answers: can I do this, and is it worth inviting someone?
          </p>
          <div className="trip-grid">
            {moreTrips.map((trip) => (
              <TripCard key={trip.slug} trip={trip} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="card">
        <h2>All trips to be led</h2>
        <ul className="trip-list">
          {[...(weekTrip ? [weekTrip] : []), ...moreTrips]
            .filter((trip, i, arr) => arr.findIndex((t) => t.slug === trip.slug) === i)
            .map((trip) => (
              <li key={trip.slug}>
                <Link to={tripPath(trip.slug)}>
                  <strong>{trip.title}</strong>
                </Link>
                <p className="trip-meta">
                  {trip.difficulty} · {trip.time_required} · {trip.location}
                </p>
              </li>
            ))}
        </ul>
      </section>

      <section className="card contact-section" id="contact">
        <h2>Contact</h2>
        <p className="muted">Questions about a trip or want to co-lead? Say hi.</p>
        <form onSubmit={handleContact}>
          <label className="field">
            <span>Name</span>
            <input name="name" required placeholder="Your name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required placeholder="you@email.com" />
          </label>
          <label className="field">
            <span>Topic</span>
            <input name="topic" placeholder="Co-lead Morro Bay / gear question" />
          </label>
          <button type="submit" className="primary">
            Send message
          </button>
          {contactStatus ? <p className="form-success">{contactStatus}</p> : null}
        </form>
      </section>
    </div>
  );
}
