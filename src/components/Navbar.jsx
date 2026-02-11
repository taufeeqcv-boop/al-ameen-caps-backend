// Navbar – glass effect, logo left, links center, cart right; mobile hamburger

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import CartSidebar from "./CartSidebar";
import logoImg from "../assets/logo.png";
import { Menu, X, ChevronDown, Facebook } from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61587066161054";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  return full.trim().split(/\s+/)[0] || "there";
}

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, signOut, isConfigured: authConfigured, authError, clearAuthError } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const firstName = user ? getFirstName(user) : "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-accent text-primary text-center py-2 px-4 text-sm font-medium">
          Inaugural Collection Arriving Soon — Pre-Order Now.
        </div>
        {authError && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-sm flex items-center justify-between gap-2">
            <span>{authError}</span>
            <button type="button" onClick={clearAuthError} className="shrink-0 px-2 py-1 rounded hover:bg-amber-200" aria-label="Dismiss">✕</button>
          </div>
        )}
        <nav className="bg-primary border-b-2 border-accent shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[5.5rem] py-2">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src={logoImg} alt="Al-Ameen Caps" className="h-20 w-auto object-contain" />
              <span className="font-serif text-xl font-semibold text-accent hidden sm:inline">Al-Ameen Caps</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="text-secondary hover:text-accent transition-colors font-medium">
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-secondary hover:text-accent transition-colors rounded"
                aria-label="Al-Ameen Caps on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="px-4 py-2.5 rounded border-2 border-accent text-accent hover:bg-accent hover:text-primary transition-colors font-medium"
                aria-label={`Cart, ${cartCount} items`}
              >
                Cart ({cartCount})
              </button>
              <Link to="/checkout" className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold rounded bg-accent text-primary hover:bg-accent-light transition-colors">
                Checkout
              </Link>
              {authConfigured && (
                user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setUserMenuOpen((o) => !o); }}
                      className="hidden sm:flex items-center gap-1 px-3 py-2 rounded text-accent hover:bg-accent/10 transition-colors font-medium"
                    >
                      <span>Assalamu alaikum, {firstName}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 py-1 w-44 bg-secondary border border-accent/30 rounded shadow-lg z-50">
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-primary hover:bg-accent/10 font-medium"
                        >
                          Account
                        </Link>
                        <button
                          type="button"
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-primary hover:bg-accent/10 font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/account"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-accent hover:underline"
                  >
                    Sign In
                  </Link>
                )
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden p-2 text-secondary hover:text-accent rounded"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-accent/50 bg-primary">
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-secondary hover:text-accent font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 text-secondary hover:text-accent font-medium"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" /> Facebook
              </a>
              <Link
                to="/checkout"
                onClick={() => setMenuOpen(false)}
                className="mt-2 w-full py-3 text-center font-semibold rounded bg-accent text-primary hover:bg-accent-light transition-colors"
              >
                Checkout
              </Link>
              {authConfigured && user && (
                <div className="mt-2 py-2 border-t border-accent/30">
                  <p className="text-accent font-medium text-sm">Assalamu alaikum, {firstName}</p>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="block py-2 text-secondary hover:text-accent">Account</Link>
                  <button type="button" onClick={() => { signOut(); setMenuOpen(false); }} className="block py-2 text-secondary hover:text-accent w-full text-left">
                    Sign Out
                  </button>
                </div>
              )}
              {authConfigured && !user && (
                <Link to="/account" onClick={() => setMenuOpen(false)} className="block py-2 text-accent font-medium">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      </header>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
