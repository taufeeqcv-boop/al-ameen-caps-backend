// Hero – full-screen background image (LCP preload injected on this route only), headline, premium CTA + Framer Motion

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Public URL; optimize-images.js → public/hero-bg.webp
const HERO_IMAGE = "/hero-bg.webp";
const HERO_PRELOAD_ID = "hero-lcp-preload";

export default function Hero() {
  useEffect(() => {
    if (document.getElementById(HERO_PRELOAD_ID)) return;
    const link = document.createElement("link");
    link.id = HERO_PRELOAD_ID;
    link.rel = "preload";
    link.as = "image";
    link.href = HERO_IMAGE;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById(HERO_PRELOAD_ID);
      if (el?.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-primary text-secondary overflow-hidden pt-24 pb-12 sm:pt-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/90" aria-hidden="true" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Premium Islamic Headwear
        </motion.h1>
        <motion.p
          className="mt-3 sm:mt-4 text-base md:text-lg text-white/90 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          Handcrafted Kufi, Taqiyah, and Fez rooted in Cape Malay heritage. In stock and shipping from Cape Town across South Africa.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="mt-5 sm:mt-6"
        >
          <Link to="/shop" className="btn-primary px-8 py-3.5 text-base min-h-[48px] inline-flex items-center justify-center">
            Shop now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
