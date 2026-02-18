import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Seo from "../components/Seo";
import { injectJsonLd, getLocalBusinessSchema, getWebSiteSchema, HOMEPAGE_META_DESCRIPTION } from "../lib/seo";

export default function Home() {
  useEffect(() => {
    const cleanup1 = injectJsonLd(getLocalBusinessSchema());
    const cleanup2 = injectJsonLd(getWebSiteSchema());
    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo url="/" description={HOMEPAGE_META_DESCRIPTION} />
      <Navbar />
      <main className="flex-1 pt-32">
        <Hero />
        <section className="bg-secondary py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">Browse the collection</h2>
            <p className="text-primary/80 mb-6">Premium handcrafted caps and Islamic headwear. Secure checkout, nationwide delivery.</p>
            <Link to="/shop" className="btn-outline px-10 py-4 text-base">
              Shop now
            </Link>
            <p className="mt-6 text-sm text-primary/70">
              Popular: <Link to="/product/collection-1" className="text-accent hover:underline">Na&apos;lain Cap</Link>
              {" · "}
              <Link to="/product/collection-14" className="text-accent hover:underline">Turkish Naqshbandi Taj</Link>
              {" · "}
              <Link to="/product/collection-9" className="text-accent hover:underline">Al Hassan Perfume</Link>
            </p>
            <p className="mt-2 text-sm text-primary/70">
              Cape Town: <Link to="/near/bo-kaap" className="text-accent hover:underline">Bo-Kaap</Link>
              {" · "}
              <Link to="/near/athlone" className="text-accent hover:underline">Athlone</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
