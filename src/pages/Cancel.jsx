import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Cancel() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">Payment Cancelled</h1>
        <p className="mt-4 text-primary/80">Your payment was cancelled. Your cart is still saved.</p>
        <Link to="/checkout" className="btn-primary inline-block mt-8 px-8 py-4">
          Back to Checkout
        </Link>
      </main>
      <Footer />
    </div>
  );
}
