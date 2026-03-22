import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="About"
        description="Al-Ameen Caps: Islamic fashion and Sufi clothing. Kufi, fez, taj, turban. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. South Africa."
        url="/about"
        leadCurator
      />
      <Navbar />
      <main className="flex-1 pt-[var(--site-header-offset)] pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Al-Ameen Caps
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Restoring the Crown of the Believer
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg">
              Welcome to <strong className="text-primary">Al-Ameen Caps</strong>, your premier destination for high-quality traditional
              headwear. Founded with a commitment to <span className="text-accent font-medium">preserving Islamic heritage and style</span>,
              we specialise in a diverse range of exquisite caps, including the elegant Masnadi, the spiritual Naqshbandi, and
              the classic Turkish designs.
            </p>
            <p>
              Our mission is to provide products that reflect both <strong className="text-primary">faith and fashion</strong>, selected for
              superior craftsmanship and comfort. Every crown is curated to sit at the intersection of premium quality and
              spiritual dignity—pieces you can wear with confidence from Jumu&apos;ah to Eid and beyond.
            </p>
            <p>
              From Cape Town to Johannesburg and beyond, Al-Ameen Caps serves those who want their headwear to carry the same
              heritage-rich presence as the families and masajid they come from. Thank you for being part of the Al-Ameen story.
            </p>
            <p className="mt-4">
              <Link to="/shop" className="text-accent font-medium hover:underline">Browse the collection</Link>
              {" · "}
              <Link to="/near/bo-kaap" className="text-accent font-medium hover:underline">Bo-Kaap</Link>
              {" & "}
              <Link to="/near/athlone" className="text-accent font-medium hover:underline">Athlone</Link> delivery.
            </p>
          </motion.section>

          <motion.section
            className="mt-14 pt-10 border-t border-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            aria-labelledby="about-the-artisan"
          >
            <h2 id="about-the-artisan" className="font-serif text-2xl font-semibold text-primary mb-4">
              About the Artisan
            </h2>
            <p className="text-primary/90 leading-relaxed mb-4">
              As Lead Curator, I hand-select every piece in our collection. There is a tactile discipline to it: for the <strong className="text-primary">Royal Ottoman Fez</strong>, I insist on rigid Turkish felt—the kind that holds its shape and carries the weight of ceremony. You can feel the difference when you hold it: dense, structured, worthy of the traditions of the Bo-Kaap and the Cape Malay legacy we serve.
            </p>
            <p className="text-primary/90 leading-relaxed mb-4">
              The embroidery on the <strong className="text-primary">Na&apos;lain Cap</strong> is not merely decorative. It is a symbol of heritage—each motif chosen to honour sacred geometry and the identity of the wearer. I oversee the selection of fabric and the integrity of every stitch so that what reaches you is both comfortable and meaningful, grounded in <strong className="text-accent">Cape Malay tradition</strong> and Islamic artistry.
            </p>
            <p className="text-primary/90 leading-relaxed">
              Every cap in the <strong className="text-primary">Inaugural Collection</strong> is personally inspected in Cape Town before it is offered to you. I hold each piece to the standards expected by the <strong className="text-primary">Bo-Kaap</strong> and <strong className="text-primary">Athlone</strong> communities—where Islamic headwear carries spiritual and cultural weight. Stitch integrity, fabric authenticity, fit, and finish are checked so that what you receive is worthy of the crown of the believer.
            </p>
          </motion.section>

          <motion.section
            className="mt-14 pt-10 border-t border-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            aria-labelledby="artisanal-process"
          >
            <h2 id="artisanal-process" className="font-serif text-2xl font-semibold text-primary mb-4">
              Our Artisanal Process
            </h2>
            <p className="text-primary/90 leading-relaxed mb-4">
              We work with skilled artisans who share our commitment to tradition and excellence. Our process is built on
              <strong className="text-primary"> design briefs</strong>, <strong className="text-primary">material selection</strong>, and
              <strong className="text-primary"> multi-stage inspection</strong>—never compromising on the standards that define Islamic headwear at its best.
            </p>
            <ul className="space-y-2 text-primary/85 list-disc list-inside">
              <li><strong>Design and specification</strong> — Styles are chosen to honour classical forms (Taj, Kufi, Fez, Na&apos;lain) and regional preferences.</li>
              <li><strong>Material and construction</strong> — Only quality fabrics and trims are approved; construction is checked for durability and comfort.</li>
              <li><strong>Final inspection</strong> — Each piece is reviewed by me in Cape Town before it is offered to you.</li>
            </ul>
          </motion.section>

          <motion.section
            className="mt-14 pt-10 border-t border-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2 className="font-serif text-2xl font-semibold text-primary mb-4">Our Promise</h2>
            <ul className="space-y-3 text-primary/85">
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Handcrafted quality in every cap and piece of Islamic headwear we sell.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>Transparent, secure checkout with PayFast—no hidden steps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">•</span>
                <span>A brand that honours faith and craftsmanship in equal measure.</span>
              </li>
            </ul>
            <p className="mt-6 text-primary/85">
              Questions? <Link to="/contact" className="text-accent hover:underline font-medium">Contact us</Link>—we aim to respond within 24–48 hours.
            </p>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
