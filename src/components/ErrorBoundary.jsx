/**
 * Error Boundary — catches render/lifecycle errors in the tree and shows fallback UI.
 * Does not catch errors in event handlers or async code.
 */
import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 bg-secondary text-primary px-4"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="font-serif text-2xl font-semibold text-primary text-center">
            Something went wrong
          </h1>
          <p className="text-primary/70 text-center max-w-md">
            We&apos;re sorry. The page couldn&apos;t load properly. You can try again or go back to the home page.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={this.handleTryAgain}
              className="btn-primary px-6 py-3"
            >
              Try again
            </button>
            <Link to="/" className="btn-outline-contrast px-6 py-3" onClick={this.handleTryAgain}>
              Go to home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
