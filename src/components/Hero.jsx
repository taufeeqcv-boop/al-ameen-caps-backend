// Hero – full-screen background image, headline, premium CTA + Framer Motion

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "../assets/hero-bg.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-primary text-secondary overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/90" />
      <div className="relative z-10 text-center px-4">
        <motion.h1
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-white max-w-4xl mx-auto leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Restoring the Crown of the Believer
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-xl text-white/90 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          Premium, handcrafted Islamic headwear. Spirituality meets luxury.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="mt-10"
        >
          <Link to="/shop" className="btn-primary px-10 py-4 text-base">
            Shop the Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
