/**
 * CartContext: add/remove/update/clear and cartTotal, cartCount.
 */
import { describe, it, expect } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext.jsx";

function TestConsumer() {
  const { cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="total">{cartTotal}</span>
      <span data-testid="length">{cart.length}</span>
      <button type="button" onClick={() => addToCart({ id: "p1", name: "Test Cap", price: 100, quantity: 1 })}>
        Add
      </button>
      <button type="button" onClick={() => cart.length > 0 && removeFromCart(0)}>
        Remove first
      </button>
      <button type="button" onClick={() => clearCart()}>
        Clear
      </button>
    </div>
  );
}

const CART_STORAGE_KEY = "alameen-caps-cart";

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
  });

  it("starts with empty cart", () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("length")).toHaveTextContent("0");
  });

  it("adds item and updates count and total", async () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add/i }));
    });
    expect(screen.getByTestId("length")).toHaveTextContent("1");
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(Number(screen.getByTestId("total").textContent)).toBe(100);
  });

  it("removes item when Remove first is clicked", async () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add/i }));
    });
    expect(screen.getByTestId("length")).toHaveTextContent("1");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /remove first/i }));
    });
    expect(screen.getByTestId("length")).toHaveTextContent("0");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("clearCart empties the cart", async () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add/i }));
    });
    expect(screen.getByTestId("length")).toHaveTextContent("1");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    });
    expect(screen.getByTestId("length")).toHaveTextContent("0");
  });
});
