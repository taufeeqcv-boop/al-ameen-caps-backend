import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { getFunctionUrl } from "../../lib/config";
import { Loader2, MoreHorizontal, RotateCcw, Truck } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
const FASTWAY_TRACK_BASE = "https://www.fastway.co.za/our-services/track-your-parcel/";

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [shipForm, setShipForm] = useState({ tracking_number: "", number_of_boxes: 1, tracking_url: "" });

  const fetchOrders = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    let q = supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        total_amount,
        user_id,
        shipping_data,
        profiles ( first_name, last_name )
      `)
      .order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data, error: e } = await q;
    if (e) setError(e.message);
    else setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    if (!supabase) return;
    setDropdownOpenId(null);
    if (newStatus === "SHIPPED") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setShipModalOrder(order);
        setShipForm({
          tracking_number: order.shipping_data?.tracking_number ?? "",
          number_of_boxes: order.shipping_data?.number_of_boxes ?? 1,
          tracking_url: order.shipping_data?.tracking_url ?? "",
        });
      }
      return;
    }
    setUpdatingId(orderId);
    const { error: e } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (e) setError(e.message);
    else await fetchOrders();
    setUpdatingId(null);
  };

  const closeShipModal = () => {
    setShipModalOrder(null);
    setShipForm({ tracking_number: "", number_of_boxes: 1, tracking_url: "" });
  };

  const shipAndNotify = async () => {
    if (!shipModalOrder || !supabase) return;
    const trackingNumber = (shipForm.tracking_number || "").trim();
    if (!trackingNumber) {
      setError("Please enter a Fastway tracking number.");
      return;
    }
    const trackingUrl = (shipForm.tracking_url || "").trim()
      || (trackingNumber.startsWith("http") ? trackingNumber : `${FASTWAY_TRACK_BASE}?label_no=${encodeURIComponent(trackingNumber)}`);
    const numBoxes = Math.max(1, parseInt(String(shipForm.number_of_boxes), 10) || 1);

    setDropdownOpenId(null);
    setUpdatingId(shipModalOrder.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const url = getFunctionUrl("send-shipping-notification");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          order_id: shipModalOrder.id,
          tracking_number: trackingNumber,
          number_of_boxes: numBoxes,
          tracking_url: trackingUrl,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
        return;
      }
      closeShipModal();
      await fetchOrders();
    } catch (err) {
      setError(err?.message || "Failed to ship and notify");
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelAndRestock = async (orderId) => {
    if (!supabase) return;
    setDropdownOpenId(null);
    setUpdatingId(orderId);
    const { data: items } = await supabase.from("order_items").select("product_id, quantity").eq("order_id", orderId);
    if (items?.length) {
      for (const item of items) {
        const { data: prod } = await supabase.from("products").select("stock_quantity").eq("id", item.product_id).single();
        if (prod) {
          await supabase
            .from("products")
            .update({ stock_quantity: Number(prod.stock_quantity) + item.quantity })
            .eq("id", item.product_id);
        }
      }
    }
    const { error: e } = await supabase.from("orders").update({ status: "CANCELLED" }).eq("id", orderId);
    if (e) setError(e.message);
    else await fetchOrders();
    setUpdatingId(null);
  };

  const customerName = (o) => {
    const p = o.profiles;
    if (!p) return "—";
    const first = p.first_name || "";
    const last = p.last_name || "";
    return [first, last].filter(Boolean).join(" ") || "—";
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
      <h1 className="font-serif text-2xl font-semibold text-primary">Orders</h1>
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/orders"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter ? "bg-accent text-primary" : "bg-white border border-secondary/40 text-primary"}`}
        >
          All
        </a>
        {STATUS_OPTIONS.map((s) => (
          <a
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-accent text-primary" : "bg-white border border-secondary/40 text-primary"}`}
          >
            {s}
          </a>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary text-sm">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-3 text-primary">{customerName(o)}</td>
                  <td className="px-6 py-3 text-primary font-medium">{formatPrice(o.total_amount)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        o.status === "PAID" ? "bg-green-100 text-green-800" :
                        o.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                        o.status === "CANCELLED" ? "bg-gray-100 text-gray-700" :
                        "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 relative">
                    {updatingId === o.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpenId(dropdownOpenId === o.id ? null : o.id)}
                          className="p-1 rounded hover:bg-secondary/30"
                        >
                          <MoreHorizontal className="w-5 h-5 text-primary" />
                        </button>
                        {dropdownOpenId === o.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setDropdownOpenId(null)}
                              aria-hidden
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-secondary/30 rounded-lg shadow-lg z-20 py-1">
                              {STATUS_OPTIONS.filter((s) => s !== o.status).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateStatus(o.id, s)}
                                  className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-secondary/20"
                                >
                                  Mark as {s}
                                </button>
                              ))}
                              {o.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  onClick={() => cancelAndRestock(o.id)}
                                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Refund / Cancel
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">No orders found.</p>
        )}
      </div>

      {shipModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && closeShipModal()}
        >
          <div className="bg-white rounded-xl shadow-premium border border-secondary/30 w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl font-semibold text-primary flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              Ship order & notify customer
            </h2>
            <p className="mt-2 text-sm text-primary/70">
              Order for {customerName(shipModalOrder)} · {formatPrice(shipModalOrder.total_amount)}
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Fastway tracking number *</label>
                <input
                  type="text"
                  value={shipForm.tracking_number}
                  onChange={(e) => setShipForm((f) => ({ ...f, tracking_number: e.target.value }))}
                  placeholder="e.g. 123456789"
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                />
                <p className="mt-1 text-xs text-primary/60">Enter the Fastway label number. A tracking link will be generated automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Number of boxes</label>
                <input
                  type="number"
                  min={1}
                  value={shipForm.number_of_boxes}
                  onChange={(e) => setShipForm((f) => ({ ...f, number_of_boxes: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Custom tracking URL (optional)</label>
                <input
                  type="url"
                  value={shipForm.tracking_url}
                  onChange={(e) => setShipForm((f) => ({ ...f, tracking_url: e.target.value }))}
                  placeholder="Override default Fastway link"
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeShipModal}
                className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={shipAndNotify}
                disabled={updatingId === shipModalOrder.id}
                className="btn-accent px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {updatingId === shipModalOrder.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                Ship & send email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
