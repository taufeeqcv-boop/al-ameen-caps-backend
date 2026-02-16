import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { LOCAL_LANDING_FAQS } from "../data/localFAQs";

export default function LocalBoKaap() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Best Kufi Shop Near Bo-Kaap | Islamic Headwear Cape Town"
        description="Best Kufi shop near Bo-Kaap. Handcrafted Kufi, Fez, Taj, Turban. Al-Ameen Caps — Cape Town Islamic tradition. Delivery to Bo-Kaap and Cape Town."
        url="/near/bo-kaap"
        localBusiness
        faqs={LOCAL_LANDING_FAQS}
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Best Kufi Shop Near Bo-Kaap
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Premium Islamic headwear for the Cape — Kufi, Fez, Taj, Turban. Handcrafted and delivered to Bo-Kaap and Cape Town.
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg">
              Al-Ameen Caps serves Bo-Kaap and the greater Cape Town area with <strong className="text-primary">handcrafted Kufi, Fez, Taj, and Turban</strong>. Our Inaugural Collection reflects <strong className="text-primary">Cape Town Islamic tradition</strong> and <strong className="text-accent">authentic Bo-Kaap Fez</strong> and Kufi styles—curated for quality and delivered to your door.
            </p>
            <p>
              Whether you are in the Bo-Kaap, Athlone, Gatesville, or the Northern and Southern suburbs, we deliver nationwide. <Link to="/shop" className="text-accent hover:underline font-medium">Browse the collection</Link> or <Link to="/contact" className="text-accent hover:underline font-medium">contact us</Link> for sizing and traditional wear advice.
            </p>
          </motion.section>

          <motion.section
            className="pt-10 border-t border-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            aria-labelledby="faq-bo-kaap"
          >
            <h2 id="faq-bo-kaap" className="font-serif text-2xl font-semibold text-primary mb-6">
              Frequently Asked Questions
            </h2>
            <ul className="space-y-6">
              {LOCAL_LANDING_FAQS.map((faq, i) => (
                <li key={i}>
                  <h3 className="font-semibold text-primary mb-2">{faq.question}</h3>
                  <p className="text-primary/85 leading-relaxed">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
