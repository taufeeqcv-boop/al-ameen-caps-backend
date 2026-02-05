import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">Thank You</h1>
        <p className="mt-4 text-primary/80">Your order has been received. We will email you confirmation shortly and will be in touch with tracking once your order is dispatched.</p>
        <Link to="/shop" className="btn-primary mt-8 px-10 py-4">
          Continue Shopping
        </Link>
      </main>
      <Footer />
    </div>
  );
}
