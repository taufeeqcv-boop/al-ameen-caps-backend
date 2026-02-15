import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top when the route changes.
 * Ensures product and other pages load with the user at the top (e.g. below the nav).
 * Disables browser scroll restoration so the page doesn't open scrolled to the bottom.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Prevent the browser from restoring a previous scroll position (e.g. from Shop)
    if (typeof window.history.scrollRestoration !== "undefined") {
      window.history.scrollRestoration = "manual";
    }
    // Scroll to top immediately
    window.scrollTo(0, 0);
    // Run again after paint so we win over any layout/restoration that runs later
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
