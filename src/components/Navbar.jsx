// Navbar – glass effect, logo left, links center, cart right; mobile hamburger

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import CartSidebar from "./CartSidebar";
import logoImg from "../assets/logo.png";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b-2 border-accent shadow-lg">
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
              <Link
                to="/checkout"
                onClick={() => setMenuOpen(false)}
                className="mt-2 w-full py-3 text-center font-semibold rounded bg-accent text-primary hover:bg-accent-light transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </nav>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
