/**
 * Digital Majlis — Taliep Lineage Archive. Masonry-style wall, Founder's Spotlight anchor,
 * Verified badge, Share a Memory. Emerald (#065f46) for all interaction icons.
 */
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageCircle, ShieldCheck, Crown, TreePine, Sparkles } from "lucide-react";
import {
  getApprovedMajlis,
  subscribeMajlis,
  getMajlisComments,
  insertMajlisComment,
} from "../lib/supabase";

const IMAGE_FILTERS = {
  none: "",
  sepia: "sepia(0.6) contrast(0.95)",
  contrast: "contrast(1.2) saturate(0.9)",
};

function MajlisCard({ post }) {
  const isAnchor = false;
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [imageFilter, setImageFilter] = useState("sepia");
  const contributorName = post.contributor_name ?? post.user_name;
  const lineageBranch = post.lineage_branch ?? post.family_branch;
  const isVerified = post.is_verified ?? post.is_verified_lineage;
  const isCustodian = post.is_custodian === true;
  const isAdminPost = post.is_admin_post === true;

  useEffect(() => {
    if (!expanded || !post?.id || isAnchor) return;
    let cancelled = false;
    getMajlisComments(post.id).then((list) => {
      if (!cancelled) setComments(list);
    });
    return () => { cancelled = true; };
  }, [expanded, post?.id]);

  const handleShareMemory = async (e) => {
    e.preventDefault();
    if (isAnchor || !post?.id) return;
    setCommentError("");
    const name = commentName.trim();
    const body = commentBody.trim();
    if (!name || !body) {
      setCommentError("Name and message are required.");
      return;
    }
    setCommentSubmitting(true);
    const result = await insertMajlisComment(post.id, name, body);
    if (result.error) {
      setCommentError(result.error);
      setCommentSubmitting(false);
      return;
    }
    setCommentName("");
    setCommentBody("");
    const updated = await getMajlisComments(post.id);
    setComments(updated);
    setCommentSubmitting(false);
  };

  const filterStyle = IMAGE_FILTERS[imageFilter] ? { filter: IMAGE_FILTERS[imageFilter] } : undefined;

  return (
    <article
      className={`bg-secondary rounded-2xl border-2 overflow-hidden shadow-premium flex flex-col ${
        isAdminPost
          ? "border-emerald-500/40 shadow-emerald-200/20 ring-1 ring-emerald-400/30"
          : isCustodian
            ? "border-amber-400/60 shadow-amber-200/20 ring-1 ring-amber-300/30"
            : "border-[#065f46]/20"
      }`}
      aria-labelledby={`majlis-name-${post.id}`}
    >
      {/* Framed portrait: image */}
      <div className="relative aspect-[4/3] bg-primary/10">
        {post.image_url ? (
          <>
            <img
              src={post.image_url}
              alt={post.seo_alt_text || `Historical photo: ${post.ancestor_name}`}
              className="w-full h-full object-cover"
              style={filterStyle}
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              {["none", "sepia", "contrast"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setImageFilter(key)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    imageFilter === key
                      ? "bg-[#065f46] text-white"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                  aria-label={`Filter: ${key === "none" ? "Original" : key}`}
                >
                  {key === "none" ? "Original" : key === "sepia" ? "Sepia" : "Contrast"}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-primary/40 font-serif text-sm"
            aria-hidden
          >
            No photo
          </div>
        )}
        {isAdminPost && (
          <div
            className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-emerald-700 text-white px-2 py-1 text-xs font-medium shadow"
            title="Spotlight: In remembrance of our roots"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden />
            <span>Spotlight</span>
          </div>
        )}
        {(isVerified || post.is_verified_lineage) && (
          <div
            className={`absolute top-2 inline-flex items-center gap-1 rounded-md bg-[#065f46] text-white px-2 py-1 text-xs font-medium ${isAdminPost ? 'right-2' : 'left-2'}`}
            title="Verified"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden />
            <span>Verified</span>
          </div>
        )}
        {isCustodian && !isAdminPost && (
          <div
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-amber-500 text-white px-2 py-1 text-xs font-medium shadow-md"
            title="Custodian of the Thread: This contributor has provided verified links to the Tuan Guru lineage."
          >
            <Crown className="w-3.5 h-3.5 text-white" aria-hidden />
            <span>Custodian</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 id={`majlis-name-${post.id}`} className="font-serif text-xl font-semibold text-primary">
          {post.ancestor_name}
        </h3>
        {(post.approximate_dates || post.relation) && (
          <p className="text-primary/70 text-sm mt-0.5">
            {[post.approximate_dates, post.relation].filter(Boolean).join(" · ")}
          </p>
        )}
        {(lineageBranch || post.family_branch) && (
          <p className="text-[#065f46] text-xs font-medium mt-1">{lineageBranch || post.family_branch}</p>
        )}

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1 text-[#065f46] font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#065f46] rounded"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" aria-hidden /> Hide story
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" aria-hidden /> Read story
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-primary/10 space-y-4">
            <p className="text-primary/90 leading-relaxed whitespace-pre-wrap">{post.story_text}</p>
            <p className="text-primary/60 text-sm inline-flex items-center gap-1.5 flex-wrap">
              Shared by {contributorName}
              {isCustodian && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-xs font-medium"
                  title="Custodian of the Thread: This contributor has provided verified links to the Tuan Guru lineage."
                >
                  <Crown className="w-3 h-3" aria-hidden />
                  Custodian of the Thread
                </span>
              )}
            </p>

            {/* Share a Memory — only for non-anchor posts */}
            {!isAnchor && (
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold text-primary flex items-center gap-1">
                <MessageCircle className="w-4 h-4" aria-hidden />
                Share a Memory
              </h4>
              {comments.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {comments.map((c) => (
                    <li key={c.id} className="pl-3 border-l-2 border-[#065f46]/30">
                      <span className="font-medium text-primary">{c.author_name}</span>
                      <span className="text-primary/60"> · {new Date(c.created_at).toLocaleDateString()}</span>
                      <p className="text-primary/85 mt-0.5">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleShareMemory} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  className="rounded border border-primary/20 bg-secondary px-3 py-2 text-primary text-sm focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
                  disabled={commentSubmitting}
                />
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Share a memory or reply…"
                  rows={2}
                  className="rounded border border-primary/20 bg-secondary px-3 py-2 text-primary text-sm resize-y focus:border-[#065f46] focus:ring-1 focus:ring-[#065f46]"
                  disabled={commentSubmitting}
                />
                {commentError && (
                  <p className="text-red-600 text-xs" role="alert">{commentError}</p>
                )}
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="self-start px-4 py-2 rounded-lg bg-[#065f46] text-white text-sm font-medium hover:bg-[#065f46]/90 disabled:opacity-60"
                >
                  {commentSubmitting ? "Sending…" : "Post memory"}
                </button>
              </form>
            </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function MajlisWall() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Admin post (Tana Baru Spotlight) first; hide root from wall. Imam Mogamat Talaabodien (Ou Bappa) first among lineage. */
  const wallPosts = (() => {
    const excluded = [
      "Tuan Guru",
      "Imam Abdurahman Matebe Shah",
      "Imam Abdullah Kadi Abdus Salaam (Tuan Guru)",
    ];
    const filtered = posts.filter((p) => !excluded.includes((p.ancestor_name || "").trim()));
    const firstAncestorName = (p) => (p.ancestor_name || "").trim();
    const isOuBappa = (p) => firstAncestorName(p) === "Imam Mogamat Talaabodien (Ou Bappa)" || firstAncestorName(p) === "Imam Talaboedien";
    return [...filtered].sort((a, b) => {
      const aAdmin = a.is_admin_post === true;
      const bAdmin = b.is_admin_post === true;
      if (aAdmin && !bAdmin) return -1;
      if (!aAdmin && bAdmin) return 1;
      if (isOuBappa(a) && !isOuBappa(b)) return -1;
      if (!isOuBappa(a) && isOuBappa(b)) return 1;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });
  })();

  const fetchPosts = async () => {
    const list = await getApprovedMajlis();
    setPosts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const unsub = subscribeMajlis((list) => {
      setPosts(list);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 [column-gap:1.5rem]">
        {[1, 2].map((i) => (
          <div key={i} className="break-inside-avoid mb-6 rounded-2xl border-2 border-primary/10 bg-secondary/50 aspect-[3/4] animate-pulse" aria-hidden />
        ))}
      </div>
    );
  }

  if (wallPosts.length === 0) {
    return (
      <div
        className="min-h-[320px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200/60 bg-emerald-50/30 relative overflow-hidden"
        aria-label="The wall is waiting for contributions"
      >
        {/* Subtle Na'lain-style geometric pattern */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="majlis-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L22 8L20 16L18 8z M0 20L8 22L16 20L8 18z" fill="currentColor" className="text-emerald-800" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#majlis-pattern)" />
          </svg>
        </div>
        <TreePine className="w-16 h-16 text-emerald-300/80 mb-4 relative z-10" aria-hidden />
        <p className="font-serif text-lg text-primary/80 text-center max-w-sm px-4 relative z-10">
          The wall is waiting. Submit your ancestor&apos;s story—once verified, their photo and story will appear here for the family to see.
        </p>
        <p className="text-sm text-primary/60 text-center mt-2 relative z-10">
          Six generations from Tuan Guru to Asia Taliep (Oemie). Your branch belongs here.
        </p>
      </div>
    );
  }

  const firstAncestorName = (p) => (p.ancestor_name || "").trim();
  const isOuBappaCard = (p) =>
    firstAncestorName(p) === "Imam Mogamat Talaabodien (Ou Bappa)" || firstAncestorName(p) === "Imam Talaboedien";

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 [column-gap:1.5rem]">
      {wallPosts.map((post) => (
        <div key={post.id} id={isOuBappaCard(post) ? "ou-bappa" : undefined} className={`break-inside-avoid mb-6 ${isOuBappaCard(post) ? "scroll-mt-24" : ""}`}>
          <MajlisCard post={post} />
        </div>
      ))}
    </div>
  );
}
