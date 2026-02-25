/**
 * Admin Reviews – list customer reviews with entity highlighting and CSV export
 */
import { useEffect, useState } from "react";
import { getFunctionUrl } from "../../lib/config";
import { supabase } from "../../lib/supabase";
import { Loader2, Star, Download } from "lucide-react";

const ENTITY_TERMS = ["Jumu'ah", "Jummah", "Salah", "Bo-Kaap", "Bokaap", "Handcrafted", "Cape Malay", "Kufi", "Taqiyah", "Eid"];

function getEntityTags(text) {
  if (!text || typeof text !== "string") return [];
  const lower = text.toLowerCase();
  return ENTITY_TERMS.filter((term) => lower.includes(term.toLowerCase()));
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function exportToCsv(reviews) {
  const headers = ["Order ID", "Customer Name", "Rating", "Review Text", "Date", "Entity Terms"];
  const rows = (reviews || []).map((r) => {
    const tags = getEntityTags(r.review_text).join("; ");
    return [
      r.order_id,
      (r.customer_name || "").replace(/"/g, '""'),
      r.rating,
      (r.review_text || "").replace(/"/g, '""'),
      formatDate(r.created_at),
      tags.replace(/"/g, '""'),
    ].map((c) => `"${String(c)}"`).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `al-ameen-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const url = getFunctionUrl("get-all-reviews");
      const res = await fetch(url, {
        method: "GET",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        setReviews([]);
        return;
      }
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (e) {
      setError(e?.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-accent animate-spin" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
        <p className="font-medium">Could not load reviews</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Customer Reviews</h1>
        <button
          type="button"
          onClick={() => exportToCsv(reviews)}
          disabled={reviews.length === 0}
          className="btn-outline inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 shrink-0" aria-hidden />
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-primary/20 bg-secondary">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary/20 bg-primary/5">
              <th className="px-4 py-3 font-semibold text-primary">Order ID</th>
              <th className="px-4 py-3 font-semibold text-primary">Customer Name</th>
              <th className="px-4 py-3 font-semibold text-primary">Rating</th>
              <th className="px-4 py-3 font-semibold text-primary">Review Text</th>
              <th className="px-4 py-3 font-semibold text-primary">Date</th>
              <th className="px-4 py-3 font-semibold text-primary">Entities</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-primary/60">
                  No reviews yet. They appear here after customers submit via the post-purchase review link.
                </td>
              </tr>
            ) : (
              reviews.map((r) => {
                const entityTags = getEntityTags(r.review_text);
                return (
                  <tr key={r.id} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="px-4 py-3 font-mono text-primary/90">{r.order_id}</td>
                    <td className="px-4 py-3 text-primary">{r.customer_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-0.5 text-accent" aria-label={`${r.rating} stars`}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i <= (r.rating ?? 0) ? "fill-current" : "text-primary/30"}`}
                            aria-hidden
                          />
                        ))}
                      </span>
                      <span className="ml-1 text-primary/80">({r.rating})</span>
                    </td>
                    <td className="px-4 py-3 text-primary/90 max-w-xs md:max-w-md truncate" title={r.review_text || ""}>
                      {r.review_text || "—"}
                    </td>
                    <td className="px-4 py-3 text-primary/80 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      {entityTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {entityTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/40"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-primary/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-primary/60">
        Reviews containing terms like Jumu&apos;ah, Salah, Bo-Kaap, or Handcrafted are tagged for SEO and marketing use.
      </p>
    </div>
  );
}
