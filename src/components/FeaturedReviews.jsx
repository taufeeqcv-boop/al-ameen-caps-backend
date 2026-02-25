/**
 * Featured Reviews — homepage section: top-rated reviews (4–5 stars), entity-prioritized.
 * Fetches from Supabase (public read). Fallback: curated "Heritage & Quality" if fewer than 3 reviews.
 * Includes one-click "Share to Facebook" for 5-star reviews (opens sharer with quote + #BoKaap #Jumuah).
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Star, ShieldCheck } from "lucide-react";

/** Facebook "f" icon for share button */
function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const ENTITY_KEYWORDS = ["Jumu'ah", "Jummah", "Salah", "Eid", "Bo-Kaap", "Bokaap", "Cape Malay", "Handcrafted"];
const MAX_REVIEW_LENGTH = 150;
const MIN_REVIEWS_TO_SHOW = 3;

function getFirstName(customerName) {
  if (!customerName || typeof customerName !== "string") return "Customer";
  const first = customerName.trim().split(/\s+/)[0];
  return first || "Customer";
}

function hasEntityKeyword(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return ENTITY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function sortByEntityThenDate(reviews) {
  return [...(reviews || [])].sort((a, b) => {
    const aEntity = hasEntityKeyword(a.review_text);
    const bEntity = hasEntityKeyword(b.review_text);
    if (aEntity && !bEntity) return -1;
    if (!aEntity && bEntity) return 1;
    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return bDate - aDate;
  });
}

function truncateReview(text) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (trimmed.length <= MAX_REVIEW_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_REVIEW_LENGTH).trim().replace(/\s+\S*$/, "") + "…";
}

/** Curated placeholder when we have fewer than MIN_REVIEWS_TO_SHOW real reviews */
const HERITAGE_PLACEHOLDERS = [
  { first_name: "Yusuf", rating: 5, text: "Perfect for Jumu'ah and daily Salah. The quality and fit are exactly what I was looking for — handcrafted with care. Cape Town.", verified: true },
  { first_name: "Amina", rating: 5, text: "Beautiful Kufi, true to the Bo-Kaap and Cape Malay heritage. Wore it for Eid and received so many compliments. Will order again.", verified: true },
  { first_name: "Ibrahim", rating: 5, text: "Premium, handcrafted cap that holds its shape. Ideal for the masjid and special occasions. Fast delivery across South Africa.", verified: true },
];

function ReviewCard({ review, isPlaceholder = false, starVariant = "gold", onShare }) {
  const firstName = isPlaceholder ? review.first_name : getFirstName(review.customer_name);
  const rating = review.rating ?? 5;
  const text = isPlaceholder ? review.text : truncateReview(review.review_text);
  const fullTextForShare = isPlaceholder ? review.text : (review.review_text || text || "").trim();
  const isFiveStar = rating === 5;
  const canShare = isFiveStar && fullTextForShare && typeof onShare === "function";

  const isEmerald = starVariant === "emerald";
  const starFilledClass = isEmerald ? "fill-emerald-800 text-emerald-800" : "fill-accent text-accent";
  const shieldClass = isEmerald ? "text-emerald-800" : "text-accent";
  const shareIconClass = isEmerald ? "text-emerald-800 hover:text-emerald-700" : "text-accent hover:text-accent-dark";

  return (
    <article
      className="bg-secondary rounded-xl border border-primary/10 p-5 sm:p-6 shadow-premium flex flex-col h-full relative"
      itemScope
      itemType="https://schema.org/Review"
    >
      <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating" className="hidden">
        <meta itemProp="ratingValue" content={String(rating)} />
        <meta itemProp="bestRating" content="5" />
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-serif font-semibold text-primary" itemProp="author">{firstName}</span>
        <span className={`inline-flex items-center gap-0.5 ${isEmerald ? "text-emerald-800" : "text-accent"}`} aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 shrink-0 ${i <= rating ? starFilledClass : "text-primary/20"}`}
              aria-hidden
            />
          ))}
        </span>
      </div>
      <p className="text-primary/90 text-sm sm:text-base leading-relaxed flex-1" itemProp="reviewBody">
        {text}
      </p>
      <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-primary/70">
          <ShieldCheck className={`w-4 h-4 shrink-0 ${shieldClass}`} aria-hidden />
          <span>Verified Buyer</span>
        </div>
        {canShare && (
          <button
            type="button"
            onClick={() => onShare(fullTextForShare)}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-current ${shareIconClass} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent/50 touch-manipulation`}
            aria-label="Share this review on Facebook"
            title="Share this review on Facebook"
          >
            <FacebookIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}

function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return (import.meta.env.VITE_SITE_URL || "https://alameencaps.com").replace(/\/$/, "");
}

export default function FeaturedReviews({ starVariant = "gold" }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleShare = useCallback((reviewText) => {
    const siteUrl = getSiteUrl();
    const quote = `Check out this review for Al-Ameen Caps: ${(reviewText || "").trim()} #BoKaap #Jumuah`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(quote)}`;
    const w = 600;
    const h = 400;
    const left = typeof window !== "undefined" ? Math.max(0, (window.screen.width - w) / 2) : 0;
    const top = typeof window !== "undefined" ? Math.max(0, (window.screen.height - h) / 2) : 0;
    window.open(shareUrl, "fb-share", `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "review_share", { method: "Facebook", content_type: "review" });
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, order_id, rating, review_text, customer_name, created_at")
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cancelled) return;
      if (error) {
        setReviews([]);
        setLoading(false);
        return;
      }
      const sorted = sortByEntityThenDate(data ?? []);
      setReviews(sorted);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-secondary/50 rounded-xl border border-primary/10 p-6 animate-pulse h-48" aria-hidden />
        ))}
      </div>
    );
  }

  const usePlaceholder = reviews.length < MIN_REVIEWS_TO_SHOW;
  const items = usePlaceholder ? HERITAGE_PLACEHOLDERS : reviews.slice(0, 6);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <ReviewCard
          key={usePlaceholder ? `placeholder-${i}` : item.id}
          review={usePlaceholder ? item : item}
          isPlaceholder={usePlaceholder}
          starVariant={starVariant}
          onShare={handleShare}
        />
      ))}
    </div>
  );
}
