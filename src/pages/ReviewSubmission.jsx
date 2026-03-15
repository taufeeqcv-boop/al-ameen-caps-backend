/**
 * Review Submission Page - Heritage Gallery Entry Point
 * Mobile-first, elegant form for customers to submit reviews with photos
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Upload, X, CheckCircle2, Camera } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getFunctionUrl } from "../lib/config";
import { uploadReviewPhoto } from "../lib/supabase";

export default function ReviewSubmission() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const orderId = searchParams.get("orderId") || "";

  const [loading, setLoading] = useState(!!(token || orderId));
  const [valid, setValid] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token && !orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        const url = token 
          ? `${getFunctionUrl('review-order-by-token')}?token=${encodeURIComponent(token)}`
          : `${getFunctionUrl('review-order-by-token')}?orderId=${encodeURIComponent(orderId)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        setValid(!!data.valid);
        setOrderData(data);
        setAlreadySubmitted(!!data.already_submitted);
      } catch (err) {
        console.error('Failed to fetch order data:', err);
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [token, orderId]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB. Please compress or choose a smaller image.");
      return;
    }

    setPhotoFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (rating < 1 || rating > 5) {
      setError("Please select a rating (1–5 stars).");
      return;
    }

    if (!token && !orderId) {
      setError("Invalid review link. Please use the link from your email.");
      return;
    }

    setSubmitting(true);

    try {
      // Upload photo first if provided
      let photoUrl = null;
      if (photoFile) {
        setUploadingPhoto(true);
        photoUrl = await uploadReviewPhoto(photoFile);
        setUploadingPhoto(false);
        
        if (!photoUrl) {
          setError("Photo upload failed. Please try again or submit without a photo.");
          setSubmitting(false);
          return;
        }
      }

      // Submit review
      const res = await fetch(getFunctionUrl('submit-review'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          orderId: orderId || undefined,
          rating,
          review_text: reviewText.trim(),
          photo_url: photoUrl,
        }),
      });

      const data = await res.json();
      
      if (data.ok) {
        setCouponCode(data.coupon_code || "REVIEW5");
        setSubmitSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError("Could not submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Seo
        title="Share Your Heritage Story"
        description="Review your Al-Ameen Caps order and share your heritage story with our community."
        url="/review-submission"
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Logo/Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-primary mb-2">
              Share Your Heritage Story
            </h1>
            <p className="text-primary/70 text-sm sm:text-base">
              Your review helps others discover quality Islamic headwear
            </p>
          </motion.div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <p className="mt-4 text-primary/70">Loading your order...</p>
            </div>
          )}

          {!loading && !valid && (
            <motion.div
              className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-primary/90">Invalid or missing review link.</p>
              <p className="mt-2 text-primary/70 text-sm">Please use the link from your review request email.</p>
            </motion.div>
          )}

          {!loading && valid && alreadySubmitted && !submitSuccess && (
            <motion.div
              className="rounded-xl border border-accent/40 bg-accent/10 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
              <p className="text-primary font-medium text-lg">Thank you for your review!</p>
              <p className="mt-2 text-primary/80">You've already submitted a review for this order.</p>
              <p className="mt-4 text-accent font-medium">
                Use code <strong className="text-lg">REVIEW5</strong> for 5% off your next purchase.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-block px-6 py-3 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          )}

          {!loading && valid && !alreadySubmitted && !submitSuccess && (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white rounded-xl border border-primary/10 p-6 sm:p-8 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
            {/* Order Info */}
            {orderData && (
              <div className="pb-4 border-b border-primary/10">
                <p className="text-sm text-primary/60">Order #{orderData.orderId}</p>
                {orderData.customerName && (
                  <p className="text-primary font-medium mt-1">Hello, {orderData.customerName}</p>
                )}
                {orderData.productName && (
                  <p className="text-primary/80 text-sm mt-1">
                    Reviewing your <span className="font-medium">{orderData.productName}</span>
                  </p>
                )}
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-primary font-medium mb-3">
                Rating <span className="text-accent">*</span>
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none focus:ring-2 focus:ring-accent rounded transition-transform hover:scale-110"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className="w-10 h-10 sm:w-12 sm:h-12 transition-colors"
                      fill={(hoverRating || rating) >= star ? "#b8860b" : "none"}
                      stroke="#b8860b"
                      strokeWidth={hoverRating === star ? 2 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review-text" className="block text-primary font-medium mb-2">
                Your Heritage Story
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-primary/30 bg-secondary/30 text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-none"
                placeholder="Tell us about your experience... How does wearing your cap connect you to your heritage? Share your story with the community."
              />
              <p className="mt-1 text-xs text-primary/50">Optional but encouraged</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-primary font-medium mb-2">
                Share a Photo (Optional)
              </label>
              <p className="text-xs text-primary/60 mb-3">
                Photos with reviews are 12x more effective! Show us your cap in action — at the Masjid, in the Bo-Kaap, or wherever your heritage takes you.
              </p>
              
              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-accent transition-colors bg-secondary/20">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-primary/50 mb-2" />
                    <p className="mb-2 text-sm text-primary/70">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-primary/50">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    disabled={uploadingPhoto}
                  />
                </label>
              ) : (
                <div className="relative">
                  <div className="relative rounded-lg overflow-hidden border border-primary/20">
                    <img
                      src={photoPreview}
                      alt="Review preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  {uploadingPhoto && (
                    <div className="mt-2 text-center">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                      <p className="text-xs text-primary/60 mt-1">Uploading...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-amber-800 text-sm" role="alert">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="w-full py-3.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit Review"
              )}
            </button>

            <p className="text-xs text-center text-primary/50">
              By submitting, you agree to share your review and photo for the Heritage Gallery.
            </p>
          </motion.form>
          )}

          {/* Success State */}
          {submitSuccess && (
            <motion.div
              className="rounded-xl border border-accent/40 bg-accent/10 p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-semibold text-primary mb-2">
                Shukran! Thank You
              </h2>
              <p className="text-primary/80 mb-4">
                Your review has been submitted and will help others discover quality Islamic headwear.
              </p>
              <div className="bg-white rounded-lg p-4 mb-6 border border-accent/20">
                <p className="text-sm text-primary/70 mb-1">Your discount code:</p>
                <p className="text-2xl font-bold text-accent">{couponCode}</p>
                <p className="text-xs text-primary/60 mt-1">5% off your next purchase</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
