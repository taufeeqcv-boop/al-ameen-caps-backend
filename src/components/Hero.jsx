// Hero – full-screen background image, headline, premium CTA + Framer Motion

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "../assets/hero-bg.png";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-primary text-secondary overflow-hidden pt-24 pb-12 sm:pt-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/90" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Restoring the Crown of the Believer
        </motion.h1>
        <motion.p
          className="mt-3 sm:mt-4 text-base md:text-lg text-white/90 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          Premium, handcrafted Islamic headwear. Spirituality meets luxury.
        </motion.p>
        <motion.p
          className="mt-1 text-sm text-white/75 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          For Jumu&apos;ah, Eid &amp; special occasions. Cape Town &amp; nationwide delivery.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="mt-5 sm:mt-6"
        >
          <Link to="/shop" className="btn-primary px-8 py-3.5 text-base min-h-[48px] inline-flex items-center justify-center">
            Shop the Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
