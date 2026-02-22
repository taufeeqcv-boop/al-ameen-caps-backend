import React, { useEffect, useState, useMemo, useRef } from "react";
import { supabase, getAllVariants, updateVariantStock, updateProductStock, insertVariant } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import { Loader2, Plus, Pencil, Image as ImageIcon, Database, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { COLLECTION_PRODUCTS } from "../../data/collection";

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const lowStockOnly = searchParams.get("low_stock") === "1";
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
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
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [updatingVariantId, setUpdatingVariantId] = useState(null);
  const [addVariantProductId, setAddVariantProductId] = useState(null);
  const [addVariantForm, setAddVariantForm] = useState({ sku: "", size: "", color: "", stock_quantity: "0", price_adjustment: "0" });
  const [savingVariant, setSavingVariant] = useState(false);
  const [updatingProductStockId, setUpdatingProductStockId] = useState(null);
  const variantStockInputRefs = useRef({});

  const variantsByProductId = useMemo(() => {
    const map = {};
    for (const v of variants) {
      const pid = v.product_id;
      if (!map[pid]) map[pid] = [];
      map[pid].push(v);
    }
    return map;
  }, [variants]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("site_settings").select("value").eq("key", "low_stock_threshold").maybeSingle()
      .then(({ data }) => {
        const v = data?.value;
        const n = Math.max(0, parseInt(v, 10));
        if (!Number.isNaN(n)) setLowStockThreshold(n);
      })
      .catch(() => {});
  }, []);

  const displayProducts = useMemo(() => {
    if (!lowStockOnly) return products;
    return products.filter((p) => {
      const productVariants = variantsByProductId[p.id] ?? [];
      const totalStock = productVariants.length > 0
        ? productVariants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
        : (Number(p.stock_quantity) ?? 0);
      return totalStock < lowStockThreshold;
    });
  }, [products, variantsByProductId, lowStockOnly, lowStockThreshold]);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const [productsRes, variantsList] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      getAllVariants(),
    ]);
    if (productsRes.error) setError(productsRes.error.message);
    else setProducts(productsRes.data ?? []);
    setVariants(Array.isArray(variantsList) ? variantsList : []);
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

  /** Populate Inventory from frontend collection; missing quantity becomes 0. Image stored as relative path so it works in any environment. */
  const seedFromCollection = async () => {
    if (!supabase || !COLLECTION_PRODUCTS?.length) return;
    setSeeding(true);
    setError(null);
    setSeedMessage(null);
    const rows = COLLECTION_PRODUCTS.map((item) => ({
      sku: String(item.id ?? "").trim() || `sku-${item.name?.slice(0, 20)}`,
      name: String(item.name ?? "").trim() || "Unnamed",
      description: item.description?.trim() || null,
      price: Number(item.price) || 0,
      stock_quantity: Math.max(0, Number(item.quantityAvailable) || 0),
      image_url: item.imageURL ? (item.imageURL.startsWith("/") ? item.imageURL : `/${item.imageURL}`) : null,
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams(lowStockOnly ? {} : { low_stock: "1" })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${lowStockOnly ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white border-secondary/40 text-primary hover:bg-secondary/20"}`}
          >
            <Package className="w-4 h-4" />
            Low stock only (&lt; {lowStockThreshold})
          </button>
          {lowStockOnly && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="px-3 py-2 rounded-lg text-sm text-primary/70 hover:bg-secondary/20"
            >
              Show all
            </button>
          )}
          <div className="w-px h-8 bg-secondary/30 hidden sm:block" />
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
      </div>
      {seedMessage && (
        <div className="rounded-lg bg-green-50 text-green-800 p-4 text-sm">{seedMessage}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 p-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-premium border border-amber-700/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-secondary/90 text-sm border-b-2 border-amber-600/50">
                <th className="px-4 py-3 font-medium w-10" aria-label="Expand" />
                <th className="px-6 py-3 font-medium w-20">Image</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Total Stock</th>
                <th className="px-6 py-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((p) => {
                const productVariants = variantsByProductId[p.id] ?? [];
                const totalStock = productVariants.length > 0
                  ? productVariants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
                  : (Number(p.stock_quantity) ?? 0);
                const isExpanded = expandedProductId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className="border-t border-secondary/20 hover:bg-secondary/10"
                    >
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => setExpandedProductId((id) => (id === p.id ? null : p.id))}
                          className="p-1 rounded hover:bg-amber-100 text-primary border border-transparent hover:border-amber-600/30"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </td>
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
                      <td className="px-6 py-3 text-primary">{totalStock}</td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-sm hover:underline"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-variants`} className="bg-amber-50/40 border-t-2 border-amber-700/20">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="pl-8 space-y-3">
                            <p className="text-sm font-semibold text-primary border-b border-amber-700/30 pb-1">
                              {productVariants.length === 0 ? "Stock (no variants)" : "Variants — Size | Colour | Stock"}
                            </p>
                            {productVariants.length === 0 ? (
                              <div className="flex flex-wrap items-center gap-3 py-2">
                                <label className="text-sm text-primary/80">Default stock:</label>
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={p.stock_quantity ?? 0}
                                  id={`product-stock-${p.id}`}
                                  className="w-24 border-2 border-amber-700/30 rounded-lg px-3 py-1.5 text-primary bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const input = document.getElementById(`product-stock-${p.id}`);
                                    const val = input?.value ?? "";
                                    setUpdatingProductStockId(p.id);
                                    setError(null);
                                    const { error: err } = await updateProductStock(p.id, val);
                                    if (err) setError(err);
                                    else await fetchProducts();
                                    setUpdatingProductStockId(null);
                                  }}
                                  disabled={updatingProductStockId === p.id}
                                  className="px-4 py-1.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 flex items-center gap-1 border border-amber-800"
                                >
                                  {updatingProductStockId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                  Save
                                </button>
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {productVariants.map((v) => (
                                  <li
                                    key={v.id}
                                    className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-lg bg-white border-2 border-amber-700/20 shadow-sm"
                                  >
                                    <span className="text-sm font-mono font-medium text-primary w-32">{v.sku}</span>
                                    <span className="text-sm text-primary/80">Size: {v.size ?? "—"}</span>
                                    <span className="text-sm text-primary/80">Colour: {v.color ?? "—"}</span>
                                    <span className="flex items-center gap-2">
                                      <label className="text-xs text-primary/60">Stock</label>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={v.stock_quantity ?? 0}
                                        ref={(el) => { variantStockInputRefs.current[v.id] = el; }}
                                        className="w-20 border-2 border-amber-700/30 rounded px-2 py-1 text-sm text-primary focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
                                      />
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const input = variantStockInputRefs.current[v.id];
                                          const val = input?.value ?? "";
                                          setUpdatingVariantId(v.id);
                                          setError(null);
                                          const { error: err } = await updateVariantStock(v.id, val);
                                          if (err) setError(err);
                                          else await fetchProducts();
                                          setUpdatingVariantId(null);
                                        }}
                                        disabled={updatingVariantId === v.id}
                                        className="px-3 py-1 bg-amber-700 text-white rounded text-sm font-medium hover:bg-amber-800 disabled:opacity-50 flex items-center gap-1 border border-amber-800"
                                      >
                                        {updatingVariantId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Save
                                      </button>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {addVariantProductId === p.id ? (
                              <div className="mt-4 p-4 rounded-xl bg-white border-2 border-amber-700/40 shadow-md space-y-3 max-w-lg">
                                <p className="text-sm font-semibold text-primary text-amber-900">Add new variant</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="SKU (e.g. NALAIN-BLK-58)"
                                    value={addVariantForm.sku}
                                    onChange={(e) => setAddVariantForm((f) => ({ ...f, sku: e.target.value }))}
                                    className="border-2 border-amber-700/30 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-amber-500/30"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Size"
                                    value={addVariantForm.size}
                                    onChange={(e) => setAddVariantForm((f) => ({ ...f, size: e.target.value }))}
                                    className="border-2 border-amber-700/30 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-amber-500/30"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Colour"
                                    value={addVariantForm.color}
                                    onChange={(e) => setAddVariantForm((f) => ({ ...f, color: e.target.value }))}
                                    className="border-2 border-amber-700/30 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-amber-500/30"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Stock"
                                    value={addVariantForm.stock_quantity}
                                    onChange={(e) => setAddVariantForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                                    className="border-2 border-amber-700/30 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-amber-500/30"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price adjustment (R)"
                                    value={addVariantForm.price_adjustment}
                                    onChange={(e) => setAddVariantForm((f) => ({ ...f, price_adjustment: e.target.value }))}
                                    className="border-2 border-amber-700/30 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-amber-500/30 col-span-2"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!addVariantForm.sku.trim()) return;
                                      setSavingVariant(true);
                                      setError(null);
                                      const result = await insertVariant({
                                        product_id: p.id,
                                        sku: addVariantForm.sku.trim(),
                                        size: addVariantForm.size.trim() || null,
                                        color: addVariantForm.color.trim() || null,
                                        stock_quantity: addVariantForm.stock_quantity,
                                        price_adjustment: addVariantForm.price_adjustment,
                                      });
                                      setSavingVariant(false);
                                      if (result.error) setError(result.error);
                                      else {
                                        setAddVariantProductId(null);
                                        setAddVariantForm({ sku: "", size: "", color: "", stock_quantity: "0", price_adjustment: "0" });
                                        await fetchProducts();
                                      }
                                    }}
                                    disabled={savingVariant || !addVariantForm.sku.trim()}
                                    className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 flex items-center gap-1 border border-amber-800"
                                  >
                                    {savingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Save variant
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddVariantProductId(null);
                                      setAddVariantForm({ sku: "", size: "", color: "", stock_quantity: "0", price_adjustment: "0" });
                                    }}
                                    className="px-4 py-2 border-2 border-amber-700/50 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddVariantProductId(p.id);
                                  setAddVariantForm({ sku: "", size: "", color: "", stock_quantity: "0", price_adjustment: "0" });
                                }}
                                className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-amber-700 text-white border-2 border-amber-800 rounded-lg text-sm font-semibold hover:bg-amber-800 shadow-sm"
                              >
                                <Plus className="w-4 h-4" />
                                Add variant
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="px-6 py-8 text-center text-primary/60">
            {lowStockOnly ? "No products below the low-stock threshold. Show all to see full inventory." : "No products. Add one to get started."}
          </p>
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
