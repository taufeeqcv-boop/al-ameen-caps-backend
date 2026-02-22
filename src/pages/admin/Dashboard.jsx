import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { getFunctionUrl } from "../../lib/config";
import { Banknote, ShoppingBag, Inbox, AlertTriangle, Loader2, Calendar, TrendingUp, Mail, Truck, Package, Download } from "lucide-react";
import { Link } from "react-router-dom";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState(null);
  const [revenueThisMonth, setRevenueThisMonth] = useState(null);
  const [revenueLastMonth, setRevenueLastMonth] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [ordersThisMonth, setOrdersThisMonth] = useState(null);
  const [inquiriesCount, setInquiriesCount] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ PENDING: 0, PAID: 0, SHIPPED: 0, CANCELLED: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);

  const [lowStockThreshold, setLowStockThreshold] = useState(LOW_STOCK_THRESHOLD);
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      let threshold = LOW_STOCK_THRESHOLD;
      try {
        const { data: settingsRows } = await supabase.from("site_settings").select("key, value").eq("key", "low_stock_threshold");
        const thresholdFromSettings = settingsRows?.[0]?.value;
        threshold = Math.max(0, parseInt(thresholdFromSettings, 10)) || LOW_STOCK_THRESHOLD;
        if (!cancelled) setLowStockThreshold(threshold);
      } catch (_) {
        // site_settings table may not exist yet; use default
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const startOfMonthIso = startOfMonth.toISOString();
      const startOfLastMonthIso = startOfLastMonth.toISOString();
      const endOfLastMonthIso = endOfLastMonth.toISOString();
      const startOfTodayIso = startOfToday.toISOString();
      const endOfTodayIso = endOfToday.toISOString();

      try {
        const [paidRes, paidCountRes, ordersMonthRes, revenueMonthRes, revenueLastMonthRes, inquiriesRes, lowRes, itemsRes, statusRes, ordersTodayRes, revenueTodayRes] = await Promise.all([
          supabase.from("orders").select("total_amount").eq("status", "PAID"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "PAID"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "PAID").gte("created_at", startOfMonthIso),
          supabase.from("orders").select("total_amount").eq("status", "PAID").gte("created_at", startOfMonthIso),
          supabase.from("orders").select("total_amount").eq("status", "PAID").gte("created_at", startOfLastMonthIso).lte("created_at", endOfLastMonthIso),
          supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase
            .from("products")
            .select("id, name, stock_quantity, sku")
            .lt("stock_quantity", threshold)
            .eq("is_active", true)
            .order("stock_quantity", { ascending: true }),
          supabase.from("order_items").select("product_id, quantity, products(name)"),
          Promise.all(["PENDING", "PAID", "SHIPPED", "CANCELLED"].map((s) => supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", s).then((r) => ({ s, c: r.count ?? 0 })))),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "PAID").gte("created_at", startOfTodayIso).lte("created_at", endOfTodayIso),
          supabase.from("orders").select("total_amount").eq("status", "PAID").gte("created_at", startOfTodayIso).lte("created_at", endOfTodayIso),
        ]);

        if (cancelled) return;
        const totalRevenue = (paidRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        setRevenue(totalRevenue);
        setRevenueThisMonth((revenueMonthRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
        setRevenueLastMonth((revenueLastMonthRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
        setPendingCount(paidCountRes.count ?? 0);
        setOrdersThisMonth(ordersMonthRes.count ?? 0);
        setInquiriesCount(inquiriesRes.count ?? 0);
        setLowStock(lowRes.data ?? []);
        const counts = { PENDING: 0, PAID: 0, SHIPPED: 0, CANCELLED: 0 };
        for (const { s, c } of statusRes) counts[s] = c;
        setStatusCounts(counts);

        const items = itemsRes.data ?? [];
        const byProduct = {};
        for (const row of items) {
          const id = row.product_id;
          const name = row.products?.name ?? "Unknown";
          if (!byProduct[id]) byProduct[id] = { name, quantity: 0 };
          byProduct[id].quantity += Number(row.quantity || 0);
        }
        const top = Object.entries(byProduct)
          .map(([id, { name, quantity }]) => ({ id, name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setTopProducts(top);
        if (!cancelled) {
          setOrdersToday(ordersTodayRes.count ?? 0);
          setRevenueToday((revenueTodayRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const sendLowStockReport = async () => {
    setSendingReport(true);
    setReportMessage(null);
    try {
      let toEmail = "";
      try {
        const { data: settingsRow } = await supabase.from("site_settings").select("value").eq("key", "admin_notification_email").maybeSingle();
        toEmail = (settingsRow?.value || "").trim();
      } catch (_) {}
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(getFunctionUrl("send-low-stock-report"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }) },
        body: JSON.stringify({ threshold: lowStockThreshold, ...(toEmail && { to_email: toEmail }) }),
      });
      const json = await res.json().catch(() => ({}));
      setReportMessage(res.ok ? (json.message || "Report sent.") : (json.error || "Failed"));
    } catch (e) {
      setReportMessage(e?.message || "Failed");
    } finally {
      setSendingReport(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-800 p-4">
        Error loading dashboard: {error}
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const ordersTodayUrl = `/admin/orders?dateFrom=${todayStr}&dateTo=${todayStr}`;

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-primary">Dashboard</h1>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-primary/5 border border-secondary/20">
        <span className="text-sm font-medium text-primary/80">Quick actions</span>
        <Link to="/admin/logistics" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
          <Truck className="w-4 h-4" />
          Orders to ship
        </Link>
        <Link to="/admin/products?low_stock=1" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
          <Package className="w-4 h-4" />
          Low stock
        </Link>
        <Link to="/admin/reservations" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 transition-colors">
          <Inbox className="w-4 h-4" />
          Pre-orders
        </Link>
        <Link to={ordersTodayUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-secondary/40 text-primary hover:bg-secondary/20 transition-colors">
          <Download className="w-4 h-4" />
          Today&apos;s orders
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <Calendar className="w-8 h-8 text-accent" />
            <span className="font-medium">Today</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{ordersToday} orders</p>
          <p className="text-sm text-primary/60">{formatPrice(revenueToday)} revenue (PAID)</p>
          <Link to={ordersTodayUrl} className="text-sm text-accent hover:underline mt-1 inline-block">View today →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <Banknote className="w-8 h-8 text-accent" />
            <span className="font-medium">Total Revenue (ZAR)</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{formatPrice(revenue)}</p>
          <p className="text-sm text-primary/60">Sum of PAID orders</p>
          <div className="mt-3 pt-3 border-t border-secondary/20 text-sm">
            <p className="text-primary/80">This month: <strong>{formatPrice(revenueThisMonth)}</strong></p>
            <p className="text-primary/80">Last month: <strong>{formatPrice(revenueLastMonth)}</strong></p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <ShoppingBag className="w-8 h-8 text-accent" />
            <span className="font-medium">To ship</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{pendingCount}</p>
          <p className="text-sm text-primary/60">PAID orders awaiting dispatch</p>
          <Link to="/admin/logistics" className="text-sm text-accent hover:underline mt-1 inline-block">
            Logistics →
          </Link>
          <span className="text-primary/50 mx-1">·</span>
          <Link to="/admin/orders?status=PAID" className="text-sm text-accent hover:underline">
            Orders
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <Calendar className="w-8 h-8 text-accent" />
            <span className="font-medium">Orders this month</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{ordersThisMonth}</p>
          <p className="text-sm text-primary/60">PAID in {new Date().toLocaleString("en-ZA", { month: "long", year: "numeric" })}</p>
          <Link to="/admin/orders?status=PAID" className="text-sm text-accent hover:underline mt-1 inline-block">
            View orders →
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <Inbox className="w-8 h-8 text-amber-600" />
            <span className="font-medium">Pre-Orders</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{inquiriesCount ?? 0}</p>
          <Link to="/admin/reservations" className="text-sm text-accent hover:underline">
            View pre-orders →
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{lowStock.length}</p>
          <p className="text-sm text-primary/60">Products with stock &lt; {lowStockThreshold}</p>
          <Link to="/admin/products" className="text-sm text-accent hover:underline mt-1 inline-block">
            View products →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <h2 className="font-semibold text-primary px-6 py-4 border-b border-secondary/20">Orders by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
          {["PENDING", "PAID", "SHIPPED", "CANCELLED"].map((s) => (
            <Link key={s} to={`/admin/orders?status=${s}`} className="rounded-lg border border-secondary/30 p-4 text-center hover:bg-secondary/10 transition-colors">
              <p className="text-2xl font-semibold text-primary">{statusCounts[s] ?? 0}</p>
              <p className="text-sm text-primary/60">{s}</p>
            </Link>
          ))}
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
          <h2 className="font-semibold text-primary px-6 py-4 border-b border-secondary/20 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Top products (by units sold)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30 text-primary/80 text-sm">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Units sold</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.id} className="border-t border-secondary/20">
                    <td className="px-6 py-3 text-primary/70">{i + 1}</td>
                    <td className="px-6 py-3 text-primary">{p.name}</td>
                    <td className="px-6 py-3 font-medium text-primary">{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-secondary/20">
          <h2 className="font-semibold text-primary">Low Stock Products</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sendLowStockReport}
              disabled={sendingReport}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/20 text-primary hover:bg-secondary/30 disabled:opacity-50"
            >
              {sendingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Email report
            </button>
            {reportMessage && <span className="text-sm text-primary/70">{reportMessage}</span>}
          </div>
        </div>
        {lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30 text-primary/80 text-sm">
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-t border-secondary/20">
                    <td className="px-6 py-3 text-primary">{p.sku}</td>
                    <td className="px-6 py-3 text-primary">{p.name}</td>
                    <td className="px-6 py-3 text-amber-600 font-medium">{p.stock_quantity}</td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/admin/products?edit=${p.id}`}
                        className="text-accent hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-4 text-primary/60 text-sm">No low-stock products. Use &quot;Email report&quot; to send the current list to the admin email.</p>
        )}
      </div>
    </div>
  );
}
