import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";

export default function IslamicHeadwearCapeTown() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Islamic Headwear Cape Town – Kufi, Fez, Taj Shop"
        description="Islamic headwear in Cape Town: kufi, fez, Taj, turban. Handcrafted caps for Jumu'ah and Eid. Bo-Kaap, Athlone, nationwide delivery. Al-Ameen Caps."
        url="/guides/islamic-headwear-cape-town"
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
            Islamic Headwear in Cape Town
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Kufi, Fez, Taj &ndash; handcrafted for the Cape and South Africa
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-lg">
              <strong className="text-primary">Cape Town</strong> has a rich tradition of <strong className="text-primary">Islamic headwear</strong>—from the <strong className="text-primary">Bo-Kaap</strong> to Athlone, Gatesville, and the Northern and Southern suburbs. Whether you&apos;re looking for a <strong className="text-primary">kufi</strong> for Jumu&apos;ah, a <strong className="text-primary">fez</strong> for a special occasion, or a <strong className="text-primary">Taj</strong> for Eid, Al-Ameen Caps offers handcrafted pieces with nationwide delivery.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Where to buy kufi in Cape Town</h2>
            <p>
              Al-Ameen Caps is based in <strong className="text-primary">Cape Town</strong> and serves the Cape and all of <strong className="text-primary">South Africa</strong>. We don&apos;t have a walk-in store—you <Link to="/shop" className="text-accent hover:underline font-medium">shop online</Link> and we deliver to your door. Many of our customers are in <Link to="/near/bo-kaap" className="text-accent hover:underline font-medium">Bo-Kaap</Link>, <Link to="/near/athlone" className="text-accent hover:underline font-medium">Athlone</Link>, Table View, Bellville, and the Winelands.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">The collection</h2>
            <p>
              Our collection includes premium <strong className="text-primary">kufis</strong> (Nalain, Afgani Star, Mufti, Azhari), <strong className="text-primary">Taj</strong> (Naqshbandi, Turkish Naqshbandi, Special Ashrafi), <strong className="text-primary">fez</strong> (Royal Ottoman), rumal, and winter caps. Each piece is chosen for quality and tradition. <Link to="/shop" className="text-accent hover:underline font-medium">Browse the shop</Link> or <Link to="/contact" className="text-accent hover:underline font-medium">contact us</Link> for advice.
            </p>
          </motion.section>

          <motion.div className="mt-10 pt-8 border-t border-primary/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Shop Islamic headwear
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
