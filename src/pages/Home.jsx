import { useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Seo from "../components/Seo";
import { injectJsonLd, getLocalBusinessSchema, getWebSiteSchema, HOMEPAGE_META_DESCRIPTION } from "../lib/seo";

const FeaturedReviews = lazy(() => import("../components/FeaturedReviews"));

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
    <div className="min-h-screen flex flex-col page-home overflow-x-hidden">
      <Seo url="/" description={HOMEPAGE_META_DESCRIPTION} />
      <Navbar />
      <main className="flex-1 pt-[var(--site-header-offset)] bg-primary home-main-full">
        <Hero />
        <section className="w-full bg-secondary py-16 px-4 sm:px-6 border-t border-accent/30">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
                Premium headwear, chosen with care—for Cape Town and South Africa.
              </h2>
              <p className="text-primary/80 mb-4">
                Al-Ameen Caps brings together kufi, fez, taj, and complementary pieces selected for craft, comfort, and
                dignity. We serve brothers and families who want reliable quality for Jumu&apos;ah, Eid, and everyday
                dress—without the noise of mass-market stock.
              </p>
              <p className="text-primary/80 mb-4">
                Our roots are in this community: Cape Malay heritage, modest fashion, and nationwide delivery so you can
                order with confidence whether you are in the Western Cape, Gauteng, KwaZulu-Natal, or beyond.
              </p>
              <p className="text-primary/70 text-sm">
                Each piece is packed and fulfilled with the same attention we would want for our own households—because
                what you wear for salah and gathering should feel right, look right, and last.
              </p>
            </div>
            <div className="flex justify-center">
              <figure className="max-w-sm w-full rounded-2xl overflow-hidden border border-primary/10 shadow-premium bg-primary/5">
                <img
                  src="/collection/nalain-cap.png"
                  alt="Premium Islamic headwear from Al-Ameen Caps—Na'lain-style cap, curated for South Africa."
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-4 py-3 text-xs text-primary/70 bg-secondary/80">
                  Handpicked pieces · Secure checkout · Nationwide delivery
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
            <p className="mt-2 text-sm text-primary/70">
              <Link to="/guides/sufi-headwear-tariqah-south-africa" className="text-primary hover:text-accent hover:underline">Sufi &amp; tariqah headwear in South Africa</Link>
              {" · "}
              <Link to="/guides" className="text-primary hover:text-accent hover:underline">All guides</Link>
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
