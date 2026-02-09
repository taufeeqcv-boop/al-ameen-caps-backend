import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { Banknote, ShoppingBag, Inbox, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const [revenue, setRevenue] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [inquiriesCount, setInquiriesCount] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const [paidRes, paidCountRes, inquiriesRes, lowRes] = await Promise.all([
          supabase.from("orders").select("total_amount").eq("status", "PAID"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "PAID"),
          supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase
            .from("products")
            .select("id, name, stock_quantity, sku")
            .lt("stock_quantity", LOW_STOCK_THRESHOLD)
            .eq("is_active", true)
            .order("stock_quantity", { ascending: true }),
        ]);

        if (cancelled) return;
        const totalRevenue = (paidRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        setRevenue(totalRevenue);
        setPendingCount(paidCountRes.count ?? 0);
        setInquiriesCount(inquiriesRes.count ?? 0);
        setLowStock(lowRes.data ?? []);
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-800 p-4">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <Banknote className="w-8 h-8 text-accent" />
            <span className="font-medium">Total Revenue (ZAR)</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {formatPrice(revenue)}
          </p>
          <p className="text-sm text-primary/60">Sum of PAID orders</p>
        </div>
        <div className="bg-white rounded-xl shadow-premium p-6 border border-secondary/30">
          <div className="flex items-center gap-3 text-primary/70">
            <ShoppingBag className="w-8 h-8 text-accent" />
            <span className="font-medium">Paid Orders</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">{pendingCount}</p>
          <Link to="/admin/orders?status=PAID" className="text-sm text-accent hover:underline">
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
          <p className="text-sm text-primary/60">Products with stock &lt; {LOW_STOCK_THRESHOLD}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
          <h2 className="font-semibold text-primary px-6 py-4 border-b border-secondary/20">
            Low Stock Products
          </h2>
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
        </div>
      )}
    </div>
  );
}
