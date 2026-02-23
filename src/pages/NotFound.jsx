import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 pt-32 pb-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">Page not found</h1>
        <p className="mt-4 text-primary/80">The page you’re looking for doesn’t exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary px-10 py-4 inline-block">
            Back to Home
          </Link>
          <Link to="/shop" className="btn-outline-contrast px-10 py-4 inline-block">
            Shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
