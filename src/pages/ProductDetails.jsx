import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Truck, ShieldCheck, ShoppingCart, Lock, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { formatPrice } from "../lib/format";

import { COLLECTION_PRODUCTS, getCollectionImageUrl } from "../data/collection";
import { COLLECTION_IMAGE_IMPORTS } from "../data/collectionImages";
import { getProductMetaTitle, getProductMetaDescription } from "../lib/seo";
import { getProducts, getVariantsByProductId } from "../lib/supabase";
import ImageMagnifier from "../components/ImageMagnifier";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();

  const staticProduct = COLLECTION_PRODUCTS.find((item) => item.id === id);
  const [product, setProduct] = useState(staticProduct || null);
  const [variants, setVariants] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load product (with product_id from Supabase when available) and variants
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setLoadError(null);
    let cancelled = false;
    (async () => {
      try {
        const list = await getProducts();
        if (cancelled) return;
        const fallback = COLLECTION_PRODUCTS.find((item) => item.id === id) || null;
        const p = list.find((item) => item.id === id) || fallback || null;
        setProduct(p);
        setSelectedSize("");
        setSelectedColor("");
        const productId = p?.product_id != null ? Number(p.product_id) : NaN;
        if (!Number.isNaN(productId) && productId > 0) {
          const v = await getVariantsByProductId(productId);
          if (!cancelled) setVariants(Array.isArray(v) ? v : []);
        } else {
          setVariants([]);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || "Something went wrong.");
          setProduct(COLLECTION_PRODUCTS.find((item) => item.id === id) || null);
          setVariants([]);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, retryCount]);

  const bundledImg = product ? (COLLECTION_IMAGE_IMPORTS[product.id] || COLLECTION_IMAGE_IMPORTS[product.sku]) : null;
  const imageSrc = bundledImg || (product ? getCollectionImageUrl(product) : null);

  // Unique sizes and colors from variants (order preserved)
  const variantSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const variantColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const selectedVariant = variants.find(
    (v) => (v.size || "") === selectedSize && (v.color || "") === selectedColor
  );
  const variantInCart = selectedVariant
    ? cart.filter((item) => item.variantId === selectedVariant.id).reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;
  const variantAvailable = selectedVariant ? Math.max(0, (selectedVariant.stock_quantity ?? 0) - variantInCart) : 0;

  const inCart = product
    ? cart.filter((item) => item.id === product.id && !item.variantId).reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;
  const quantityAvailable = product?.quantityAvailable ?? 0;
  const available = variants.length > 0
    ? (selectedVariant ? variantAvailable : 0)
    : Math.max(0, quantityAvailable - inCart);
  const isReservationOnly = product?.preOrderOnly && quantityAvailable <= 0 && variants.length === 0;
  const canAdd = variants.length > 0
    ? !!selectedVariant && variantAvailable > 0
    : available > 0 || isReservationOnly;

  const handleAddToCart = () => {
    if (!product || !canAdd) return;
    if (selectedVariant) {
      const variantPrice = selectedVariant.price != null ? Number(selectedVariant.price) : null;
      const priceAdjust = Number(selectedVariant.price_adjustment) || 0;
      const finalPrice = variantPrice ?? (Number(product.price) + priceAdjust);
      const item = {
        ...product,
        quantity: 1,
        quantityAvailable: selectedVariant.stock_quantity ?? 0,
        variantId: selectedVariant.id,
        variantSku: selectedVariant.sku,
        size: selectedVariant.size,
        color: selectedVariant.color,
        price: finalPrice,
      };
      addToCart(item);
    } else {
      const item = { ...product, quantity: 1, quantityAvailable: product.quantityAvailable };
      if (isReservationOnly) item.isPreOrder = true;
      addToCart(item);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary/30">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-32">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" aria-hidden />
            <p className="mt-4 text-primary/70">Loading product…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-32">
          <div className="text-center max-w-md">
            <p className="text-primary font-medium">Couldn’t load this product</p>
            <p className="mt-2 text-sm text-primary/70">{loadError}</p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-4 px-4 py-2 bg-accent text-primary rounded-lg font-medium hover:bg-amber-400"
            >
              Try again
            </button>
            <Link to="/shop" className="block mt-4 text-accent hover:underline text-sm">Return to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        title={getProductMetaTitle(product) || product.name}
        description={getProductMetaDescription(product)}
        url={`/product/${product.id}`}
        product={product}
        image={imageSrc}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.name, url: null },
        ]}
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-32 flex-1">
        <Link to="/shop" className="inline-flex items-center text-primary/70 hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="bg-secondary rounded-2xl shadow-premium overflow-hidden grid md:grid-cols-2 gap-0 border border-black/5 mt-2">
          <div className="flex flex-col">
            <div className="bg-primary/5 relative flex items-center justify-center pt-10 pb-4 overflow-visible aspect-[4/5] min-h-[320px] max-h-[75vh] w-full">
              <ImageMagnifier
                src={imageSrc}
                alt={product.name}
                className="w-full h-full min-h-[280px] max-h-[75vh]"
                imgClassName="object-cover object-center"
              />
            </div>
            <div className="p-6 border-t border-black/5">
              <p className="flex items-center gap-2 text-primary/70 text-sm mb-4">
                <ShoppingCart className="w-4 h-4 text-accent shrink-0" />
                {variants.length > 0
                  ? !selectedVariant
                    ? "Select size and colour above."
                    : variantAvailable <= 0
                      ? "Out of stock for this option."
                      : "Limited stock — add yours to cart today."
                  : isReservationOnly
                    ? "Out of stock — reserve yours now."
                    : available <= 0
                      ? "Out of stock"
                      : "Limited stock available — add yours to cart today."}
              </p>
              <p className="flex items-center justify-center gap-2 text-xs text-primary/60 mb-3">
                <Lock className="w-3.5 h-3.5 text-accent" aria-hidden />
                Secure checkout via PayFast · Nationwide delivery
              </p>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="btn-primary w-full py-4 min-h-[48px] text-base disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-600/30 focus:ring-amber-500/20 touch-manipulation"
              >
                {variants.length > 0
                  ? !selectedVariant
                    ? "Select size and colour"
                    : variantAvailable <= 0
                      ? "Out of stock"
                      : "Add to Cart"
                  : isReservationOnly
                    ? "Reserve (Pre-Order)"
                    : canAdd
                      ? "Add to Cart"
                      : "Out of stock"}
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
              {variants.length > 0
                ? selectedVariant
                  ? variantAvailable <= 0
                    ? "Out of stock"
                    : `${variantAvailable} available`
                  : "Select size and colour"
                : isReservationOnly
                  ? "Pre-order only — reserve now"
                  : available <= 0
                    ? "Out of stock"
                    : `${available} available`}
            </p>
            <p className="text-2xl font-bold text-amber-700 mb-6">
              {selectedVariant
                ? formatPrice(
                    selectedVariant.price != null
                      ? Number(selectedVariant.price)
                      : Number(product.price) + (Number(selectedVariant.price_adjustment) || 0)
                  )
                : formatPrice(product.price)}
            </p>

            {variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {variantSizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Size</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full rounded-lg border-2 border-amber-600/40 bg-secondary text-primary py-3 px-4 text-base focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                    >
                      <option value="">Select size</option>
                      {variantSizes.map((s) => {
                        const outOfStock = variants.every((v) => v.size === s && (v.stock_quantity ?? 0) <= 0);
                        return (
                          <option key={s} value={s} disabled={outOfStock}>
                            {s}{outOfStock ? " — Out of stock" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                {variantColors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Colour</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full rounded-lg border-2 border-amber-600/40 bg-secondary text-primary py-3 px-4 text-base focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                    >
                      <option value="">Select colour</option>
                      {variantColors.map((c) => {
                        const outOfStock = variants.every((v) => v.color === c && (v.stock_quantity ?? 0) <= 0);
                        return (
                          <option key={c} value={c} disabled={outOfStock}>
                            {c}{outOfStock ? " — Out of stock" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            <p className="text-primary/80 leading-relaxed whitespace-pre-line">
              {product.description || "Authentic Naqshbandi craftsmanship. Premium quality."}
            </p>
          </div>
        </div>

        {/* Related products — internal linking for SEO */}
        {(() => {
          const related = COLLECTION_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
          if (related.length === 0) return null;
          return (
            <section className="mt-16">
              <h2 className="font-serif text-2xl font-semibold text-primary mb-6">You may also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          );
        })()}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
