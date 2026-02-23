import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";

const GUIDES = [
  { path: "/guides/kufi-care", title: "Kufi care guide", description: "How to clean, store, and care for your kufi and Islamic cap." },
  { path: "/guides/eid-headwear-south-africa", title: "Eid headwear guide – South Africa", description: "Choose the right kufi, Taj, or fez for Eid salah and celebrations." },
  { path: "/guides/islamic-headwear-cape-town", title: "Islamic headwear in Cape Town", description: "Where to buy kufi, fez, and Taj in Cape Town. Bo-Kaap, Athlone, nationwide." },
];

export default function GuidesIndex() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Guides – Kufi, Eid Headwear & Cape Town"
        description="Guides to kufi care, Eid headwear, and Islamic headwear in Cape Town and South Africa. Al-Ameen Caps."
        url="/guides"
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Guides
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Kufi, Eid & Islamic headwear in Cape Town and South Africa
          </motion.p>

          <ul className="space-y-6">
            {GUIDES.map((g, i) => (
              <motion.li
                key={g.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link to={g.path} className="block p-4 rounded-lg border border-primary/15 hover:border-accent/40 hover:bg-primary/5 transition-colors">
                  <h2 className="font-serif text-xl font-semibold text-primary">{g.title}</h2>
                  <p className="mt-1 text-sm text-primary/70">{g.description}</p>
                </Link>
              </motion.li>
            ))}
          </ul>

          <motion.div className="mt-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Shop collection
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
