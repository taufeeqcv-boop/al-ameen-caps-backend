/**
 * Centralized config for Netlify Functions URL.
 * When frontend (www.alameencaps.com) and backend (al-ameen-caps-backend) are different Netlify sites,
 * set VITE_FUNCTIONS_BASE to the backend URL so all function calls go there.
 * When unset, uses relative paths (current origin) for same-site or localhost.
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
