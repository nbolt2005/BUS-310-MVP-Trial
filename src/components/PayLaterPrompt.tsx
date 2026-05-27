import { trackEvent } from "../lib/analytics";
import { markPaywallAnswered } from "../lib/savedTrips";

type Props = {
  onClose: () => void;
};

export function PayLaterPrompt({ onClose }: Props) {
  async function answer(value: "yes" | "no" | "maybe") {
    await trackEvent("cta_click", null, { cta: "paywall_response", answer: value });
    markPaywallAnswered();
    onClose();
  }

  return (
    <div className="paywall-overlay" role="dialog" aria-labelledby="paywall-title">
      <div className="paywall-modal card">
        <h2 id="paywall-title">Quick question</h2>
        <p>
          You've saved a couple trips. Would you pay <strong>$5/mo</strong> for a new beginner trip
          every week (maps, gear lists, share links)?
        </p>
        <div className="actions">
          <button type="button" className="primary" onClick={() => answer("yes")}>
            Yes, probably
          </button>
          <button type="button" onClick={() => answer("maybe")}>
            Maybe later
          </button>
          <button type="button" onClick={() => answer("no")}>
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
