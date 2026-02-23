import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Instagram } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61587066161054";
const INSTAGRAM_URL = "https://www.instagram.com/alameencaps/";
// Facebook Page Plugin: use a Page URL (e.g. https://www.facebook.com/YourPageName). If you use a profile URL, the embed may not show.
const FACEBOOK_PAGE_EMBED_HREF = "https://www.facebook.com/profile.php?id=61587066161054";

export default function Community() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Community & Social – Al-Ameen Caps"
        description="Follow Al-Ameen Caps on Facebook and Instagram. Latest updates, new arrivals, and Islamic headwear in Cape Town and South Africa."
        url="/community"
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Community & Social
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Follow us for new arrivals, Cape Town tradition, and more
          </motion.p>

          <motion.section
            className="grid sm:grid-cols-2 gap-8 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-accent transition-colors font-medium"
              >
                <Facebook className="w-6 h-6" />
                Facebook
              </a>
              <p className="mt-2 text-sm text-primary/70">
                Updates, photos, and community. Follow us on Facebook.
              </p>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-accent text-sm font-medium hover:underline"
              >
                Visit our Facebook page →
              </a>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-accent transition-colors font-medium"
              >
                <Instagram className="w-6 h-6" />
                Instagram
              </a>
              <p className="mt-2 text-sm text-primary/70">
                New caps, styling, and Cape Town. Follow us on Instagram.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-accent text-sm font-medium hover:underline"
              >
                Visit our Instagram →
              </a>
            </div>
          </motion.section>

          {/* Facebook Page Plugin embed – works with Facebook Pages; if you use a profile URL, create a Page and set FACEBOOK_PAGE_EMBED_HREF to its URL */}
          <motion.section
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-serif text-xl font-semibold text-primary mb-4">
              Facebook
            </h2>
            <div className="flex justify-center">
              <iframe
                title="Al-Ameen Caps on Facebook"
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK_PAGE_EMBED_HREF)}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                width="340"
                height="500"
                style={{ border: "none", overflow: "hidden" }}
                className="max-w-full rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </motion.section>

          {/* Instagram: paste embed code from a post (Instagram → post → ⋮ → Embed). For a full feed you’d need an approved app or third-party widget. */}
          <motion.section
            className="rounded-xl border border-primary/20 bg-primary/5 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-serif text-xl font-semibold text-primary mb-2">
              Instagram
            </h2>
            <p className="text-sm text-primary/70 mb-4">
              Follow us{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                @alameencaps
              </a>
              . To show a post here: open the post on Instagram → ⋮ → Embed → copy the code, then add it in <code className="text-accent bg-primary/10 px-1 rounded">Community.jsx</code> inside the div below.
            </p>
            <div className="min-h-[200px] flex items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5">
              {/* Paste Instagram block embed code here (one or more). Example: <blockquote class="instagram-media" data-instgrm-permalink="..." ...></blockquote> + script */}
              <p className="text-primary/50 text-sm">Instagram post embed can go here</p>
            </div>
          </motion.section>

          <motion.div className="mt-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors">
              Shop the collection
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
