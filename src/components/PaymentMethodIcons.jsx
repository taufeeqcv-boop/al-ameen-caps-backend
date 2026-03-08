import React from "react";

function VisaIcon({ title = "Visa" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="10"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#1a1f71"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon({ title = "Mastercard" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <circle cx="18" cy="14" r="7" fill="#eb001b" />
      <circle cx="26" cy="14" r="7" fill="#f79e1b" fillOpacity="0.9" />
    </svg>
  );
}

function ApplePayIcon({ title = "Apple Pay" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="9"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#111827"
      >
         Pay
      </text>
    </svg>
  );
}

function SamsungPayIcon({ title = "Samsung Pay" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="8"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#0f172a"
      >
        Samsung
      </text>
    </svg>
  );
}

function SnapScanIcon({ title = "SnapScan" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#0d47a1" />
      <circle cx="22" cy="14" r="6" fill="#e5f3ff" />
      <path
        d="M19.5 14.2 21.3 16l3.2-3.4"
        fill="none"
        stroke="#0d47a1"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PaymentMethodIcons({ className = "" }) {
  return (
    <div
      className={
        "flex flex-wrap items-center justify-center gap-2 sm:gap-3 " +
        (className || "")
      }
    >
      <VisaIcon />
      <MastercardIcon />
      <ApplePayIcon />
      <SamsungPayIcon />
      <SnapScanIcon />
    </div>
  );
}

import React from "react";

function VisaIcon({ title = "Visa" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="10"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#1a1f71"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon({ title = "Mastercard" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <circle cx="18" cy="14" r="7" fill="#eb001b" />
      <circle cx="26" cy="14" r="7" fill="#f79e1b" fillOpacity="0.9" />
    </svg>
  );
}

function ApplePayIcon({ title = "Apple Pay" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="9"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#111827"
      >
         Pay
      </text>
    </svg>
  );
}

function SamsungPayIcon({ title = "Samsung Pay" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#fff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontSize="8"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#0f172a"
      >
        Samsung
      </text>
    </svg>
  );
}

function SnapScanIcon({ title = "SnapScan" }) {
  return (
    <svg
      role="img"
      aria-label={title}
      width="44"
      height="28"
      viewBox="0 0 44 28"
      className="rounded bg-white shadow-sm border border-black/10"
    >
      <rect width="44" height="28" rx="4" fill="#0d47a1" />
      <circle cx="22" cy="14" r="6" fill="#e5f3ff" />
      <path
        d="M19.5 14.2 21.3 16l3.2-3.4"
        fill="none"
        stroke="#0d47a1"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PaymentMethodIcons({ className = "" }) {
  return (
    <div
      className={
        "flex flex-wrap items-center justify-center gap-2 sm:gap-3 " +
        (className || "")
      }
    >
      <VisaIcon />
      <MastercardIcon />
      <ApplePayIcon />
      <SamsungPayIcon />
      <SnapScanIcon />
    </div>
  );
}

