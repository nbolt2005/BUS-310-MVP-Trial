import { useState } from "react";
import { trackEvent } from "../lib/analytics";
import { PayLaterPrompt } from "./PayLaterPrompt";
import { shouldShowPaywallPrompt, toggleSaveTrip, isTripSaved } from "../lib/savedTrips";

type Props = {
  slug: string;
  title: string;
};

export function TripActions({ slug, title }: Props) {
  const [saved, setSaved] = useState(() => isTripSaved(slug));
  const [showPaywall, setShowPaywall] = useState(false);
  const [shareNote, setShareNote] = useState("");

  async function handleSave() {
    const result = await toggleSaveTrip(slug);
    setSaved(result.saved);
    if (result.saved && shouldShowPaywallPrompt(result.saveCount)) {
      await trackEvent("cta_click", null, { cta: "paywall_prompt_shown" });
      setShowPaywall(true);
    }
  }

  async function handleShare() {
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const url = `${window.location.origin}${base}trips/${slug}`;
    const text = `Check out this beginner trip on Outdoors Made Weekly: ${title}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        await trackEvent("share", slug, { method: "native" });
        return;
      }
    } catch {
      /* fall through to mailto / clipboard */
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareNote("Link copied!");
        await trackEvent("share", slug, { method: "clipboard" });
        return;
      }
    } catch {
      /* fall through */
    }
    const subject = encodeURIComponent(`Let's try: ${title}`);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    await trackEvent("share", slug, { method: "mailto" });
    setTimeout(() => setShareNote(""), 2500);
  }

  return (
    <>
      <div className="trip-actions">
        <button type="button" className="primary" onClick={() => void handleShare()}>
          Send to a friend
        </button>
        <button type="button" className={saved ? "saved-btn" : ""} onClick={() => void handleSave()}>
          {saved ? "Saved — I want to do this" : "I want to do this"}
        </button>
        {shareNote ? <span className="muted share-note">{shareNote}</span> : null}
      </div>
      {showPaywall ? <PayLaterPrompt onClose={() => setShowPaywall(false)} /> : null}
    </>
  );
}
