// CartSidebar – slide-out cart connected to CartContext

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

const enableEcommerce = import.meta.env.VITE_ENABLE_ECOMMERCE === 'true';

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, getItemPrice } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" aria-hidden onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-secondary shadow-xl border-l border-black/10 flex flex-col">
        <div className="p-6 flex justify-between items-center border-b border-black/10">
          <h2 className="font-serif text-xl font-semibold text-primary">Your Cart</h2>
          <button type="button" onClick={onClose} className="p-2 rounded text-primary hover:text-accent hover:bg-primary/5 transition-colors" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-primary/70 mb-4">Your cart is empty.</p>
              <Link to="/shop" onClick={onClose} className="btn-outline px-6 py-2.5 text-sm">
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, i) => {
                const price = getItemPrice(item);
                const qty = item.quantity || 1;
                return (
                  <li key={`${item.id ?? "item"}-${i}`} className="flex justify-between items-start gap-4 border-b border-black/10 pb-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary">{item.name}</p>
                      <p className="text-accent text-sm mt-1 font-medium">{formatPrice(price * qty)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(i, qty - 1)}
                          className="w-8 h-8 rounded border border-black/20 text-primary hover:bg-primary/5 font-medium"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-primary">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(i, qty + 1)}
                          className="w-8 h-8 rounded border border-black/20 text-primary hover:bg-primary/5 font-medium"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFromCart(i)} className="text-primary/60 hover:text-accent text-sm shrink-0">
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-black/10">
            <p className="text-accent text-xl font-semibold">Total: {formatPrice(cartTotal)}</p>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-primary mt-4 w-full py-3.5 text-center block"
            >
              {enableEcommerce ? 'Checkout' : 'Proceed to Pre-Order'}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
