import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";

export default function KufiCare() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Kufi Care Guide – How to Clean & Store Your Cap"
        description="How to clean, store, and care for your kufi and Islamic prayer cap. Tips for Cape Town and South Africa. Keep your cap in top condition."
        url="/guides/kufi-care"
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
            Kufi Care Guide
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            How to clean, store, and care for your Islamic cap
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-lg">
              A well-made <strong className="text-primary">kufi</strong> or prayer cap can last for years with simple care. Whether you wear one for Jumu&apos;ah in <strong className="text-primary">Cape Town</strong>, daily salaah, or special occasions across <strong className="text-primary">South Africa</strong>, these tips help keep your cap in shape.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Cleaning</h2>
            <p>
              Most woven kufis can be hand-washed in cool water with a mild detergent. Avoid wringing; gently press out water and air-dry away from direct heat. Embroidered or structured caps may need spot-cleaning only—check the fabric and trim.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Storage</h2>
            <p>
              Store your kufi in a clean, dry place so it keeps its shape. A small box or drawer keeps dust off. Avoid crushing under heavy items. In Cape Town&apos;s humidity, good airflow helps.
            </p>
            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Wear and rotation</h2>
            <p>
              If you wear a kufi daily, having a second cap lets you rotate and extends the life of both. Our <Link to="/shop" className="text-accent hover:underline font-medium">collection</Link> includes everyday and special-occasion caps—all handcrafted and built to last.
            </p>
          </motion.section>

          <motion.div className="mt-10 pt-8 border-t border-primary/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Shop kufis & caps
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
