/**
 * The Living Tree — hierarchical list of approved heritage_majlis entries (parent_id).
 * Future Phase: Full SVG rendering of the family tree picture.
 */
import { useState, useEffect } from "react";
import { getApprovedMajlis } from "../lib/supabase";

function buildTree(items) {
  if (!Array.isArray(items)) return [];
  const byId = new Map(items.map((o) => [o.id, { ...o, children: [] }]));
  const roots = [];
  for (const item of byId.values()) {
    const parentId = item.parent_id ?? null;
    const node = byId.get(item.id);
    if (!node) continue;
    if (!parentId || !byId.has(parentId)) {
      roots.push(node);
    } else {
      const parent = byId.get(parentId);
      if (parent) parent.children.push(node);
    }
  }
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      const ay = a.birth_year ?? 9999;
      const by = b.birth_year ?? 9999;
      if (ay !== by) return ay - by;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

function TreeNode({ node, depth = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const by = node.birth_year;
  const dy = node.death_year;
  const years =
    by != null || dy != null
      ? ` (${by != null ? by : "?"}${dy != null ? ` – ${dy}` : ""})`
      : "";
  const imgUrl = node.image_url || null;
  const showImg = imgUrl && !imgFailed;

  return (
    <li className="list-none">
      <div
        className="py-1.5 border-l-2 border-[#065f46]/30 pl-4 hover:bg-primary/5 flex items-center gap-3"
        style={{ marginLeft: `${depth * 1.25}rem` }}
      >
        {showImg && (
          <img
            src={imgUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-[#065f46]/20 flex-shrink-0"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <div>
          <span className="font-serif font-medium text-primary">{node.ancestor_name}</span>
          {years && <span className="text-primary/70 text-sm">{years}</span>}
          {node.lineage_branch && (
            <span className="ml-2 text-xs text-[#065f46] font-medium">{node.lineage_branch}</span>
          )}
        </div>
      </div>
      {node.children?.length > 0 && (
        <ul className="mt-0">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function LivingTree() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedMajlis().then((list) => {
      const forTree = Array.isArray(list) ? list.filter((p) => p.is_admin_post !== true) : [];
      setItems(forTree);
      setLoading(false);
    });
  }, []);

  const tree = buildTree(items);

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-[#065f46]/20 bg-secondary/50 p-6 animate-pulse">
        <p className="text-primary/60">Loading the tree…</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <p className="text-primary/70">
        No entries yet. Submit an ancestor above — once approved, they will appear here.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#065f46]/20 bg-secondary p-6">
      <ul className="space-y-0">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </ul>
      {/* Future Phase: Full SVG rendering of the family tree picture. */}
    </div>
  );
}
