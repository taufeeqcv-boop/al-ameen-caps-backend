import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";
import {
  injectJsonLd,
  getSufiHeadwearGuideArticleSchema,
  SUFI_HEADWEAR_GUIDE_FAQS,
  SEO_KEYWORDS,
} from "../../lib/seo";

export default function SufiHeadwearSouthAfrica() {
  useEffect(() => {
    return injectJsonLd(getSufiHeadwearGuideArticleSchema());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Sufi Headwear & Tariqah Traditions – South Africa"
        description="Tasawwuf, tariqah paths & Islamic headwear in South Africa: kufi, Taj, fez for dhikr & Jumu'ah. Cape Town; nationwide delivery. Al-Ameen Caps."
        url="/guides/sufi-headwear-tariqah-south-africa"
        keywords={SEO_KEYWORDS}
        faqs={SUFI_HEADWEAR_GUIDE_FAQS}
      />
      <Navbar />
      <main className="flex-1 pt-[var(--site-header-offset)] pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Sufi Headwear &amp; Tariqah Traditions in South Africa
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Tasawwuf, dhikr &amp; dignified dress — Cape Town &amp; nationwide
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-lg">
              <strong className="text-primary">Al-Ameen Caps</strong> is a retailer of handcrafted{" "}
              <strong className="text-primary">Islamic headwear</strong> and fragrances. We honour{" "}
              <strong className="text-primary">tasawwuf</strong> (Islamic spirituality) as part of the broader Ummah—we do
              not claim affiliation with any single <strong className="text-primary">tariqah</strong> (spiritual path) or
              shaykh. Our role is to supply quality <strong className="text-primary">kufis</strong>,{" "}
              <strong className="text-primary">Taj</strong> styles, <strong className="text-primary">fezzes</strong>, and
              rumals for <strong className="text-primary">Jumu&apos;ah</strong>, <strong className="text-primary">Salah</strong>
              , <strong className="text-primary">Eid</strong>, and community gatherings across{" "}
              <strong className="text-primary">South Africa</strong>.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Tariqah names you may encounter</h2>
            <p>
              Muslims in <strong className="text-primary">South Africa</strong>—including in{" "}
              <strong className="text-primary">Cape Town</strong>, <strong className="text-primary">Durban</strong>, and{" "}
              <strong className="text-primary">Johannesburg</strong>—are part of a rich spectrum of scholarly and spiritual
              lineages. Searchers and readers often look for well-known <strong className="text-primary">tariqah</strong>{" "}
              names when exploring <strong className="text-primary">Sufi</strong> history or dress. Examples that appear
              frequently in English-language discourse include (spelling varies):{" "}
              <strong className="text-primary">Naqshbandiyya</strong>, <strong className="text-primary">Qadiriyya</strong>,{" "}
              <strong className="text-primary">Chishtiyya</strong>, <strong className="text-primary">Shadhiliyya</strong>,{" "}
              <strong className="text-primary">Tijaniyya</strong>, <strong className="text-primary">Rifaiyya</strong>,{" "}
              <strong className="text-primary">Khalwatiyya</strong>, <strong className="text-primary">Alawiyya</strong>,{" "}
              <strong className="text-primary">Darqawiyya</strong>, <strong className="text-primary">Inayati</strong>, and{" "}
              traditions linked to <strong className="text-primary">Idrisi</strong> and{" "}
              <strong className="text-primary">Ba &apos;Alawi</strong> scholarship. This list is{" "}
              <em>illustrative, not exhaustive</em>; local mosques and qualified teachers remain the authority on any path.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Headwear &amp; gatherings</h2>
            <p>
              For <strong className="text-primary">dhikr</strong>, <strong className="text-primary">mawlid</strong>, or
              Friday prayer, many brothers choose a breathable <strong className="text-primary">kufi</strong> or{" "}
              <strong className="text-primary">taqiyah</strong>; a <strong className="text-primary">Taj</strong> or{" "}
              <strong className="text-primary">turban</strong> may suit more formal occasions. Our{" "}
              <Link to="/product/collection-5" className="text-accent hover:underline font-medium">
                Naqshbandi Taj
              </Link>{" "}
              and{" "}
              <Link to="/product/collection-14" className="text-accent hover:underline font-medium">
                Turkish Naqshbandi Taj
              </Link>{" "}
              are popular where layered Taj styling is preferred—alongside fez and kufi options in the{" "}
              <Link to="/shop" className="text-accent hover:underline font-medium">
                shop
              </Link>
              .
            </p>

            <h2 className="font-serif text-2xl font-semibold text-primary mt-8 mb-3">Related reading</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link to="/culture/evolution-fez-kufi-cape" className="text-accent hover:underline font-medium">
                  Evolution of the Fez and Kufi in the Cape
                </Link>
              </li>
              <li>
                <Link to="/heritage" className="text-accent hover:underline font-medium">
                  Cape Islamic headwear heritage
                </Link>
              </li>
              <li>
                <Link to="/guides/islamic-headwear-cape-town" className="text-accent hover:underline font-medium">
                  Islamic headwear in Cape Town
                </Link>
              </li>
            </ul>
          </motion.section>

          <motion.div className="mt-10 pt-8 border-t border-primary/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Browse Sufi-inspired headwear
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
