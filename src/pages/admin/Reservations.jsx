import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { Loader2, Mail, MessageCircle, Download } from "lucide-react";

const STATUS_OPTIONS = ["pending", "contacted", "completed"];

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      let q = supabase
        .from("reservations")
        .select("id, created_at, customer_name, customer_email, customer_phone, items, total_amount, notes, status")
        .order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      if (dateFrom) q = q.gte("created_at", dateFrom + "T00:00:00.000Z");
      if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59.999Z");
      const { data, error: e } = await q;
      if (e) setError(e.message);
      else setReservations(data ?? []);
      setLoading(false);
    })();
  }, [statusFilter, dateFrom, dateTo]);

  const updateStatus = async (id, newStatus) => {
    if (!supabase) return;
    setUpdatingId(id);
    setError(null);
    const { error: e } = await supabase.from("reservations").update({ status: newStatus }).eq("id", id);
    if (e) setError(e.message);
    else setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    setUpdatingId(null);
  };

  const escapeCsv = (v) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };

  const exportCsv = () => {
    const headers = ["Date", "Customer", "Email", "Phone", "Total", "Items", "Status", "Notes"];
    const rows = reservations.map((r) => {
      const itemsStr = Array.isArray(r.items) && r.items.length > 0
        ? r.items.map((i) => `${i.name || "Item"} × ${i.quantity || 1}`).join("; ")
        : "";
      return [
        r.created_at ? new Date(r.created_at).toISOString().slice(0, 19) : "",
        r.customer_name ?? "",
        r.customer_email ?? "",
        r.customer_phone ?? "",
        r.total_amount ?? "",
        itemsStr,
        r.status ?? "",
        r.notes ?? "",
      ].map(escapeCsv);
    });
    const csv = [headers.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pre-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm focus:ring-2 focus:ring-accent"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm"
          title="To date"
        />
        {(statusFilter || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => { setStatusFilter(""); setDateFrom(""); setDateTo(""); }}
            className="px-3 py-2 rounded-lg text-sm text-primary/70 hover:bg-secondary/20"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={exportCsv}
          disabled={reservations.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
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
                <th className="px-6 py-3 font-medium w-40">Actions</th>
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
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(r.status || "pending") === "pending" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(r.id, "contacted")}
                          disabled={updatingId === r.id}
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline disabled:opacity-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Mark contacted
                        </button>
                      )}
                      {r.customer_email && (
                        <a
                          href={`mailto:${r.customer_email}`}
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reservations.length === 0 && !error && (
          <div className="px-6 py-8 text-center text-primary/60 space-y-3 max-w-lg mx-auto">
            <p>No pre-orders yet.</p>
            <p className="text-sm text-left">
              <strong>Reservations save and emails send, but nothing here?</strong> The server saves to the project in <code className="bg-secondary/30 px-1 rounded">SUPABASE_URL</code>. This page reads from <code className="bg-secondary/30 px-1 rounded">VITE_SUPABASE_URL</code>. In Netlify → Environment variables, set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to the <em>same</em> Supabase project as SUPABASE_URL, then trigger a new deploy so the site uses that project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
