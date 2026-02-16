import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

export default function EvolutionFezKufi() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="The Evolution of the Fez and Kufi in the Cape"
        description="How the Fez and Kufi evolved in the Cape: Cape Malay heritage, Bo-Kaap, Ottoman and Sufi tradition. Al-Ameen Caps — topical authority in Islamic headwear, Cape Town."
        url="/culture/evolution-fez-kufi-cape"
        evolutionFezKufiArticle
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4">
                The Evolution of the Fez and Kufi in the Cape
              </h1>
              <p className="text-accent font-serif text-xl">
                Deep cultural context — how two iconic forms shaped Cape Islamic identity
              </p>
            </header>

            <section className="space-y-6 text-primary/90 leading-relaxed">
              <p className="text-lg">
                The <strong className="text-primary">Fez</strong> and the <strong className="text-primary">Kufi</strong> have travelled across oceans and centuries to become fixtures of Cape Muslim life. Their evolution in the Cape is a story of faith, trade, and community—not just fashion.
              </p>
              <p>
                The <strong className="text-accent">Kufi</strong>—soft, often embroidered, worn in salaah and daily life—has roots in the Arabian Peninsula and West Africa. In the Cape, it was adopted and adapted by Cape Malay and other Muslim communities, becoming a symbol of devotion and identity. From the <strong className="text-primary">Bo-Kaap</strong> to Athlone, Gatesville, and the suburbs, the Kufi has remained a constant: understated, dignified, and deeply personal.
              </p>
              <p>
                The <strong className="text-primary">Fez</strong> (Tarboush, Rumi hat) arrived via Ottoman and North African influence. In Cape Town it found a home among those who valued both spiritual lineage and ceremonial elegance. The Fez became associated with formal occasions, Sufi gatherings, and the kind of <strong className="text-primary">Cape Town Islamic tradition</strong> that Al-Ameen Caps honours today—<strong className="text-accent">handcrafted</strong>, <strong className="text-primary">premium</strong>, and <strong className="text-primary">authentic</strong> to its roots.
              </p>
              <p>
                Together, the Kufi and Fez tell a story of the Cape as a place where Islamic headwear is not merely worn but lived. At Al-Ameen Caps, we curate each piece with that history in mind—so that the crown of the believer continues to carry meaning for the next generation.
              </p>
            </section>

            <footer className="mt-14 pt-10 border-t border-black/10">
              <p className="text-primary/85">
                Explore our <Link to="/shop" className="text-accent hover:underline font-medium">Inaugural Collection</Link> of Kufi, Fez, Taj, and Turban, or read more in our <Link to="/heritage" className="text-accent hover:underline font-medium">History of Cape Islamic Headwear</Link>.
              </p>
            </footer>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
