// Footer – clean, professional, SEO-optimized

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
    <footer className="bg-[#0d0d0d] text-secondary py-10 mt-auto border-t border-accent/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2" aria-label="Al-Ameen Caps home">
            <img
              src={logoImg}
              alt="Al-Ameen Caps"
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
              loading="lazy"
              decoding="async"
            />
            <span className="font-serif text-lg font-semibold text-accent">Al-Ameen Caps</span>
          </Link>
          <p className="mt-2 text-sm text-white/80 font-serif">Restoring the Crown of the Believer</p>
        </div>

        {/* Main Footer Content - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Navigation Links - SEO Essential */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Navigation</h3>
            <nav className="flex flex-col gap-2 text-sm text-white/70" aria-label="Footer navigation">
              <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/heritage" className="hover:text-accent transition-colors">Heritage</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Contact Information - Local SEO Essential */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
            <address className="not-italic text-sm text-white/70 space-y-1">
              <p>205 Wallace Street, Glenwood</p>
              <p>Cape Town, 7460, South Africa</p>
              <p>
                <a href="tel:0810487447" className="hover:text-accent transition-colors">
                  081 048 7447
                </a>
              </p>
              <p>
                <a href="mailto:sales@alameencaps.com" className="hover:text-accent transition-colors">
                  sales@alameencaps.com
                </a>
              </p>
            </address>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Newsletter</h3>
            <p className="text-xs text-white/60 mb-3">Get updates on new arrivals and offers</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus(""); }}
                placeholder="Your email"
                className="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                disabled={status === "sending"}
                required
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full px-4 py-2 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {status === "sending" ? "…" : <Mail className="w-4 h-4" />}
                {status === "sending" ? "Submitting" : "Subscribe"}
              </button>
            </form>
            {status === "success" && <p className="mt-2 text-xs text-green-300" role="status" aria-live="polite">Thanks for subscribing.</p>}
            {status === "error" && <p className="mt-2 text-xs text-amber-200" role="alert" aria-live="assertive">Something went wrong. Try again.</p>}
          </div>
        </div>

        {/* Bottom Bar - Legal & Social */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link to="/shipping-returns" className="hover:text-accent transition-colors">Shipping &amp; Returns</Link>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-xs text-white/50">
          <p>© {new Date().getFullYear()} Al-Ameen Caps. All rights reserved. Cape Town, South Africa.</p>
        </div>
      </div>
    </footer>
  );
}
