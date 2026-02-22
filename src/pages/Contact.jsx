import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const FORM_ACTION = import.meta.env.VITE_CONTACT_FORM_ACTION || "";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    if (!FORM_ACTION) {
      e.preventDefault();
      setSubmitted(true);
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Contact"
        description="Contact Al-Ameen Caps. Kufi, fez, taj, Islamic fashion. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. South Africa."
        url="/contact"
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl font-semibold text-primary text-center mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-primary/70 text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We aim to respond within 24–48 hours.
            {!FORM_ACTION && CONTACT_EMAIL && (
              <span className="block mt-2">
                Or email us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline font-medium">{CONTACT_EMAIL}</a>.
              </span>
            )}
          </motion.p>

          {submitted && !FORM_ACTION ? (
            <motion.div
              className="bg-primary/5 border border-accent/30 rounded-lg p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="status"
              aria-live="polite"
            >
              <p className="text-primary font-medium">Thank you for your message.</p>
              <p className="mt-2 text-primary/70 text-sm">
                We will be in touch shortly.
                {CONTACT_EMAIL && (
                  <> For immediate queries, email us at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">{CONTACT_EMAIL}</a>.</>
                )}
              </p>
            </motion.div>
          ) : (
            <motion.form
              action={FORM_ACTION}
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <input type="text" name="_subject" value="Al-Ameen Caps – Contact" readOnly className="hidden" />
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary mb-1">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-black/20 rounded-lg transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-black/20 rounded-lg transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-black/20 rounded-lg transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4">
                Send Message
              </button>
            </motion.form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
