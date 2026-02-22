import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Save } from "lucide-react";

const DEFAULT_THRESHOLD = 5;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(String(DEFAULT_THRESHOLD));
  const [storeNotice, setStoreNotice] = useState("");
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: e } = await supabase.from("site_settings").select("key, value").in("key", ["low_stock_threshold", "store_notice", "admin_notification_email"]);
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
      const map = {};
      (data || []).forEach((r) => { map[r.key] = r.value; });
      setLowStockThreshold(map.low_stock_threshold ?? String(DEFAULT_THRESHOLD));
      setStoreNotice(map.store_notice ?? "");
      setAdminNotificationEmail(map.admin_notification_email ?? "");
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const threshold = Math.max(0, parseInt(lowStockThreshold, 10));
    const thresholdStr = Number.isNaN(threshold) ? String(DEFAULT_THRESHOLD) : String(threshold);
    try {
      await supabase.from("site_settings").upsert([
        { key: "low_stock_threshold", value: thresholdStr },
        { key: "store_notice", value: (storeNotice || "").trim() },
        { key: "admin_notification_email", value: (adminNotificationEmail || "").trim() },
      ], { onConflict: "key" });
      setLowStockThreshold(thresholdStr);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
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
      <h1 className="font-serif text-2xl font-semibold text-primary">Settings</h1>
      {error && <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>}
      {message && <div className="rounded-lg bg-green-50 text-green-800 p-4 text-sm">{message}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-premium border border-secondary/30 p-6 max-w-lg space-y-6">
        <div>
          <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-primary mb-1">Low stock threshold</label>
          <input
            id="low_stock_threshold"
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <p className="mt-1 text-xs text-primary/60">Products with stock below this number appear in the Dashboard low-stock list.</p>
        </div>
        <div>
          <label htmlFor="admin_notification_email" className="block text-sm font-medium text-primary mb-1">Admin notification email</label>
          <input
            id="admin_notification_email"
            type="email"
            value={adminNotificationEmail}
            onChange={(e) => setAdminNotificationEmail(e.target.value)}
            placeholder="e.g. admin@alameencaps.com"
            className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <p className="mt-1 text-xs text-primary/60">Used for low-stock report emails when set. Otherwise the logged-in admin or ADMIN_EMAIL is used.</p>
        </div>
        <div>
          <label htmlFor="store_notice" className="block text-sm font-medium text-primary mb-1">Store notice</label>
          <textarea
            id="store_notice"
            rows={3}
            value={storeNotice}
            onChange={(e) => setStoreNotice(e.target.value)}
            placeholder="Optional banner message on the storefront (leave empty to hide)"
            className="w-full px-3 py-2 border border-secondary/40 rounded-lg text-primary focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-accent disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save settings
        </button>
      </form>
    </div>
  );
}
