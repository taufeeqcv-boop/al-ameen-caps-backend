import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { useCart } from "../context/CartContext";
import { getProductById } from "../lib/supabase";
import { COLLECTION_PRODUCTS } from "../data/collection";
import { formatPrice } from "../lib/format";
import { motion } from "framer-motion";
import defaultProductImg from "../assets/caps-collection.png";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fromCollection = COLLECTION_PRODUCTS.find((p) => p.id === id);
    if (fromCollection) {
      setProduct(fromCollection);
      setLoading(false);
      return;
    }
    getProductById(id)
      .then((p) => {
        if (!cancelled) setProduct(p ?? { id, name: "Product", price: 0, description: "", imageURL: "", category: "" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const quantityAvailable = product?.quantityAvailable ?? 0;
  const inCart = cart.filter((item) => item.id === product?.id).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const available = Math.max(0, quantityAvailable - inCart);
  const canAdd = available > 0;

  const handleAddToCart = () => {
    if (product && canAdd) addToCart({ ...product, quantity: 1 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 pt-32 pb-24">
          <p className="text-primary/70">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={product.name}
        description={(product.description || "").replace(/\n/g, " ").slice(0, 160)}
        image={product.imageURL}
        url={`/product/${product.id}`}
        product={product}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.name, url: null },
        ]}
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <div className="aspect-square bg-primary/5 rounded-lg overflow-hidden shadow-premium">
              <img
                src={product.imageURL || defaultProductImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="btn-primary mt-6 w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {canAdd ? "Add to Cart" : "Out of stock"}
            </button>
            <Link to="/shop" className="block mt-4 text-center text-primary/70 hover:text-accent transition-colors">
              ← Back to Shop
            </Link>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-primary">{product.name}</h1>
            <p className="mt-4 text-primary/70">
              {available <= 0 ? "Out of stock" : `${available} available`}
            </p>
            {Number(product.price) > 0 && (
              <p className="mt-3 text-2xl font-extrabold text-amber-700 border-b border-amber-700/20 pb-3">{formatPrice(product.price)}</p>
            )}
            <div className="mt-6 text-primary/80 whitespace-pre-line leading-relaxed">{product.description || "Description coming soon."}</div>
            <p className="mt-6 text-sm text-primary/70 italic border-l-2 border-accent/50 pl-4">
              To ensure the highest quality, our items are handcrafted and imported. By reserving now, you secure your place in our first delivery queue.
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
