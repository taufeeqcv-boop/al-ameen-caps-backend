import { useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Seo from "../components/Seo";
import { injectJsonLd, getLocalBusinessSchema, getWebSiteSchema, getOrganizationSchema, HOMEPAGE_META_DESCRIPTION } from "../lib/seo";

const FeaturedReviews = lazy(() => import("../components/FeaturedReviews"));

export default function Home() {
  useEffect(() => {
    const cleanup1 = injectJsonLd(getLocalBusinessSchema());
    const cleanup2 = injectJsonLd(getWebSiteSchema());
    const cleanup3 = injectJsonLd(getOrganizationSchema());
    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col page-home overflow-x-hidden">
      <Seo url="/" description={HOMEPAGE_META_DESCRIPTION} />
      <Navbar />
      <main className="flex-1 pt-[8.5rem] sm:pt-[9rem] bg-primary home-main-full">
        <Hero />
        <section className="w-full bg-secondary py-16 px-4 sm:px-6 border-t border-accent/30">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
                Crafted in Mumbai. Approved in New York. Landing in Cape Town.
              </h2>
              <p className="text-primary/80 mb-4">
                Our 30% Eid Sale collection is curated directly from master artisans at Azhari Cap Global Marketing in
                Mumbai, verified by discerning customers abroad, and now prepared for brothers and families across Cape
                Town and South Africa.
              </p>
              <p className="text-primary/80 mb-4">
                <span className="font-semibold text-primary">Global Proof:</span> Alhamdulillah, a recent parcel reached
                Brother Ghazi Waheed safely in New York—caps and shawl arriving in perfect condition, with workmanship
                that reflects the heritage of Mumbai and the dignity of Cape Malay tradition.
              </p>
              <p className="text-primary/70 text-sm">
                This Mumbai-to-New York-to-Cape Town journey is your assurance that every discounted piece in the 30%
                Eid Sale carries true premium value—not mass-produced stock.
              </p>
            </div>
            <div className="flex justify-center">
              <figure className="max-w-sm w-full rounded-2xl overflow-hidden border border-primary/10 shadow-premium bg-primary/5">
                <img
                  src="/images/WhatsApp Image 2026-03-12 at 2.28.55 AM (1).jpeg"
                  alt="Brother Ghazi Waheed wearing Al-Ameen Caps headwear and shawl after receiving his parcel safely in New York."
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-4 py-3 text-xs text-primary/70 bg-secondary/80">
                  Crafted in Mumbai. Approved in New York. Landing in Cape Town.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
        <section className="w-full bg-secondary py-16 px-4 sm:px-6 border-t border-accent/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">Browse the collection</h2>
            <p className="text-primary/80 mb-6">Premium Kufi, Taqiyah, Fez and Islamic headwear. Handcrafted in Cape Town. Secure checkout, nationwide delivery.</p>
            <Link to="/shop" className="btn-outline-contrast px-10 py-4 text-base">
              Shop now
            </Link>
            <p className="mt-6 text-sm text-primary/70">
              Popular: <Link to="/product/collection-1" className="text-primary hover:text-accent hover:underline">Na&apos;lain Cap</Link>
              {" · "}
              <Link to="/product/collection-14" className="text-primary hover:text-accent hover:underline">Turkish Naqshbandi Taj</Link>
              {" · "}
              <Link to="/product/collection-9" className="text-primary hover:text-accent hover:underline">Al Hassan Perfume</Link>
            </p>
            <p className="mt-2 text-sm text-primary/70">
              Cape Town: <Link to="/near/bo-kaap" className="text-primary hover:text-accent hover:underline">Bo-Kaap</Link>
              {" · "}
              <Link to="/near/athlone" className="text-primary hover:text-accent hover:underline">Athlone</Link>
            </p>
          </div>
        </section>

        <section className="w-full bg-secondary py-16 px-4 sm:px-6 border-t border-accent/30" aria-labelledby="featured-reviews-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="featured-reviews-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary text-center mb-10">
              What the Community is Saying
            </h2>
            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]" aria-hidden />}>
              <FeaturedReviews starVariant="emerald" />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
