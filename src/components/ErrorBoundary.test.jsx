/**
 * ErrorBoundary: renders children when no error, fallback when child throws.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary.jsx";

function Thrower({ shouldThrow }) {
  if (shouldThrow) throw new Error("Test error");
  return <span>Child content</span>;
}

function wrap(ui) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress expected React error-boundary logs so the test console stays clean
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children when there is no error", () => {
    render(wrap(
      <ErrorBoundary>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    ));
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    render(wrap(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    ));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to home/i })).toBeInTheDocument();
  });

  it("Try again resets and re-renders children when child no longer throws", async () => {
    const { rerender } = render(wrap(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    ));
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    rerender(wrap(
      <ErrorBoundary>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    ));
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
