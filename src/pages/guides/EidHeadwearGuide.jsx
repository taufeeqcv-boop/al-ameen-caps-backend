import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";

export default function EidHeadwearGuide() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Eid Headwear Guide South Africa – Kufi, Taj & Fez"
        description="Eid headwear guide for South Africa: choose the right kufi, Taj, or fez for Eid salah. Cape Town, Johannesburg, Durban. Order in time for Eid."
        url="/guides/eid-headwear-south-africa"
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Eid Headwear Guide – South Africa
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Kufi, Taj & fez for Eid salah and celebrations
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-lg">
              Eid is a time when many in <strong className="text-primary">South Africa</strong>—<strong className="text-primary">Cape Town</strong>, Johannesburg, Durban, and nationwide—choose a special cap or <strong className="text-primary">Taj</strong> for the day. Whether you prefer a clean <strong className="text-primary">kufi</strong> or a formal <strong className="text-primary">fez</strong>, the right headwear adds dignity to Eid salah and family gatherings.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Classic kufi for Eid</h2>
            <p>
              A white, black, or neutral kufi is a timeless choice. Look for one that holds its shape and pairs well with your jubba or suit. Our <Link to="/shop" className="text-accent hover:underline font-medium">Nalain Cap</Link> and <Link to="/shop" className="text-accent hover:underline font-medium">Afgani Star Cap</Link> are popular for Eid.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Taj and fez for the day</h2>
            <p>
              For a more ceremonial look, a <strong className="text-primary">Naqshbandi Taj</strong> or <strong className="text-primary">Royal Ottoman Fez</strong> stands out. Order in advance so your headwear arrives before Eid—we deliver across South Africa.
            </p>
            <p>
              <Link to="/shop" className="text-accent hover:underline font-medium">Browse the full collection</Link> and find the piece that honours your Eid.
            </p>
          </motion.section>

          <motion.div className="mt-10 pt-8 border-t border-primary/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Shop Eid headwear
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
