import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const GOOGLE_ADS_PURCHASE_SEND_TO = "AW-17950617988/gDANCJvFo_0bEITjwu9C";

export default function Success() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("order_id") || "";
  const newCustomerParam = searchParams.get("new_customer");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Google Ads Purchase conversion (page load) – transaction_id + new_customer
  useEffect(() => {
    if (typeof window === "undefined" || !window.gtag) return;
    const payload = {
      send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
      transaction_id: transactionId,
    };
    if (newCustomerParam === "1") payload.new_customer = true;
    else if (newCustomerParam === "0") payload.new_customer = false;
    window.gtag("event", "conversion", payload);
  }, [transactionId, newCustomerParam]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 pt-32 pb-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary">Order Confirmed</h1>
        <p className="mt-4 text-primary/80">
          We have successfully received your payment. Thank you for choosing Al-Ameen Caps. We sincerely appreciate your business and look forward to serving you again. We will be in touch shortly with your delivery details.
        </p>
        <Link to="/shop" className="btn btn-primary w-full mt-8 py-4 px-10 inline-block text-center">
          Continue Shopping
        </Link>
      </main>
      <Footer />
    </div>
  );
}
