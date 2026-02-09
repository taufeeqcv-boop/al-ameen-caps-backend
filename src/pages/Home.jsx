import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Seo from "../components/Seo";
import { injectJsonLd, getLocalBusinessSchema, getWebSiteSchema } from "../lib/seo";

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
      <Seo
        url="/"
        description="Islamic fashion and Sufi clothing: kufi, fez, taj, turban, Rumal, salaah cap. Cape Town, Durban, Johannesburg, PE. Northern and Southern suburbs, Winelands, Bo-Kaap, Tableview, Bellville. Top boutique. South Africa."
      />
      <Navbar />
      <main className="flex-1 pt-32">
        <Hero />
        <section className="bg-secondary py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">Browse the collection</h2>
            <p className="text-primary/80 mb-8">Premium handcrafted caps and Islamic headwear. Secure checkout, nationwide delivery.</p>
            <Link to="/shop" className="btn-outline px-10 py-4 text-base">
              Shop now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
