/**
 * Admin Logistics – Fastway workflow
 * Lists PAID orders (to ship), shipping addresses, and actions: packing slip, mark as shipped (Fastway tracking).
 */
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { getFunctionUrl } from "../../lib/config";
import { Loader2, Truck, Printer, FileText, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const FASTWAY_TRACK_BASE = "https://www.fastway.co.za/our-services/track-your-parcel/";
const FASTWAY_EWALLET = "https://www.fastway.co.za/tools/ecommerce/";

export default function AdminLogistics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [shipForm, setShipForm] = useState({ tracking_number: "", number_of_boxes: 1, tracking_url: "" });
  const [updatingId, setUpdatingId] = useState(null);
  const [packingSlipOrder, setPackingSlipOrder] = useState(null);
  const [packingSlipItems, setPackingSlipItems] = useState([]);

  const fetchToShip = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        shipping_data,
        customer_email,
        admin_notes,
        profiles ( first_name, last_name )
      `)
      .eq("status", "PAID")
      .order("created_at", { ascending: true });
    if (e) setError(e.message);
    else setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchToShip();
  }, []);

  const customerName = (o) => {
    const p = o.profiles;
    if (!p) return "—";
    return [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
  };

  const shippingAddress = (o) => {
    const sd = o.shipping_data || {};
    return [sd.address_line1, sd.address_line2, sd.city, sd.postal_code].filter(Boolean).join(", ") || "—";
  };

  const openShipModal = (order) => {
    setShipModalOrder(order);
    setShipForm({
      tracking_number: order.shipping_data?.tracking_number ?? "",
      number_of_boxes: order.shipping_data?.number_of_boxes ?? 1,
      tracking_url: order.shipping_data?.tracking_url ?? "",
    });
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
    const trackingUrl =
      (shipForm.tracking_url || "").trim() ||
      (trackingNumber.startsWith("http") ? trackingNumber : `${FASTWAY_TRACK_BASE}?label_no=${encodeURIComponent(trackingNumber)}`);
    const numBoxes = Math.max(1, parseInt(String(shipForm.number_of_boxes), 10) || 1);

    setUpdatingId(shipModalOrder.id);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(getFunctionUrl("send-shipping-notification"), {
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
      await fetchToShip();
    } catch (err) {
      setError(err?.message || "Failed to ship and notify");
    } finally {
      setUpdatingId(null);
    }
  };

  const openPackingSlip = async (order) => {
    setPackingSlipOrder(order);
    setPackingSlipItems([]);
    if (!supabase) return;
    const { data } = await supabase.from("order_items").select("product_name, quantity, unit_price").eq("order_id", order.id);
    setPackingSlipItems(data ?? []);
  };

  const closePackingSlip = () => {
    setPackingSlipOrder(null);
    setPackingSlipItems([]);
  };

  const exportToShipCsv = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Address", "City", "Postal Code", "Total"];
    const escape = (v) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const rows = orders.map((o) => {
      const sd = o.shipping_data || {};
      return [
        o.id,
        customerName(o),
        o.customer_email ?? "",
        sd.phone ?? "",
        [sd.address_line1, sd.address_line2].filter(Boolean).join(", "),
        sd.city ?? "",
        sd.postal_code ?? "",
        o.total_amount ?? "",
      ].map(escape);
    });
    const csv = [headers.map(escape).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `to-ship-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (packingSlipOrder) document.body.classList.add("packing-slip-open");
    else document.body.classList.remove("packing-slip-open");
    return () => document.body.classList.remove("packing-slip-open");
  }, [packingSlipOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-primary">Logistics</h1>

      <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-4 text-sm text-primary/90">
        <p className="font-medium text-amber-900/90">Fastway workflow</p>
        <p className="mt-1">
          Create labels in your{" "}
          <a href={FASTWAY_EWALLET} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline inline-flex items-center gap-1">
            Fastway eWallet / eCommerce tools
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          , then enter the tracking number below when you mark an order as shipped. The customer will receive an email with the tracking link.
        </p>
        <p className="mt-2 text-primary/70">
          <a href={FASTWAY_TRACK_BASE} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Track a parcel →
          </a>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <p className="text-primary/80">
          <strong>{orders.length}</strong> order{orders.length !== 1 ? "s" : ""} to ship (PAID)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportToShipCsv}
            disabled={orders.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export addresses (CSV)
          </button>
          <Link
            to="/admin/orders?status=PAID"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20"
          >
            View in Orders →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Shipping address</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary text-sm">
                    {o.id.slice(0, 8)}…
                    <br />
                    <span className="text-primary/60">{o.created_at ? new Date(o.created_at).toLocaleDateString("en-ZA") : ""}</span>
                  </td>
                  <td className="px-6 py-3 text-primary">
                    {customerName(o)}
                    {o.customer_email && <div className="text-xs text-primary/60">{o.customer_email}</div>}
                  </td>
                  <td className="px-6 py-3 text-primary/90 text-sm max-w-xs">{shippingAddress(o)}</td>
                  <td className="px-6 py-3 text-primary text-sm">{(o.shipping_data || {}).phone || "—"}</td>
                  <td className="px-6 py-3 font-medium text-primary">{formatPrice(o.total_amount)}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openPackingSlip(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary/20 text-primary hover:bg-secondary/30"
                      >
                        <FileText className="w-4 h-4" />
                        Slip
                      </button>
                      <button
                        type="button"
                        onClick={() => openShipModal(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm btn-accent"
                      >
                        <Truck className="w-4 h-4" />
                        Ship
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="px-6 py-12 text-center text-primary/60">No orders to ship. All PAID orders have been dispatched or there are none yet.</p>
        )}
      </div>

      {/* Packing slip modal */}
      {packingSlipOrder && (
        <div
          className="packing-slip-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && closePackingSlip()}
        >
          <div className="bg-white rounded-xl shadow-premium border border-secondary/30 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Packing slip — Order {packingSlipOrder.id.slice(0, 8)}
              </h2>
              <button type="button" onClick={closePackingSlip} className="text-primary/60 hover:text-primary text-xl leading-none">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-left" id="packing-slip-content">
              <p className="font-medium text-primary">{customerName(packingSlipOrder)}</p>
              {packingSlipOrder.customer_email && <p className="text-primary/80">{packingSlipOrder.customer_email}</p>}
              {(packingSlipOrder.shipping_data?.phone) && <p className="text-primary/80">{packingSlipOrder.shipping_data.phone}</p>}
              <div className="mt-2 text-primary/80">{shippingAddress(packingSlipOrder)}</div>
              <table className="w-full mt-4 border-collapse">
                <thead>
                  <tr className="border-b border-secondary/30">
                    <th className="text-left py-2 font-medium">Item</th>
                    <th className="text-center py-2 font-medium">Qty</th>
                    <th className="text-right py-2 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {packingSlipItems.map((item, i) => (
                    <tr key={i} className="border-b border-secondary/10">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatPrice(item.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 font-medium">Total: {formatPrice(packingSlipOrder.total_amount)}</p>
              {packingSlipOrder.admin_notes && <p className="mt-2 text-amber-800 text-xs">Note: {packingSlipOrder.admin_notes}</p>}
            </div>
            <div className="px-6 py-4 border-t border-secondary/20 flex justify-end gap-2">
              <button type="button" onClick={closePackingSlip} className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20">Close</button>
              <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-lg btn-accent flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship (Fastway) modal */}
      {shipModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && closeShipModal()}
        >
          <div className="bg-white rounded-xl shadow-premium border border-secondary/30 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl font-semibold text-primary flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              Mark as shipped (Fastway)
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
                  placeholder="e.g. label number from eWallet"
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                />
                <p className="mt-1 text-xs text-primary/60">Enter the Fastway label number. A tracking link will be generated.</p>
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
              <button type="button" onClick={closeShipModal} className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20">Cancel</button>
              <button
                type="button"
                onClick={shipAndNotify}
                disabled={updatingId === shipModalOrder.id}
                className="btn-accent px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {updatingId === shipModalOrder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                Ship & notify customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
