/**
 * PageLoader: shows loading state and is accessible.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLoader from "./PageLoader.jsx";

describe("PageLoader", () => {
  it("renders loading status and text", () => {
    render(<PageLoader />);
    expect(screen.getByRole("status", { name: /loading page/i })).toBeInTheDocument();
    expect(screen.getByText(/Loading…/)).toBeInTheDocument();
  });

  it("has an accessible label for the loading state", () => {
    render(<PageLoader />);
    const status = screen.getByLabelText(/loading page/i);
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
