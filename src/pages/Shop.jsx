import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/supabase";
import { COLLECTION_PRODUCTS } from "../data/collection";

export default function Shop() {
  const [products, setProducts] = useState(COLLECTION_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts()
      .then((list) => {
        if (cancelled) return;
        if (list && list.length > 0) setProducts(list);
      })
      .catch(() => {
        if (!cancelled) setProducts(COLLECTION_PRODUCTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Shop the Collection"
        description="Premium Islamic headwear: Azhari caps, Na'lain caps, Syrian Shami, Fez, and more. Kufi hats, toppies, and traditional Muslim headwear in South Africa."
        url="/shop"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Shop", url: null }]}
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="font-serif text-3xl font-semibold text-primary mb-10">Shop the Collection</h1>
        {loading ? (
          <p className="text-primary/70">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-primary/70">No products yet. Add items in Supabase or check your connection.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
