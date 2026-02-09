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
              Al-Ameen Caps exists to offer <strong className="text-primary">premium, handcrafted Islamic headwear</strong> to those
              who value both tradition and excellence. We believe the crown of the believer deserves the same care and dignity in
              craft as the most respected luxury goods.
            </p>
            <p>
              Our pieces are made with attention to detail, quality materials, and the intention that they be worn in worship and
              in daily life. <span className="text-accent font-medium">Spirituality meets luxury</span> in every cap we offer:
              timeless design, enduring quality, and a shopping experience that reflects the respect we have for our customers.
            </p>
            <p>
              We are a small brand focused on trust, authenticity, and a “Rolex-style” standard—minimalist, high-trust, and
              built to last. Thank you for being part of the Al-Ameen story.
            </p>
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
