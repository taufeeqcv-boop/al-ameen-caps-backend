/**
 * Centralized config for Netlify Functions URL.
 * 
 * IMPORTANT: All functions are on the same Netlify site (alameencaps.com).
 * Do NOT set VITE_FUNCTIONS_BASE - it should be empty/unset to use relative paths.
 * 
 * When VITE_FUNCTIONS_BASE is unset (default), uses relative paths (/.netlify/functions/...)
 * which work on the same domain where the site is hosted.
 * 
 * Only set VITE_FUNCTIONS_BASE if you need to call functions from a different domain
 * (not recommended for single-site architecture).
 */
export const getFunctionUrl = (path) => {
  const base = (import.meta.env.VITE_FUNCTIONS_BASE || "").replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return base ? `${base}/.netlify/functions/${cleanPath}` : `/.netlify/functions/${cleanPath}`;
};

/** Absolute URL for function (e.g. PayFast notify_url). Uses VITE_FUNCTIONS_BASE when set, else current origin. */
export const getFunctionUrlAbsolute = (path) => {
  const url = getFunctionUrl(path);
  if (url.startsWith("http")) return url;
  if (typeof window !== "undefined") return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  return url;
};
