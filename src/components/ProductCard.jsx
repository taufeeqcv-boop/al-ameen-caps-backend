// ProductCard – white card, image, exact name, quantity available, Add to Cart

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import { getCollectionImageUrl } from "../data/collection";
import { COLLECTION_IMAGE_IMPORTS } from "../data/collectionImages";
import { sameOriginImageSrc } from "../lib/supabase";
import defaultProductImg from "../assets/caps-collection.png";

export default function ProductCard({ product, index = 0 }) {
  const { id, name, price, imageURL, quantityAvailable = 0, preOrderOnly } = product || {};
  const { addToCart, cart } = useCart();
  const inCart = cart.filter((item) => item.id === id).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const available = Math.max(0, (quantityAvailable ?? 0) - inCart);
  const isReservationOnly = preOrderOnly && (quantityAvailable ?? 0) <= 0;
  const canAdd = available > 0 || isReservationOnly;

  const bundledImg = product ? (COLLECTION_IMAGE_IMPORTS[id] || COLLECTION_IMAGE_IMPORTS[product.sku]) : null;
  const displaySrc = bundledImg || getCollectionImageUrl(product) || sameOriginImageSrc(imageURL) || defaultProductImg;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    const item = { id, name, price, imageURL, quantity: 1, quantityAvailable, product_id: product?.product_id };
    if (isReservationOnly) item.isPreOrder = true;
    addToCart(item);
  };

  return (
    <motion.article
      className="bg-secondary rounded-lg shadow-premium hover:shadow-premium-hover transition-shadow overflow-hidden border border-black/5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link to={`/product/${id}`} className="block">
        <div className="aspect-square bg-primary/5 relative">
          <img
            src={displaySrc}
            alt={name}
            width={400}
            height={400}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          {available <= 0 && (
            <span className="absolute top-2 right-2 px-2 py-1 rounded bg-primary/90 text-secondary text-xs font-medium uppercase tracking-wide">
              {isReservationOnly ? "Pre-order" : "Out of stock"}
            </span>
          )}
        </div>
        <div className="p-5">
          <h2 className="font-serif text-lg font-semibold text-primary">{name || "Product Name"}</h2>
          <p className="mt-2 text-primary/70 text-sm">
            {isReservationOnly ? (
              <span className="text-primary/60">Reservation only</span>
            ) : available <= 0 ? (
              <span className="text-primary/60">Out of stock</span>
            ) : (
              <span>{available} available</span>
            )}
          </p>
          {Number(price) > 0 && (
            <p className="mt-2 text-2xl font-semibold text-accent">{formatPrice(price)}</p>
          )}
        </div>
      </Link>
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="btn-outline w-full py-3.5 min-h-[44px] text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
        >
          {isReservationOnly ? "Reserve" : canAdd ? "Add to Cart" : "Out of stock"}
        </button>
      </div>
    </motion.article>
  );
}
