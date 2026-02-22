import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Supabase (and fetch) can abort in-flight requests on nav/unmount; avoid uncaught AbortError in console
window.addEventListener("unhandledrejection", (event) => {
  const r = event.reason;
  if (r?.name === "AbortError" || (typeof r?.message === "string" && r.message.toLowerCase().includes("abort"))) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
