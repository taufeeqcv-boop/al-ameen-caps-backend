import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Truck, ShieldCheck, ShoppingCart } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { formatPrice } from "../lib/format";

import { COLLECTION_PRODUCTS, getCollectionImageUrl } from "../data/collection";
import { COLLECTION_IMAGE_IMPORTS } from "../data/collectionImages";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();

  const staticProduct = COLLECTION_PRODUCTS.find((item) => item.id === id);
  const [product, setProduct] = useState(staticProduct || null);

  const bundledImg = product ? (COLLECTION_IMAGE_IMPORTS[product.id] || COLLECTION_IMAGE_IMPORTS[product.sku]) : null;
  const imageSrc = bundledImg || (product ? getCollectionImageUrl(product) : null);
  const inCart = cart.filter((item) => item.id === product?.id).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const quantityAvailable = product?.quantityAvailable ?? 0;
  const available = Math.max(0, quantityAvailable - inCart);
  const canAdd = available > 0;

  const handleAddToCart = () => {
    if (product && canAdd) addToCart({ ...product, quantity: 1, quantityAvailable: product.quantityAvailable });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">Product Not Found</h2>
            <Link to="/shop" className="text-accent mt-4 block hover:underline">
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 pb-20">
      <Seo
        title={product.name}
        description={((product.description || "").replace(/\n/g, " ").slice(0, 120) + " Cape Town, South Africa.").slice(0, 160)}
        url={`/product/${product.id}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.name, url: null },
        ]}
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-6 flex-1">
        <Link to="/shop" className="inline-flex items-center text-primary/70 hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="bg-secondary rounded-2xl shadow-premium overflow-hidden grid md:grid-cols-2 gap-0 border border-black/5">
          <div className="flex flex-col">
            <div className="aspect-square bg-primary/5 relative size-full min-h-[280px]">
              <img
                src={imageSrc}
                alt={product.name}
                width={600}
                height={600}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 border-t border-black/5">
              <p className="flex items-center gap-2 text-primary/70 text-sm mb-4">
                <ShoppingCart className="w-4 h-4 text-accent shrink-0" />
                {available <= 0
                  ? "Out of stock"
                  : "Limited stock available — add yours to cart today."}
              </p>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canAdd ? "Add to Cart" : "Out of stock"}
              </button>
              <div className="grid grid-cols-2 gap-4 text-sm text-primary/60 mt-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col justify-center">
            <div className="mb-2">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                Premium Collection
              </span>
            </div>

            <h1 className="text-3xl font-serif text-primary mb-2">{product.name}</h1>
            <p className="text-primary/70 text-sm mb-1">
              {available <= 0 ? "Out of stock" : `${available} available`}
            </p>
            <p className="text-2xl font-bold text-amber-700 mb-6">{formatPrice(product.price)}</p>

            <p className="text-primary/80 leading-relaxed whitespace-pre-line">
              {product.description || "Authentic Naqshbandi craftsmanship. Premium quality."}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
