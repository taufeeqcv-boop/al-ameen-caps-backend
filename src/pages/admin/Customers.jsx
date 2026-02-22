import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader2, ShoppingBag, Search } from "lucide-react";

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState([]);
  const [orderCountByUser, setOrderCountByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone, shipping_address, billing_address")
          .order("last_name", { ascending: true }),
        supabase.from("orders").select("user_id"),
      ]);
      if (profilesRes.error) setError(profilesRes.error.message);
      else setProfiles(profilesRes.data ?? []);
      const countByUser = {};
      (ordersRes.data ?? []).forEach((o) => {
        if (o.user_id) countByUser[o.user_id] = (countByUser[o.user_id] || 0) + 1;
      });
      setOrderCountByUser(countByUser);
      setLoading(false);
    })();
  }, []);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      const name = [p.first_name, p.last_name].filter(Boolean).join(" ").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const phone = (p.phone || "").replace(/\s/g, "");
      const phoneQuery = q.replace(/\s/g, "");
      return name.includes(q) || email.includes(q) || phone.includes(phoneQuery) || (phoneQuery && phone.includes(phoneQuery));
    });
  }, [profiles, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-primary">Customers</h1>
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-secondary/40 text-primary text-sm focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </div>
      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Shipping</th>
                <th className="px-6 py-3 font-medium">Billing</th>
                <th className="px-6 py-3 font-medium w-24">Orders</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary font-medium">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-6 py-3 text-primary text-sm">{p.email || "—"}</td>
                  <td className="px-6 py-3 text-primary text-sm">{p.phone || "—"}</td>
                  <td className="px-6 py-3 text-primary/80 text-sm max-w-xs truncate">
                    {p.shipping_address ? JSON.stringify(p.shipping_address) : "—"}
                  </td>
                  <td className="px-6 py-3 text-primary/80 text-sm max-w-xs truncate">
                    {p.billing_address ? JSON.stringify(p.billing_address) : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/admin/orders?customer=${p.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {orderCountByUser[p.id] ?? 0}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProfiles.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">
            {profiles.length === 0 ? "No customer profiles yet." : "No customers match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
