import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["pending", "contacted", "completed"];

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: e } = await supabase
        .from("reservations")
        .select("id, created_at, customer_name, customer_email, customer_phone, items, total_amount, notes, status")
        .order("created_at", { ascending: false });
      if (e) setError(e.message);
      else setReservations(data ?? []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (!supabase) return;
    setUpdatingId(id);
    setError(null);
    const { error: e } = await supabase.from("reservations").update({ status: newStatus }).eq("id", id);
    if (e) setError(e.message);
    else setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-primary">Pre-Orders</h1>
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}
      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium max-w-xs">Notes</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary text-sm whitespace-nowrap">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-3 text-primary font-medium">{r.customer_name || "—"}</td>
                  <td className="px-6 py-3 text-primary text-sm">{r.customer_email || "—"}</td>
                  <td className="px-6 py-3 text-primary text-sm">{r.customer_phone || "—"}</td>
                  <td className="px-6 py-3 text-primary font-medium">{formatPrice(r.total_amount)}</td>
                  <td className="px-6 py-3 text-primary/80 text-sm">
                    {Array.isArray(r.items) && r.items.length > 0
                      ? r.items.map((i, idx) => (
                          <span key={idx}>
                            {i.name} × {i.quantity || 1}
                            {idx < r.items.length - 1 ? "; " : ""}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="px-6 py-3">
                    {updatingId === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                      <select
                        value={r.status || "pending"}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="text-sm border border-secondary/40 rounded px-2 py-1.5 bg-white text-primary"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-3 text-primary/70 text-sm max-w-xs truncate" title={r.notes || ""}>
                    {r.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && !error && (
          <p className="px-6 py-8 text-center text-primary/60">No pre-orders yet.</p>
        )}
      </div>
    </div>
  );
}
