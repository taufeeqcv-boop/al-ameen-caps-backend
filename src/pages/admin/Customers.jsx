import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: e } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, shipping_address, billing_address")
        .order("last_name", { ascending: true });
      if (e) setError(e.message);
      else setProfiles(data ?? []);
      setLoading(false);
    })();
  }, []);

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
      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Shipping</th>
                <th className="px-6 py-3 font-medium">Billing</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3 text-primary font-medium">
                    {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-6 py-3 text-primary text-sm">{p.phone || "—"}</td>
                  <td className="px-6 py-3 text-primary/80 text-sm max-w-xs truncate">
                    {p.shipping_address ? JSON.stringify(p.shipping_address) : "—"}
                  </td>
                  <td className="px-6 py-3 text-primary/80 text-sm max-w-xs truncate">
                    {p.billing_address ? JSON.stringify(p.billing_address) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profiles.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">No customer profiles yet.</p>
        )}
      </div>
    </div>
  );
}
