import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { getProducts, normalizeImageUrl } from "../lib/supabase";
import { COLLECTION_PRODUCTS } from "../data/collection";

// Always display from collection so images never disappear. Only overlay price/quantity from API.
function buildDisplayList(apiList) {
  const list = Array.isArray(apiList) ? apiList : [];
  return COLLECTION_PRODUCTS.map((c) => {
    const fromApi = list.find((p) => p.id === c.id || p.sku === c.id);
    const imageURL = normalizeImageUrl(c.imageURL) || (c.imageURL?.startsWith("/") ? c.imageURL : c.imageURL ? `/${c.imageURL}` : undefined);
    return {
      ...c,
      imageURL: imageURL || c.imageURL,
      price: fromApi != null ? Number(fromApi.price) || 0 : Number(c.price) || 0,
      quantityAvailable: fromApi != null ? Math.max(0, Number(fromApi.quantityAvailable) || 0) : Math.max(0, Number(c.quantityAvailable) || 0),
      product_id: fromApi?.product_id,
      sku: fromApi?.sku ?? c.id,
    };
  });
}

export default function Shop() {
  const [products, setProducts] = useState(() => buildDisplayList([]));
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const thisFetch = ++fetchIdRef.current;
    let cancelled = false;
    getProducts()
      .then((list) => {
        if (cancelled || thisFetch !== fetchIdRef.current) return;
        setProducts(buildDisplayList(list));
      })
      .catch(() => {
        if (!cancelled && thisFetch === fetchIdRef.current) setProducts(buildDisplayList([]));
      })
      .finally(() => {
        if (thisFetch === fetchIdRef.current) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Shop – Kufi, Fez, Taj, Turban, Rumal"
        description="Buy kufi, fez, taj, turban, Rumal, Nalain cap, Azhari cap. Islamic fashion, top boutique. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville, Durbanville."
        url="/shop"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Shop", url: null }]}
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <h1 className="font-serif text-3xl font-semibold text-primary mb-10">Shop the Collection</h1>
        {loading ? (
          <p className="text-primary/70">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-primary/70">No products yet. Add items in Supabase or check your connection.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <ProductCard key={p.sku ?? p.id ?? i} product={p} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
