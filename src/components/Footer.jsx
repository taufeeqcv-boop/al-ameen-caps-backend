// Footer – minimal, on-brand with logo + newsletter signup

import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Mail } from "lucide-react";
import logoImg from "../assets/logo.png";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61587066161054";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // '' | 'sending' | 'success' | 'error'

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const value = (email || "").trim();
    if (!value) return;
    setStatus("sending");
    try {
      // Post to site root so Netlify Forms receives it (form must exist in built index.html)
      const url = typeof window !== "undefined" ? `${window.location.origin}/` : "/";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "newsletter",
          email: value,
          bot: "",
        }).toString(),
      });
      // Netlify returns 200 on success; 302 redirect is also success
      if (res.ok || res.status === 302) {
        setEmail("");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-primary text-secondary py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Link to="/" className="inline-block">
          <div className="h-24 w-24 mx-auto flex items-center justify-center">
            <img src={logoImg} alt="Al-Ameen Caps" width={96} height={96} className="h-24 w-24 object-contain opacity-90" loading="lazy" decoding="async" />
          </div>
        </Link>
        <p className="mt-1 text-sm text-white/80">Restoring the Crown of the Believer</p>

        <div className="mt-6 max-w-sm mx-auto">
          <p className="text-sm text-white/70 mb-2">Get updates on new arrivals and offers</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus(""); }}
              placeholder="Your email"
              className="w-full sm:w-56 px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              disabled={status === "sending"}
              required
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-accent text-primary font-medium hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "sending" ? "…" : <Mail className="w-4 h-4" />}
              {status === "sending" ? "Submitting" : "Subscribe"}
            </button>
          </form>
          {status === "success" && <p className="mt-2 text-sm text-green-300" role="status" aria-live="polite">Thanks for subscribing.</p>}
          {status === "error" && <p className="mt-2 text-sm text-amber-200" role="alert" aria-live="assertive">Something went wrong. Try again or contact us.</p>}
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-sm text-white/70">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
            aria-label="Al-Ameen Caps on Facebook"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </a>
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <Link to="/heritage" className="hover:text-accent transition-colors">Heritage</Link>
          <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
          <Link to="/shipping" className="hover:text-accent transition-colors">Shipping</Link>
          <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
        </div>
        <p className="mt-4 text-xs text-white/50">
          Cape Town based · Nationwide delivery. &nbsp;·&nbsp; Secure payment via PayFast. &nbsp;·&nbsp; © {new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
