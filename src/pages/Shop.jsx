import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { COLLECTION_PRODUCTS } from "../data/collection";

export default function Shop() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {COLLECTION_PRODUCTS.map((p, i) => (
            <ProductCard key={p.sku ?? p.id ?? i} product={p} index={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
