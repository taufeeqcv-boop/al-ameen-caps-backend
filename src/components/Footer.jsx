// Footer – minimal, on-brand with logo

import { Link } from "react-router-dom";
import { Facebook } from "lucide-react";
import logoImg from "../assets/logo.png";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61587066161054";

export default function Footer() {
  return (
    <footer className="bg-primary text-secondary py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Link to="/" className="inline-block">
          <div className="h-24 w-24 mx-auto overflow-hidden flex items-start justify-center">
            <img src={logoImg} alt="Al-Ameen Caps" width={96} height={96} className="h-48 w-auto object-contain object-top opacity-90" />
          </div>
        </Link>
        <p className="mt-1 text-sm text-white/80">Restoring the Crown of the Believer</p>
        <div className="mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-sm text-white/70">
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
          Secure payment via PayFast. &nbsp;·&nbsp; © {new Date().getFullYear()} Al-Ameen Caps. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
