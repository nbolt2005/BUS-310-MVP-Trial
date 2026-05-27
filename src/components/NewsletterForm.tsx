import { FormEvent, useState } from "react";
import { subscribeNewsletter } from "../lib/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      await subscribeNewsletter(email, level);
      setStatus("done");
      setMessage("You're on the list — we'll send the next weekly drop.");
      setEmail("");
      setLevel("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="newsletter-form card" onSubmit={onSubmit}>
      <h2>Get the weekly trip</h2>
      <p className="muted">Curated beginner outings — no hunting through forums.</p>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          placeholder="you@school.edu"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
      </label>
      <label className="field">
        <span>Experience level (optional)</span>
        <select value={level} onChange={(ev) => setLevel(ev.target.value)}>
          <option value="">Prefer not to say</option>
          <option value="brand-new">Brand new to outdoors</option>
          <option value="some-hikes">Done a few day hikes</option>
          <option value="some-camping">Camped once or twice</option>
          <option value="comfortable">Comfortable — want easy wins</option>
        </select>
      </label>
      <button type="submit" className="primary" disabled={status === "loading"}>
        {status === "loading" ? "Joining…" : "Join newsletter"}
      </button>
      {message ? <p className={status === "error" ? "form-error" : "form-success"}>{message}</p> : null}
    </form>
  );
}
