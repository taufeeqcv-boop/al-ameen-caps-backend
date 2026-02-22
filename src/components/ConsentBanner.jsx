// Cookie / consent banner – Consent Mode v2. Persists choice and updates gtag on same page before any navigation.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "alameen_consent";

function grantConsent() {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      ad_user_data: "granted",
      ad_personalization: "granted",
      ad_storage: "granted",
      analytics_storage: "granted",
    });
  }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted") {
      grantConsent();
      return;
    }
    if (stored === "denied") {
      return;
    }
    setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "granted");
    grantConsent();
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, "denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-primary/20 bg-secondary shadow-premium"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        <p className="mb-4 font-sans text-sm text-primary sm:mb-0 sm:inline sm:pr-6">
          We use cookies for analytics and to improve your experience. By continuing you agree to our{" "}
          <Link to="/privacy" className="underline text-primary hover:text-accent">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:inline-flex">
          <button
            type="button"
            onClick={handleReject}
            className="rounded border border-primary/30 bg-transparent px-4 py-2 font-sans text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded bg-accent px-4 py-2 font-sans text-sm font-semibold text-primary shadow-btn-gold hover:bg-accent-light hover:shadow-btn-gold-hover transition-all"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
