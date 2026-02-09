import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { Loader2, Plus, Pencil, Image as ImageIcon, Database } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { COLLECTION_PRODUCTS } from "../../data/collection";

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    sku: "",
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState(null);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error: e } = await supabase
      .from("products")
      .select("*")
      .order("name");
    if (e) setError(e.message);
    else setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editId && products.length) {
      const p = products.find((x) => String(x.id) === editId);
      if (p) {
        setForm({
          id: p.id,
          sku: p.sku ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          stock_quantity: String(p.stock_quantity ?? ""),
          image_url: p.image_url ?? "",
          is_active: p.is_active !== false,
        });
        setFormOpen(true);
      }
    }
  }, [editId, products]);

  const openNew = () => {
    setForm({
      id: null,
      sku: "",
      name: "",
      description: "",
      price: "",
      stock_quantity: "0",
      image_url: "",
      is_active: true,
    });
    setImageFile(null);
    setFormOpen(true);
    setSearchParams({});
  };

  const openEdit = (p) => {
    setForm({
      id: p.id,
      sku: p.sku ?? "",
      name: p.name ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      stock_quantity: String(p.stock_quantity ?? ""),
      image_url: p.image_url ?? "",
      is_active: p.is_active !== false,
    });
    setImageFile(null);
    setFormOpen(true);
    setSearchParams({ edit: p.id });
  };

  const closeForm = () => {
    setFormOpen(false);
    setSearchParams({});
  };

  /** Populate Inventory from frontend collection; missing quantity becomes 0 */
  const seedFromCollection = async () => {
    if (!supabase || !COLLECTION_PRODUCTS?.length) return;
    setSeeding(true);
    setError(null);
    setSeedMessage(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const rows = COLLECTION_PRODUCTS.map((item) => ({
      sku: String(item.id ?? "").trim() || `sku-${item.name?.slice(0, 20)}`,
      name: String(item.name ?? "").trim() || "Unnamed",
      description: item.description?.trim() || null,
      price: Number(item.price) || 0,
      stock_quantity: Math.max(0, Number(item.quantityAvailable) ?? 0),
      image_url: item.imageURL ? `${origin}${item.imageURL.startsWith("/") ? "" : "/"}${item.imageURL}` : null,
      is_active: true,
    }));
    const { error: e } = await supabase.from("products").upsert(rows, { onConflict: "sku" });
    if (e) {
      setError(e.message);
      setSeedMessage(null);
    } else {
      setSeedMessage(`Seeded ${rows.length} products (missing quantities set to 0).`);
      await fetchProducts();
    }
    setSeeding(false);
  };

  const uploadImage = async () => {
    if (!imageFile || !supabase) return null;
    const ext = imageFile.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: e } = await supabase.storage.from("products").upload(path, imageFile, { upsert: false });
    if (e) {
      setError(e.message);
      return null;
    }
    const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  };

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    let imageUrl = form.image_url;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        setSaving(false);
        return;
      }
    }
    const payload = {
      sku: form.sku.trim() || null,
      name: form.name.trim() || null,
      description: form.description.trim() || null,
      price: form.price ? parseFloat(form.price) : 0,
      stock_quantity: form.stock_quantity !== "" ? parseInt(form.stock_quantity, 10) : 0,
      image_url: imageUrl || null,
      is_active: form.is_active,
    };
    if (form.id) {
      const { error: e } = await supabase.from("products").update(payload).eq("id", form.id);
      if (e) setError(e.message);
      else { await fetchProducts(); closeForm(); }
    } else {
      if (!payload.sku || !payload.name) {
        setError("SKU and Name are required.");
        setSaving(false);
        return;
      }
      const { error: e } = await supabase.from("products").insert(payload);
      if (e) setError(e.message);
      else { await fetchProducts(); closeForm(); }
    }
    setSaving(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Inventory</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={seedFromCollection}
            disabled={seeding || !COLLECTION_PRODUCTS?.length}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-secondary/60 text-primary rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            Seed from collection
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-medium hover:bg-accent-light"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>
      {seedMessage && (
        <div className="rounded-lg bg-green-50 text-green-800 p-4 text-sm">{seedMessage}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-premium border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-primary/80 text-sm">
                <th className="px-6 py-3 font-medium w-20">Image</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-secondary/20">
                  <td className="px-6 py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-14 h-14 object-cover rounded border border-secondary/30" />
                    ) : (
                      <div className="w-14 h-14 rounded border border-secondary/30 bg-secondary/20 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary/40" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-primary font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-primary">{formatPrice(p.price)}</td>
                  <td className="px-6 py-3 text-primary">{p.stock_quantity}</td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1 text-accent hover:underline text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">No products. Add one to get started.</p>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary/20">
              <h2 className="font-serif text-xl font-semibold text-primary">
                {form.id ? "Edit Product" : "Add Product"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-full border border-secondary/40 rounded-lg px-3 py-2 text-primary"
                  placeholder="e.g. CAP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-secondary/40 rounded-lg px-3 py-2 text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-secondary/40 rounded-lg px-3 py-2 text-primary min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full border border-secondary/40 rounded-lg px-3 py-2 text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                    className="w-full border border-secondary/40 rounded-lg px-3 py-2 text-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-primary"
                />
                {form.image_url && !imageFile && (
                  <img src={form.image_url} alt="" className="mt-2 w-24 h-24 object-cover rounded border" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-secondary/40"
                />
                <label htmlFor="is_active" className="text-sm text-primary">Active (visible in shop)</label>
              </div>
            </div>
            <div className="p-6 border-t border-secondary/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-secondary/40 rounded-lg text-primary hover:bg-secondary/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-accent text-primary rounded-lg font-medium hover:bg-accent-light disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
