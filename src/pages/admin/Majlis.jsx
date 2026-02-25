/**
 * Admin Digital Majlis — approve submissions and award "Custodian of the Thread" badge.
 */
import { useEffect, useState } from "react";
import { getMajlisForAdmin, updateMajlis } from "../../lib/supabase";
import { Loader2, Crown, ShieldCheck, CheckCircle2, ExternalLink, Copy, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Toggle({ on, onChange, loading, label, icon: Icon, onColor = "bg-[#065f46]" }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      disabled={loading}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        on ? `${onColor} text-white` : "bg-primary/15 text-primary/70 hover:bg-primary/25"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
      {label}
    </button>
  );
}

export default function AdminMajlis() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMajlisForAdmin();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load submissions");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const copyVerificationTemplate = () => {
    const text = `Subject: Regarding the "Custodian of the Thread" Challenge

Assalamu Alaikum,

Thank you so much for your submission regarding the lineage of Imam Mogamat Talaabodien (Ou Bappa) and the bridge to Asia Taliep (Oemie). We are thrilled to see a potential link for a branch that connects to Bappa (Imam Achmat Talaabodien).

To ensure the Al-Ameen Digital Archive remains a 100% accurate record for future generations, could you please provide a few more "anchors" for this ancestor?

• Full Name & Nickname: (e.g., Was he/she known as "Boeta" or "Aunty"?)
• Burial Place: (Knowing the Qabristan—Mowbray, Constantia, etc.—helps us verify records.)
• Siblings: Do you know the names of any brothers or sisters for this individual?

Once we verify these details against our existing records, we will officially award you the "Custodian of the Thread" title on the live wall and arrange for your Legacy Edition Al-Ameen Cap.

Shukran for helping us protect the light of our ancestors.

Taufeeq Essop
Director, Al-Ameen Caps`;
    navigator.clipboard.writeText(text).then(() => setCopied(true));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async (id, field, value) => {
    setUpdatingId(id);
    try {
      const result = await updateMajlis(id, { [field]: value });
      if (result.error) {
        setError(result.error);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-accent animate-spin" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-medium">Could not load Digital Majlis submissions</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Digital Majlis</h1>
        <Link
          to="/heritage#digital-majlis-heading"
          className="inline-flex items-center gap-2 text-sm text-[#065f46] hover:underline font-medium"
        >
          View wall
          <ExternalLink className="w-4 h-4" aria-hidden />
        </Link>
      </div>

      <p className="text-sm text-primary/70 max-w-2xl">
        Approve submissions to show them on the wall. Award <strong>Custodian of the Thread</strong> to the first contributor who verifies the Level 4 (Discovery Branch) name—they will be honored with a gold badge on the Majlis.
      </p>

      {/* Golden Thread map — keep parent_id correct when moderating */}
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 text-sm">
        <h2 className="font-semibold text-primary mb-2">Golden Thread map (for moderation)</h2>
        <ul className="space-y-1 text-primary/90 font-mono text-xs md:text-sm">
          <li><strong>Level 0:</strong> Tuan Guru (Imam Abdullah Kadi Abdus Salaam, Prince of Tidore)</li>
          <li><strong>Level 1:</strong> Imam Abdurauf (The Scholar)</li>
          <li><strong>Level 2:</strong> Imam Rakiep (The Guardian)</li>
          <li><strong>Level 3:</strong> Imam Mogamat Talaabodien (Ou Bappa) — Patriarch of District Six</li>
          <li><strong>Level 4:</strong> Imam Achmat Talaabodien (Bappa) — Father of Asia Taliep (Oemie)</li>
          <li><strong>Level 5:</strong> Asia Taliep (Oemie) — The Heart of Al-Ameen</li>
        </ul>
      </div>

      {/* Verification protocol — email/WhatsApp template for Level 4 claims */}
      <details className="group rounded-lg border border-primary/20 bg-secondary overflow-hidden">
        <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none font-medium text-primary hover:bg-primary/5">
          <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
          Verification protocol (when someone claims a branch linking to Bappa / Imam Achmat)
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-primary/10">
          <p className="text-sm text-primary/70 mt-3 mb-2">
            Use this template in Email or WhatsApp to request anchors (full name, burial place, siblings) before awarding Custodian.
          </p>
          <button
            type="button"
            onClick={copyVerificationTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#065f46] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#065f46]/90"
          >
            <Copy className="w-4 h-4 shrink-0" aria-hidden />
            {copied ? "Copied to clipboard" : "Copy template"}
          </button>
        </div>
      </details>

      <div className="overflow-x-auto rounded-lg border border-primary/20 bg-secondary">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary/20 bg-primary/5">
              <th className="px-4 py-3 font-semibold text-primary">Ancestor</th>
              <th className="px-4 py-3 font-semibold text-primary">Contributor</th>
              <th className="px-4 py-3 font-semibold text-primary">Submitted</th>
              <th className="px-4 py-3 font-semibold text-primary">Approve</th>
              <th className="px-4 py-3 font-semibold text-primary">Verify</th>
              <th className="px-4 py-3 font-semibold text-primary">Custodian</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-primary/60">
                  No submissions yet. They appear here when someone submits via the Heritage form.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const busy = updatingId === r.id;
                return (
                  <tr key={r.id} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary">{r.ancestor_name}</span>
                      {r.is_admin_post && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-xs font-medium" title="Admin Post — always first on the Wall">
                          <Sparkles className="w-3 h-3" aria-hidden /> Spotlight
                        </span>
                      )}
                      {r.lineage_branch && (
                        <span className="ml-1 text-xs text-[#065f46] font-medium">{r.lineage_branch}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-primary/90">
                      {r.contributor_name || "—"}
                      {r.contributor_email && (
                        <span className="block text-xs text-primary/60">{r.contributor_email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-primary/80 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <Toggle
                        on={r.is_approved === true}
                        onChange={(v) => handleUpdate(r.id, "is_approved", v)}
                        loading={busy}
                        label={r.is_approved ? "Approved" : "Approve"}
                        icon={CheckCircle2}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        on={r.is_verified === true}
                        onChange={(v) => handleUpdate(r.id, "is_verified", v)}
                        loading={busy}
                        label={r.is_verified ? "Verified" : "Verify"}
                        icon={ShieldCheck}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        on={r.is_custodian === true}
                        onChange={(v) => handleUpdate(r.id, "is_custodian", v)}
                        loading={busy}
                        label={r.is_custodian ? "Custodian" : "Award"}
                        icon={Crown}
                        onColor="bg-amber-500"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
