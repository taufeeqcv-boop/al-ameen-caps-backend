import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { Star } from "lucide-react";

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE || "";

export default function Review() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(!!token);
  const [valid, setValid] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const base = FUNCTIONS_BASE || "";
    fetch(`${base}/.netlify/functions/review-order-by-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setValid(!!data.valid);
        setOrderId(data.orderId ?? null);
        setAlreadySubmitted(!!data.already_submitted);
      })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating (1–5 stars).");
      return;
    }
    setError("");
    setSubmitting(true);
    const base = FUNCTIONS_BASE || "";
    try {
      const res = await fetch(`${base}/.netlify/functions/submit-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, review_text: reviewText.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setCouponCode(data.coupon_code || "REVIEW5");
        setSubmitSuccess(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Leave a review"
        description="Review your Al-Ameen Caps order. Your feedback helps other customers."
        url="/review"
        noindex
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-3xl font-semibold text-primary text-center mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            How did we do?
          </motion.h1>
          <motion.p
            className="text-primary/70 text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Your review helps other customers and us.
          </motion.p>

          {loading && (
            <p className="text-center text-primary/70">Loading…</p>
          )}

          {!loading && !token && (
            <p className="text-center text-primary/80">
              Invalid or missing link. Use the link from your review request email.
            </p>
          )}

          {!loading && token && !valid && (
            <p className="text-center text-primary/80">
              This link is invalid or has expired.
            </p>
          )}

          {!loading && valid && alreadySubmitted && !submitSuccess && (
            <motion.div
              className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-primary/90">You&apos;ve already submitted a review for this order. Thank you!</p>
              <p className="mt-2 text-accent font-medium">Use code <strong>REVIEW5</strong> for 5% off your next purchase.</p>
              <Link to="/shop" className="mt-4 inline-block text-accent hover:underline font-medium">Continue to shop →</Link>
            </motion.div>
          )}

          {!loading && valid && !alreadySubmitted && !submitSuccess && (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {orderId && (
                <p className="text-center text-primary/70 text-sm">Order #{orderId}</p>
              )}
              <div>
                <label className="block text-primary font-medium mb-2">Rating *</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className="w-10 h-10 transition-colors"
                        fill={(hoverRating || rating) >= star ? "#b8860b" : "none"}
                        stroke="#b8860b"
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="review-text" className="block text-primary font-medium mb-2">Your review (optional)</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-primary/30 bg-secondary/50 text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Tell others what you liked about your order..."
                />
              </div>
              {error && <p className="text-amber-600 text-sm" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </motion.form>
          )}

          {submitSuccess && (
            <motion.div
              className="rounded-xl border border-accent/40 bg-accent/10 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-primary font-medium">Thank you for your review!</p>
              <p className="mt-2 text-primary/80">As a thank you, use code <strong className="text-accent">{couponCode}</strong> for 5% off your next purchase.</p>
              <Link to="/shop" className="mt-4 inline-block px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
                Continue to shop
              </Link>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
