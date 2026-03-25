import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { COLLECTION_PRODUCTS } from "../data/collection";
import { Search } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...[...new Set(COLLECTION_PRODUCTS.map((p) => p.category).filter(Boolean))].sort().map((c) => ({ value: c, label: c })),
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearchChange(value) {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    let list = COLLECTION_PRODUCTS;
    if (categoryFilter) {
      list = list.filter((p) => (p.category || "") === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Shop – Kufi, Fez, Taj, Turban, Rumal"
        description="Buy kufi, fez, taj, turban, Rumal, Nalain cap, Azhari cap. Islamic fashion, South Africa. Cape Town, Durban, Johannesburg, PE. Western Cape, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville."
        url="/shop"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Shop", url: null }]}
        itemListProducts={COLLECTION_PRODUCTS}
        localBusiness
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[var(--site-header-offset)] pb-24" role="main">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-primary mb-2 leading-tight">
            Inaugural Collection
          </h1>
          <p className="text-lg text-primary/70 font-serif">
            Kufi, Fez, Taj, Turban
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" aria-hidden />
            <input
              id="shop-search"
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or category…"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-primary/10 rounded-lg text-primary placeholder-primary/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </div>
          <label htmlFor="shop-category" className="sr-only">Filter by category</label>
          <select
            id="shop-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="sm:w-48 px-4 py-2.5 border-2 border-primary/10 rounded-lg text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-secondary"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" role="list">
          {filtered.map((p, i) => (
            <ProductCard key={p.sku ?? p.id ?? i} product={p} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-primary/70 mb-4">No products match your search. Try a different term or category.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("");
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next, { replace: true });
              }}
              className="btn-outline-contrast px-6 py-2.5 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
