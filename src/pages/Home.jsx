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
      <main className="flex-1 pt-32 bg-primary home-main-full">
        <Hero />
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
