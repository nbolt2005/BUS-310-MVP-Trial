import { FormEvent, useState } from "react";
import { trackEvent } from "../lib/analytics";

type Props = {
  compact?: boolean;
  tripSlug?: string;
};

export function PaySlider({ compact = false, tripSlug }: Props) {
  const [amount, setAmount] = useState(10);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await trackEvent("cta_click", tripSlug ?? null, {
      cta: "pay_slider_submit",
      amount_usd_per_month: amount,
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className={`card pay-slider ${compact ? "pay-slider-compact" : ""}`}>
        <p className="form-success" role="status">
          Thanks — recorded ${amount}/month for our MVP pricing research.
        </p>
      </section>
    );
  }

  return (
    <section className={`card pay-slider ${compact ? "pay-slider-compact" : ""}`}>
      <h2>{compact ? "Willingness to pay" : "Help us price the weekly drop"}</h2>
      <p className="muted">
        How much would you pay for weekly curated trips? (Does not affect viewing trips.)
      </p>
      <form onSubmit={onSubmit} className="pay-slider-form">
        <label className="field pay-slider-field">
          <span>
            <strong>${amount}</strong>/month
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuenow={amount}
          />
          <span className="pay-slider-range-labels">
            <span>$0</span>
            <span>$20</span>
          </span>
        </label>
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </section>
  );
}
