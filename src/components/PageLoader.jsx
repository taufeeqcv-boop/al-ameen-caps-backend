/**
 * Fallback UI for Suspense while a lazy route chunk loads.
 * Full-screen so the app never shows a blank beige screen; clear spinner + label.
 */
export default function PageLoader() {
  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-0.5 bg-accent/30 z-[100] overflow-hidden"
        aria-hidden
      >
        <div className="h-full w-1/3 bg-accent animate-route-load" />
      </div>
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-secondary text-primary z-[99]"
        role="status"
        aria-live="polite"
        aria-label="Loading page"
      >
        <div
          className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-accent animate-spin"
          aria-hidden
        />
        <span className="text-base font-semibold text-primary">Loading…</span>
      </div>
    </>
  );
}
