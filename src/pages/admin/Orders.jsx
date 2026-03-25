import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { getFunctionUrl } from "../../lib/config";
import { Loader2, MoreHorizontal, RotateCcw, Truck, Download, Printer, FileText, Search, Receipt, CircleDollarSign } from "lucide-react";
import { insertCashSaleOrder } from "../../lib/orders";
import { useSearchParams } from "react-router-dom";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
const FASTWAY_TRACK_BASE = "https://www.fastway.co.za/our-services/track-your-parcel/";

function getDatePreset(preset) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const pad = (n) => String(n).padStart(2, "0");
  if (preset === "today") {
    const s = `${y}-${pad(m + 1)}-${pad(d)}`;
    return { dateFrom: s, dateTo: s };
  }
  if (preset === "last7") {
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return {
      dateFrom: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      dateTo: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    };
  }
  if (preset === "month") {
    return {
      dateFrom: `${y}-${pad(m + 1)}-01`,
      dateTo: `${y}-${pad(m + 1)}-${pad(d)}`,
    };
  }
  return { dateFrom: "", dateTo: "" };
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const customerId = searchParams.get("customer") || "";
  const urlDateFrom = searchParams.get("dateFrom") || "";
  const urlDateTo = searchParams.get("dateTo") || "";
  const [orders, setOrders] = useState([]);
  const [customerLabel, setCustomerLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [shipForm, setShipForm] = useState({ tracking_number: "", number_of_boxes: 1, tracking_url: "" });
  const [packingSlipOrder, setPackingSlipOrder] = useState(null);
  const [packingSlipItems, setPackingSlipItems] = useState([]);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [notesEditId, setNotesEditId] = useState(null);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotesId, setSavingNotesId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState(urlDateFrom);
  const [dateTo, setDateTo] = useState(urlDateTo);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkUpdateMessage, setBulkUpdateMessage] = useState(null);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashJson, setCashJson] = useState('[{"product_id": 1, "quantity": 1}]');
  const [cashEmail, setCashEmail] = useState("");
  const [cashNotes, setCashNotes] = useState("");
  const [cashBusy, setCashBusy] = useState(false);
  const [cashErr, setCashErr] = useState(null);
  const [cashMsg, setCashMsg] = useState(null);

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
        customer_email,
        admin_notes,
        payment_method,
        profiles ( first_name, last_name )
      `)
      .order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    if (customerId) q = q.eq("user_id", customerId);
    if (dateFrom) q = q.gte("created_at", dateFrom + "T00:00:00.000Z");
    if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59.999Z");
    const { data, error: e } = await q;
    if (e) setError(e.message);
    else setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    setDateFrom(urlDateFrom);
    setDateTo(urlDateTo);
  }, [urlDateFrom, urlDateTo]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, customerId, dateFrom, dateTo]);

  useEffect(() => {
    if (!customerId || !supabase) {
      setCustomerLabel("");
      return;
    }
    (async () => {
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", customerId).single();
      const name = data ? [data.first_name, data.last_name].filter(Boolean).join(" ") : "Customer";
      setCustomerLabel(name);
    })();
  }, [customerId]);

  const customerName = (o) => {
    const p = o.profiles;
    if (!p) return "—";
    return [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const name = customerName(o).toLowerCase();
      const email = (o.customer_email || "").toLowerCase();
      const id = (o.id || "").toLowerCase();
      return id.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [orders, searchQuery]);

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

  const openInvoice = async (order) => {
    setInvoiceOrder(order);
    setInvoiceItems([]);
    if (!supabase) return;
    const { data } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, product_id")
      .eq("order_id", order.id);
    setInvoiceItems(data ?? []);
  };

  const closeInvoice = () => {
    setInvoiceOrder(null);
    setInvoiceItems([]);
  };

  useEffect(() => {
    if (invoiceOrder) document.body.classList.add("invoice-open");
    else document.body.classList.remove("invoice-open");
    return () => document.body.classList.remove("invoice-open");
  }, [invoiceOrder]);

  useEffect(() => {
    if (packingSlipOrder) document.body.classList.add("packing-slip-open");
    else document.body.classList.remove("packing-slip-open");
    return () => document.body.classList.remove("packing-slip-open");
  }, [packingSlipOrder]);

  const saveAdminNotes = async (orderId) => {
    if (!supabase) return;
    setSavingNotesId(orderId);
    await supabase.from("orders").update({ admin_notes: notesValue || null }).eq("id", orderId);
    await fetchOrders();
    setNotesEditId(null);
    setNotesValue("");
    setSavingNotesId(null);
  };

  const startEditNotes = (order) => {
    setNotesEditId(order.id);
    setNotesValue(order.admin_notes ?? "");
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

  const escapeCsv = (v) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };

  const exportCsv = () => {
    const headers = ["Order ID", "Date", "Customer", "Email", "Total (ZAR)", "Payment", "Status", "Shipping address", "Phone", "Admin notes"];
    const rows = filteredOrders.map((o) => {
      const sd = o.shipping_data || {};
      const addr = [sd.address_line1, sd.address_line2, sd.city, sd.postal_code].filter(Boolean).join(", ");
      return [
        o.id,
        o.created_at ? new Date(o.created_at).toISOString().slice(0, 10) : "",
        customerName(o),
        o.customer_email ?? "",
        o.total_amount ?? "",
        o.payment_method ?? "online",
        o.status ?? "",
        addr,
        sd.phone ?? "",
        o.admin_notes ?? "",
      ].map(escapeCsv);
    });
    const csv = [headers.map(escapeCsv).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${statusFilter || "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** CSV for Google Ads Customer Match: Email + Phone, one row per unique email (from current filter). */
  const bulkUpdateToStage3 = async () => {
    if (!supabase) return;
    const paidOrders = filteredOrders.filter((o) => o.status === "PAID");
    if (paidOrders.length === 0) {
      setError("No PAID orders found to update.");
      return;
    }

    if (!confirm(`Move ${paidOrders.length} PAID order(s) to Stage 3 (Ready for Dispatch) and send email notifications?`)) {
      return;
    }

    setBulkUpdating(true);
    setError(null);
    setBulkUpdateMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const url = getFunctionUrl("send-ready-for-dispatch");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          order_ids: paidOrders.map((o) => o.id),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
        return;
      }

      setBulkUpdateMessage(
        `Successfully processed ${json.processed || 0} order(s). ${json.failed || 0} failed. ${json.message || ""}`
      );
      await fetchOrders();
    } catch (err) {
      setError(err?.message || "Bulk update failed");
    } finally {
      setBulkUpdating(false);
    }
  };

  const submitCashSale = async () => {
    setCashErr(null);
    setCashMsg(null);
    let items;
    try {
      items = JSON.parse(cashJson);
    } catch {
      setCashErr("Invalid JSON. Use an array like [{\"product_id\": 1, \"quantity\": 2}].");
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      setCashErr("Provide a non-empty array of line items.");
      return;
    }
    setCashBusy(true);
    try {
      const { orderId, total } = await insertCashSaleOrder({
        items,
        customerEmail: cashEmail.trim() || undefined,
        adminNotes: cashNotes.trim() || undefined,
      });
      setCashMsg(`Recorded: ${orderId} · ${formatPrice(total)} (PAID, cash)`);
      setCashModalOpen(false);
      setCashJson('[{"product_id": 1, "quantity": 1}]');
      setCashEmail("");
      setCashNotes("");
      await fetchOrders();
    } catch (e) {
      setCashErr(e?.message || "Failed to record cash sale.");
    } finally {
      setCashBusy(false);
    }
  };

  const exportCustomerListCsv = () => {
    const seen = new Set();
    const rows = [];
    for (const o of filteredOrders) {
      const email = (o.customer_email ?? "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      const phone = (o.shipping_data?.phone ?? "").trim();
      rows.push([email, phone].map(escapeCsv));
    }
    const headers = ["Email", "Phone"];
    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-list-google-ads-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="font-serif text-2xl font-semibold text-primary">Orders</h1>
        {customerId && customerLabel && (
          <p className="text-sm text-primary/80">
            Showing orders for <strong>{customerLabel}</strong>
            {" · "}
            <a href="/admin/orders" className="text-accent hover:underline">View all orders</a>
          </p>
        )}
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}
      {bulkUpdateMessage && (
        <div className="rounded-lg bg-emerald-50 text-emerald-800 p-4 text-sm">{bulkUpdateMessage}</div>
      )}
      {cashMsg && (
        <div className="rounded-lg bg-emerald-50 text-emerald-800 p-4 text-sm">{cashMsg}</div>
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Today", preset: "today" },
              { label: "Last 7 days", preset: "last7" },
              { label: "This month", preset: "month" },
            ].map(({ label, preset }) => {
              const { dateFrom: df, dateTo: dt } = getDatePreset(preset);
              const isActive = dateFrom === df && dateTo === dt;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setDateFrom(df); setDateTo(dt); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-accent text-primary" : "bg-white border border-secondary/40 text-primary hover:bg-secondary/20"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm focus:ring-2 focus:ring-accent"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm focus:ring-2 focus:ring-accent"
            title="To date"
          />
          {(searchQuery || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); }}
              className="px-3 py-2 rounded-lg text-sm text-primary/70 hover:bg-secondary/20"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-between">
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
          <div className="flex items-center gap-2">
            {statusFilter === "PAID" && (
              <button
                type="button"
                onClick={bulkUpdateToStage3}
                disabled={bulkUpdating || filteredOrders.filter((o) => o.status === "PAID").length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move all PAID orders to Stage 3 (Ready for Dispatch) and send email notifications"
              >
                {bulkUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    Bulk: Ready for Dispatch (Stage 3)
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => { setCashErr(null); setCashMsg(null); setCashModalOpen(true); }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-secondary hover:bg-primary/90 flex items-center gap-2"
              title="Record in-person cash: creates PAID order and updates stock"
            >
              <CircleDollarSign className="w-4 h-4" />
              Log cash sale
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={exportCustomerListCsv}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 flex items-center gap-2 disabled:opacity-50"
              title="One row per customer (Email + Phone) for Google Ads Customer Match"
            >
              <FileText className="w-4 h-4" />
              Customer list (Google Ads)
            </button>
          </div>
      </div>
      </div>
      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Pay</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Notes</th>
                <th className="px-6 py-3 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary text-sm">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-3 text-primary">{customerName(o)}</td>
                  <td className="px-6 py-3 text-primary text-sm">{o.customer_email || "—"}</td>
                  <td className="px-6 py-3 text-primary font-medium">{formatPrice(o.total_amount)}</td>
                  <td className="px-6 py-3 text-primary text-xs">
                    {(o.payment_method || "online") === "cash" ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">cash</span>
                    ) : (
                      <span className="text-primary/60">online</span>
                    )}
                  </td>
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
                  <td className="px-6 py-3 text-primary/80 text-sm max-w-[180px]">
                    {notesEditId === o.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Internal notes..."
                          className="px-2 py-1 border border-secondary/40 rounded text-sm w-full"
                        />
                        <div className="flex gap-1">
                          <button type="button" onClick={() => saveAdminNotes(o.id)} disabled={savingNotesId === o.id} className="text-xs text-accent hover:underline">
                            {savingNotesId === o.id ? "Saving..." : "Save"}
                          </button>
                          <button type="button" onClick={() => { setNotesEditId(null); setNotesValue(""); }} className="text-xs text-primary/60 hover:underline">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <span title={o.admin_notes || ""} className="cursor-pointer hover:text-accent" onClick={() => startEditNotes(o)}>
                        {(o.admin_notes || "—").slice(0, 30)}{(o.admin_notes && o.admin_notes.length > 30) ? "…" : ""}
                      </span>
                    )}
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
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-secondary/30 rounded-lg shadow-lg z-20 py-1">
                              <button
                                type="button"
                                onClick={() => { setDropdownOpenId(null); openPackingSlip(o); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-primary hover:bg-secondary/20"
                              >
                                <Printer className="w-4 h-4" />
                                Packing slip
                              </button>
                              <button
                                type="button"
                                onClick={() => { setDropdownOpenId(null); openInvoice(o); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-primary hover:bg-secondary/20"
                              >
                                <Receipt className="w-4 h-4" />
                                Print Invoice
                              </button>
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
        {filteredOrders.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">{orders.length === 0 ? "No orders found." : "No orders match your search or date range."}</p>
        )}
      </div>

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
              <button type="button" onClick={closePackingSlip} className="text-primary/60 hover:text-primary">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-left print:overflow-visible" id="packing-slip-content">
              <p className="font-medium text-primary">{customerName(packingSlipOrder)}</p>
              {packingSlipOrder.customer_email && <p className="text-primary/80">{packingSlipOrder.customer_email}</p>}
              {(packingSlipOrder.shipping_data?.phone) && <p className="text-primary/80">{packingSlipOrder.shipping_data.phone}</p>}
              <div className="mt-2 text-primary/80">
                {[packingSlipOrder.shipping_data?.address_line1, packingSlipOrder.shipping_data?.address_line2, packingSlipOrder.shipping_data?.city, packingSlipOrder.shipping_data?.postal_code].filter(Boolean).join(", ")}
              </div>
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
              <button type="button" onClick={closePackingSlip} className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20">
                Close
              </button>
              <button
                type="button"
                onClick={() => { window.print(); }}
                className="px-4 py-2 rounded-lg btn-accent flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {cashModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && !cashBusy && setCashModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-premium border border-secondary/30 w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl font-semibold text-primary flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-accent" />
              Log cash sale
            </h2>
            <p className="mt-2 text-sm text-primary/70">
              Creates a PAID order with payment cash, decrements stock. Use your real product IDs from the catalog.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Line items (JSON)</label>
                <textarea
                  value={cashJson}
                  onChange={(e) => setCashJson(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary text-sm font-mono focus:ring-2 focus:ring-accent focus:border-accent"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Customer email (optional)</label>
                <input
                  type="email"
                  value={cashEmail}
                  onChange={(e) => setCashEmail(e.target.value)}
                  placeholder="walk-in@example.com"
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={cashNotes}
                  onChange={(e) => setCashNotes(e.target.value)}
                  placeholder="e.g. Market stall, 22 Mar"
                  className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              {cashErr && (
                <div className="rounded-lg bg-red-50 text-red-800 p-3 text-sm">{cashErr}</div>
              )}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => !cashBusy && setCashModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20 disabled:opacity-50"
                disabled={cashBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCashSale}
                disabled={cashBusy}
                className="btn-accent px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {cashBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CircleDollarSign className="w-4 h-4" />}
                Record sale
              </button>
            </div>
          </div>
        </div>
      )}

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

      {invoiceOrder && (
        <div
          className="invoice-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          onClick={(e) => e.target === e.currentTarget && closeInvoice()}
        >
          <div className="bg-white rounded-xl shadow-premium border border-secondary/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between print:hidden">
              <h2 className="font-serif text-lg font-semibold text-primary flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" />
                Invoice — Order {invoiceOrder.id.slice(0, 8)}
              </h2>
              <button type="button" onClick={closeInvoice} className="text-primary/60 hover:text-primary">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-sm text-left print:p-8 print:overflow-visible relative" id="invoice-content">
              {/* PAID Watermark - Only for PAID orders */}
              {invoiceOrder.status === "PAID" && (
                <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ zIndex: 1 }}
                >
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 whitespace-nowrap"
                    style={{
                      fontSize: "clamp(4rem, 12vw, 10rem)",
                      fontWeight: "bold",
                      color: "rgba(34, 197, 94, 0.08)",
                      letterSpacing: "0.1em",
                      userSelect: "none",
                      lineHeight: "1",
                    }}
                  >
                    PAID
                  </div>
                </div>
              )}
              <div className="relative" style={{ zIndex: 2 }}>
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8 print:mb-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-primary mb-2">Al-Ameen Caps</h1>
                  <address className="not-italic text-primary/70 text-sm leading-relaxed">
                    <p>205 Wallace Street, Glenwood</p>
                    <p>Cape Town, 7460, South Africa</p>
                    <p className="mt-1">
                      <a href="tel:0810487447" className="text-primary/70 hover:text-accent">081 048 7447</a>
                    </p>
                    <p>
                      <a href="https://alameencaps.com" className="text-primary/70 hover:text-accent">alameencaps.com</a>
                    </p>
                  </address>
                </div>
                <div className="text-right">
                  <h2 className="font-serif text-xl font-semibold text-primary mb-4">INVOICE</h2>
                  <div className="text-primary/70 text-sm space-y-1">
                    <p><strong className="text-primary">Invoice #:</strong> {invoiceOrder.id.slice(0, 8)}</p>
                    <p><strong className="text-primary">Date:</strong> {invoiceOrder.created_at ? new Date(invoiceOrder.created_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</p>
                    <p><strong className="text-primary">Status:</strong> <span className={`font-medium ${invoiceOrder.status === "PAID" ? "text-green-700" : invoiceOrder.status === "SHIPPED" ? "text-blue-700" : "text-amber-700"}`}>{invoiceOrder.status}</span></p>
                    {invoiceOrder.status === "PAID" && (
                      <p className="text-green-700 font-medium">Paid via PayFast</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="mb-8 print:mb-6">
                <h3 className="font-semibold text-primary mb-2 uppercase text-xs tracking-wide">Bill To:</h3>
                <div className="text-primary/80">
                  <p className="font-medium text-primary">{customerName(invoiceOrder)}</p>
                  {invoiceOrder.customer_email && <p>{invoiceOrder.customer_email}</p>}
                  {invoiceOrder.shipping_data?.phone && <p>{invoiceOrder.shipping_data.phone}</p>}
                  {invoiceOrder.shipping_data && (
                    <div className="mt-1">
                      {[
                        invoiceOrder.shipping_data.address_line1,
                        invoiceOrder.shipping_data.address_line2,
                        invoiceOrder.shipping_data.city,
                        invoiceOrder.shipping_data.postal_code,
                      ].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full border-collapse mb-6 print:mb-4">
                <thead>
                  <tr className="border-b-2 border-primary/30">
                    <th className="text-left py-3 px-2 font-semibold text-primary">Item</th>
                    <th className="text-center py-3 px-2 font-semibold text-primary">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold text-primary">Unit Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-primary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, i) => (
                    <tr key={i} className="border-b border-secondary/20">
                      <td className="py-3 px-2 text-primary">{item.product_name || "Item"}</td>
                      <td className="text-center py-3 px-2 text-primary">{item.quantity || 1}</td>
                      <td className="text-right py-3 px-2 text-primary">{formatPrice(item.unit_price || 0)}</td>
                      <td className="text-right py-3 px-2 text-primary font-medium">{formatPrice((item.unit_price || 0) * (item.quantity || 1))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/30">
                    <td colSpan="3" className="text-right py-3 px-2 font-semibold text-primary">Total:</td>
                    <td className="text-right py-3 px-2 font-bold text-lg text-primary">{formatPrice(invoiceOrder.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-secondary/20 text-xs text-primary/60 print:mt-6">
                <p className="mb-2">
                  <strong className="text-primary/80">Thank you for your order!</strong> We appreciate your business and hope you enjoy your Al-Ameen Caps products.
                </p>
                <p className="mb-2">
                  For returns and exchanges, please visit{" "}
                  <a href="https://alameencaps.com/shipping-returns" className="text-accent hover:underline">alameencaps.com/shipping-returns</a>
                  {" "}or contact us at{" "}
                  <a href="tel:0810487447" className="text-accent hover:underline">081 048 7447</a>.
                </p>
                <p className="text-primary/50 italic mb-4">
                  This is an official invoice from Al-Ameen Caps. Please retain for your records.
                </p>
                
                {/* Heritage Note */}
                <div className="mt-6 pt-4 border-t border-secondary/30 print:mt-4">
                  <p className="text-primary/70 italic text-center leading-relaxed">
                    <strong className="text-primary/90 not-italic">Al-Ameen Caps</strong> represents a legacy of craftsmanship and heritage. Thank you for being part of our story.{" "}
                    <span className="not-italic">Handcrafted in Mumbai, Shipped from Cape Town.</span>
                  </p>
                </div>
              </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-secondary/20 flex justify-end gap-2 print:hidden">
              <button type="button" onClick={closeInvoice} className="px-4 py-2 rounded-lg border border-secondary/40 text-primary hover:bg-secondary/20">
                Close
              </button>
              <button
                type="button"
                onClick={() => { window.print(); }}
                className="px-4 py-2 rounded-lg btn-accent flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
