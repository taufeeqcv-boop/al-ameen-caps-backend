import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

export default function Heritage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="History of Cape Islamic Headwear"
        description="The heritage of Islamic headwear in the Cape: from the Bo-Kaap to the Winelands. Kufi, Taj, Fez, and the Naqshbandi tradition. Cape Town, South Africa."
        url="/heritage"
        heritageArticle
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            History of Cape Islamic Headwear
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Tradition, identity, and the crown of the believer
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg">
              Islamic headwear in the Cape has been shaped by centuries of faith, trade, and community. From the
              <Link to="/near/bo-kaap" className="text-primary font-semibold hover:text-accent hover:underline"> Bo-Kaap</Link> to the Northern and Southern suburbs, the
              <strong className="text-primary"> Winelands</strong>, and beyond, the Kufi, Taj, and Fez carry meanings that go far beyond fashion. See also <Link to="/near/athlone" className="text-accent hover:underline">Athlone</Link>.
            </p>
            <p>
              The <strong className="text-accent">Kufi</strong>—often called a prayer cap or namaz cap—is worn in salaah and daily life across the Cape and South Africa. The
              <strong className="text-primary"> Taj</strong> (crown) holds a special place in the
              <strong className="text-primary"> Naqshbandi</strong> tradition, where it symbolises devotion and spiritual lineage. The
              <strong className="text-primary"> Fez</strong> (Tarboush, Rumi hat) connects Cape Malay and Sufi heritage to Ottoman and North African roots.
            </p>
            <p>
              Cape Town&apos;s Muslim communities have preserved and evolved these styles, blending local identity with global Islamic craft. Today, the same care for quality and symbolism guides
              <Link to="/shop" className="text-accent hover:underline font-medium"> what we curate at Al-Ameen Caps</Link>—so that the crown of the believer continues to be honoured in every stitch and choice we offer.
            </p>
          </motion.section>

          <motion.section
            className="mt-14 pt-10 border-t border-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="font-serif text-2xl font-semibold text-primary mb-4">From the Cape to the World</h2>
            <p className="text-primary/90 leading-relaxed mb-4">
              The Cape has long been a meeting point of cultures. Islamic headwear here reflects that diversity: the soft Kufi for daily wear and prayer, the structured Taj for scholars and those in the Naqshbandi path, the Na&apos;lain cap with its emblematic symbolism, and the Fez for occasions and tradition. Each style carries the weight of heritage and the intention of the wearer.
            </p>
            <p className="text-primary/90 leading-relaxed">
              At Al-Ameen Caps, our Lead Curator draws on this history to select and quality-check every piece—so that you receive headwear that is both authentic to tradition and built to last. Learn more
              <Link to="/about" className="text-accent hover:underline font-medium"> about our approach and our artisan process</Link>.
            </p>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
