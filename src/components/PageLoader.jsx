/**
 * Al-Ameen styled loading screen: full-screen branded fallback for Suspense.
 * Dark background, logo, gold wordmark, tagline, and animated progress bar.
 */
import logoImg from "../assets/logo.png";

export default function PageLoader() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-primary text-secondary z-[99]"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      {/* Top progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-primary/40 overflow-hidden"
        aria-hidden
      >
        <div className="h-full w-1/3 bg-accent animate-loading-bar rounded-r" />
      </div>

      {/* Centered brand block */}
      <div className="flex flex-col items-center gap-6 animate-loading-pulse">
        <img
          src={logoImg}
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 object-contain opacity-90"
          aria-hidden
        />
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold text-accent tracking-wide">
            Al-Ameen Caps
          </p>
          <p className="mt-1 font-serif text-sm text-secondary/80">
            Restoring the Crown of the Believer
          </p>
        </div>
        <p className="text-xs text-secondary/60 font-sans uppercase tracking-widest">
          Loading…
        </p>
      </div>
    </div>
  );
}
