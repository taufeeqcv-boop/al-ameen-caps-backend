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

        <section className="mt-16 pt-12 border-t border-primary/20" aria-labelledby="support-local-heading">
          <h2 id="support-local-heading" className="font-serif text-xl font-semibold text-primary mb-3">
            Support Local Craftsmanship
          </h2>
          <p className="text-primary/80 text-sm max-w-lg mx-auto mb-6">
            By sharing your experience, you help preserve the Cape Malay and Bo-Kaap heritage of handcrafted Kufis and Taqiyahs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://g.page/r/CSn0lNF6h_xyEAI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-contrast px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center"
            >
              Leave a Google Review
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fg.page%2Fr%2FCSn0lNF6h_xyEAI%2Freview"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-contrast px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center"
            >
              Share on Facebook
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
