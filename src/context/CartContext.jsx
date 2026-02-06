// CartContext – addToCart, removeFromCart, clearCart, cartTotal, localStorage persistence (Phase 3)

import { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { COLLECTION_PRODUCTS } from "../data/collection";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "alameen-caps-cart";

function getCurrentPrice(productId) {
  const product = COLLECTION_PRODUCTS.find((p) => p.id === productId);
  return product != null ? Number(product.price) || 0 : 0;
}

function normalizeItem(item) {
  return {
    ...item,
    price: Number(item.price) || 0,
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
  };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, normalizeItem(action.payload)];
    case "REMOVE":
      return state.filter((_, i) => i !== action.payload.index);
    case "UPDATE_QUANTITY": {
      const { index, quantity } = action.payload;
      if (index < 0 || index >= state.length) return state;
      const next = [...state];
      const qty = Math.max(1, Math.floor(quantity));
      next[index] = { ...next[index], quantity: qty };
      return next;
    }
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function getInitialCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const arr = Array.isArray(parsed) ? parsed : [];
      return arr.map(normalizeItem);
    }
  } catch (_) {}
  return [];
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], getInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => dispatch({ type: "ADD", payload: item });
  const removeFromCart = (index) => dispatch({ type: "REMOVE", payload: { index } });
  const updateQuantity = (index, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { index, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR" });
  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const freshPrice = getCurrentPrice(item.id) || Number(item.price) || 0;
        return sum + freshPrice * (item.quantity || 1);
      }, 0),
    [cart]
  );
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
