/**
 * Digital Majlis — submission form: ancestor story + optional photo.
 * Archive Covenant at top; emerald accents; success screen = "History Preserved. Shukran."
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, CheckCircle2, ScrollText } from "lucide-react";
import { uploadMajlisImage, insertMajlisSubmission, getApprovedMajlisForParentDropdown } from "../lib/supabase";
import { getBaseUrl } from "../lib/seo";

const PARENT_HELP = "Linking an ancestor to their parent helps us map the branches of the Taliep and Rakiep families.";

const COVENANT = {
  title: "The Al-Ameen Archive Covenant",
  points: [
    "Respect the Lineage: This space is for the preservation of Tuan Guru family history and the Taliep and Rakiep branches.",
    "Verification First: To maintain the integrity of our tree, photos should ideally be accompanied by family names or branch details.",
    "Sacred Space: This is a non-commercial community hub. Your family photos will remain part of our digital archive and will not be used for advertising without express consent.",
  ],
};

const PRIVACY_COVENANT_LABEL = "I agree to share this for the Al-Ameen Digital Archive.";

export default function MajlisForm({ onSuccess }) {
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [ancestorName, setAncestorName] = useState("");
  const [approximateDates, setApproximateDates] = useState("");
  const [relation, setRelation] = useState("");
  const [storyText, setStoryText] = useState("");
  const [lineageBranch, setLineageBranch] = useState("");
  const [parentId, setParentId] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [restingPlace, setRestingPlace] = useState("");
  const [maidenName, setMaidenName] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parentSearch, setParentSearch] = useState("");
  const [showParentHelp, setShowParentHelp] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [consentArchive, setConsentArchive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null); // { contributorName, imageUrl } for success screen

  useEffect(() => {
    getApprovedMajlisForParentDropdown().then(setParentOptions);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedAncestor = ancestorName.trim();
    const trimmedStory = storyText.trim();
    if (!trimmedAncestor || !trimmedStory) {
      setError("Ancestor name and story are required.");
      return;
    }
    const email = contributorEmail.trim();
    if (!email) {
      setError("Email address is required so we can notify you when your story is approved.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!consentArchive) {
      setError("Please agree to share for the Al-Ameen Digital Archive.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadMajlisImage(imageFile);
        if (!imageUrl) {
          setError("Photo upload failed. Please try again or submit without a photo.");
          setSubmitting(false);
          return;
        }
      }
      const result = await insertMajlisSubmission({
        contributor_name: contributorName.trim() || "A family member",
        contributor_email: email,
        ancestor_name: trimmedAncestor,
        approximate_dates: approximateDates.trim() || null,
        relation: relation.trim() || null,
        story_text: trimmedStory,
        image_url: imageUrl,
        lineage_branch: lineageBranch.trim() || null,
        consent_photo_shared: consentArchive,
        parent_id: parentId.trim() || null,
        birth_year: birthYear.trim() ? parseInt(birthYear, 10) : null,
        death_year: deathYear.trim() ? parseInt(deathYear, 10) : null,
        resting_place: restingPlace.trim() || null,
        maiden_name: maidenName.trim() || null,
      });
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      const nameForThankYou = contributorName.trim() || "A family member";
      setSuccessData({ contributorName: nameForThankYou, imageUrl });
      setSuccess(true);
      setContributorName("");
      setContributorEmail("");
      setAncestorName("");
      setApproximateDates("");
      setRelation("");
      setStoryText("");
      setLineageBranch("");
      setParentId("");
      setParentSearch("");
      setBirthYear("");
      setDeathYear("");
      setRestingPlace("");
      setMaidenName("");
      setImageFile(null);
      setConsentArchive(false);
      if (typeof onSuccess === "function") onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success && successData) {
    const heritageUrl = `${getBaseUrl()}/heritage`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(heritageUrl)}`;

    return (
      <div className="rounded-2xl border-2 border-[#065f46]/30 bg-emerald-50/40 p-6 sm:p-10 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-[#065f46]" aria-hidden />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-primary mb-2">
          History Preserved. Shukran, {successData.contributorName}.
        </h2>
        <p className="text-primary/90 mb-6">
          Your contribution to the Taliep &amp; Rakiep lineage has been safely uploaded to the Al-Ameen Archive.
        </p>

        {successData.imageUrl && (
          <div className="rounded-xl border-2 border-[#065f46]/30 bg-secondary/60 overflow-hidden mb-6 aspect-[4/3] max-h-48 mx-auto">
            <img
              src={successData.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <p className="text-xs text-primary/70 py-2 px-3 bg-[#065f46]/5">
              Your photo is being stamped with the Al-Ameen Seal—it will look like this once branding is complete.
            </p>
          </div>
        )}

        <div className="text-left bg-secondary/50 rounded-xl border border-[#065f46]/20 p-4 sm:p-5 mb-6">
          <p className="font-semibold text-primary mb-2">What happens next?</p>
          <ul className="text-sm text-primary/90 space-y-2 list-none">
            <li><strong>Verification:</strong> Our team (the descendants of Asia Taliep) will review the details to ensure the lineage is accurate.</li>
            <li><strong>Branding:</strong> Your photo is being &ldquo;stamped&rdquo; with the Al-Ameen Seal—preserving our shared heritage wherever it is shared.</li>
            <li><strong>The Tree:</strong> Your branch will soon be added to the living Taliep and Rakiep family tree.</li>
          </ul>
          <p className="mt-3 text-sm text-primary/90 border-t border-[#065f46]/20 pt-3">
            <strong>The Legacy Lock:</strong> We&apos;ve baked the history of Imam Mogamat Talaabodien (Ou Bappa) and the spirit of District Six into the digital DNA of your upload.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-[#1877f2] text-white px-5 py-3 font-medium hover:bg-[#166fe5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2] focus-visible:ring-offset-2"
          >
            Share the Archive on Facebook
          </a>
          <Link
            to="/heritage#digital-majlis-heading"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#065f46] text-[#065f46] bg-transparent px-5 py-3 font-medium hover:bg-[#065f46]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#065f46] focus-visible:ring-offset-2"
          >
            View the Digital Majlis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => { setSuccess(false); setSuccessData(null); }}
          className="text-[#065f46] font-semibold hover:underline text-sm"
        >
          Submit another story
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-[#065f46]/30 bg-secondary p-6 sm:p-8 space-y-6">
      {/* Archive Covenant — commands respect */}
      <div className="rounded-r-xl border-l-4 border-emerald-600 bg-emerald-50/50 p-4 sm:p-5 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-primary mb-2 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden />
          {COVENANT.title}
        </h3>
        <ul className="text-primary/85 text-sm space-y-1 list-disc list-inside">
          {COVENANT.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-primary/80 border-t border-emerald-600/20 pt-3">
          <strong>Elders:</strong> You can send a WhatsApp voice note with the details—a family member can add it to the archive for you.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block font-medium text-primary mb-1">Your name</span>
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
            placeholder="e.g. Fatima"
          />
        </label>
        <label className="block">
          <span className="block font-medium text-primary mb-1">Ancestor name & approximate dates</span>
          <input
            type="text"
            value={ancestorName}
            onChange={(e) => setAncestorName(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
            placeholder="e.g. Hajjah Amina Taliep (1890s–1940)"
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="block font-medium text-primary mb-1">Email address</span>
        <input
          type="email"
          value={contributorEmail}
          onChange={(e) => setContributorEmail(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
          placeholder="your@email.com"
          required
        />
        <p className="mt-1 text-xs text-primary/60">
          We&apos;ll only use this to notify you when your story is approved and added to the archive.
        </p>
      </label>

      <label className="block">
        <span className="block font-medium text-primary mb-1">Your relation</span>
        <input
          type="text"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
          placeholder='e.g. Great-Great Granddaughter of Asia Taliep (Oemie)'
        />
      </label>

      <label className="block">
        <span className="block font-medium text-primary mb-1">Lineage branch (optional)</span>
        <select
          value={lineageBranch}
          onChange={(e) => setLineageBranch(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
          aria-describedby="lineage-branch-desc"
        >
          <option value="">Select branch (optional)</option>
          <option value="Taliep">Taliep</option>
          <option value="Rakiep">Rakiep</option>
        </select>
        <p id="lineage-branch-desc" className="mt-1 text-xs text-primary/60">
          We focus on discovering the specific branches of the Taliep and Rakiep families.
        </p>
      </label>

      {/* Parent in tree — prominent for elders and tree building */}
      <div className="rounded-xl border-2 border-[#065f46]/30 bg-emerald-50/30 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-primary">Who is this ancestor&apos;s parent in the family tree?</span>
          <button
            type="button"
            onClick={() => setShowParentHelp(!showParentHelp)}
            className="text-[#065f46] hover:text-[#065f46]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#065f46] rounded-full p-0.5"
            aria-label="Help"
            title={PARENT_HELP}
          >
            <HelpCircle className="w-4 h-4" aria-hidden />
          </button>
        </div>
        {showParentHelp && (
          <p className="text-sm text-primary/80 mb-2 bg-secondary/60 rounded-lg px-3 py-2 border-l-2 border-[#065f46]">
            {PARENT_HELP}
          </p>
        )}
        <p className="text-xs text-primary/60 mb-2">Start with Imam Mogamat Talaabodien (Ou Bappa), Imam Achmat (Bappa), or Asia Taliep (Oemie) if this ancestor is their child or descendant.</p>
        <input
          type="text"
          value={parentSearch}
          onChange={(e) => setParentSearch(e.target.value)}
          onFocus={() => {
            if (!parentSearch && parentId) setParentSearch(parentOptions.find((o) => o.id === parentId)?.ancestor_name ?? "");
          }}
          placeholder={parentId ? undefined : "Search or select parent…"}
          className="w-full rounded-lg border border-[#065f46]/30 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46] mb-1"
          aria-describedby="parent-list-desc"
        />
        <div id="parent-list-desc" className="rounded-lg border border-[#065f46]/20 bg-secondary max-h-40 overflow-y-auto">
          <button
            type="button"
            onClick={() => { setParentId(""); setParentSearch("— None —"); }}
            className={`w-full text-left px-3 py-2 text-sm ${!parentId ? "bg-[#065f46]/15 text-[#065f46] font-medium" : "text-primary/90"}`}
          >
            — None — (root of tree)
          </button>
          {parentOptions
            .filter((o) => !parentSearch.trim() || o.ancestor_name.toLowerCase().includes(parentSearch.trim().toLowerCase()))
            .map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setParentId(o.id); setParentSearch(o.ancestor_name); }}
                className={`w-full text-left px-3 py-2 text-sm border-t border-primary/10 ${parentId === o.id ? "bg-[#065f46]/15 text-[#065f46] font-medium" : "text-primary/90"}`}
              >
                {o.ancestor_name}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block font-medium text-primary mb-1">Birth year (optional)</span>
          <input
            type="number"
            min="1700"
            max="2030"
            step="1"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
            placeholder="e.g. 1890"
          />
        </label>
        <label className="block">
          <span className="block font-medium text-primary mb-1">Death year (optional)</span>
          <input
            type="number"
            min="1700"
            max="2030"
            step="1"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
            placeholder="e.g. 1940"
          />
        </label>
      </div>

      <label className="block">
        <span className="block font-medium text-primary mb-1">Where is this ancestor resting?</span>
        <input
          type="text"
          value={restingPlace}
          onChange={(e) => setRestingPlace(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
          placeholder="e.g. Mowbray Qabristan, Tuan Guru Kramat"
        />
        <p className="mt-1 text-xs text-primary/60">Kramats, Qabristans, or other resting places elders may remember.</p>
      </label>

      <label className="block">
        <span className="block font-medium text-primary mb-1">What was their maiden name?</span>
        <input
          type="text"
          value={maidenName}
          onChange={(e) => setMaidenName(e.target.value)}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
          placeholder="Helps track maternal lines"
        />
      </label>

      <label className="block">
        <span className="block font-medium text-primary mb-1">The narrative</span>
        <textarea
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-primary/20 bg-secondary px-3 py-2 text-primary focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46] resize-y"
          placeholder="Share your family story…"
          required
        />
      </label>

      <div>
        <span className="block font-medium text-primary mb-1">Upload proof (optional)</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-primary/80 file:mr-3 file:rounded file:border-0 file:bg-[#065f46]/10 file:px-3 file:py-2 file:text-[#065f46] file:font-medium"
        />
      </div>

      {(imageFile || true) && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentArchive}
            onChange={(e) => setConsentArchive(e.target.checked)}
            className="mt-1 rounded border-primary/30 text-[#065f46] focus:ring-[#065f46]"
          />
          <span className="text-sm text-primary/90">
            {PRIVACY_COVENANT_LABEL}
          </span>
        </label>
      )}

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto btn-primary px-8 py-3.5 min-h-[48px] font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit to the Archive"}
      </button>
    </form>
  );
}
