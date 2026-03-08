import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { COLLECTION_PRODUCTS } from "../data/collection";

const AFGANI_PRODUCT_ID = "collection-2";
const PERFUME_PRODUCT_ID = "collection-9";

export default function AfganiStarSpecial() {
  const afganiProduct = COLLECTION_PRODUCTS.find((p) => p.id === AFGANI_PRODUCT_ID);
  const perfumeProduct = COLLECTION_PRODUCTS.find((p) => p.id === PERFUME_PRODUCT_ID);

  return (
    <div className="min-h-screen flex flex-col bg-primary/5">
      <Seo
        title="Buy Afgani Star Caps | Premium Cape Malay Heritage Headwear"
        description="Shop the Afgani Star Cap – a premium heritage kufi, hand-finished in Cape Town for Jumu'ah, Eid, and daily wear. Limited stock, nationwide delivery via secure PayFast checkout."
        url="/afgani-star-cap"
        product={afganiProduct}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: "Afgani Star Cap", url: "/afgani-star-cap" },
        ]}
      />
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-10 items-start mb-16">
            <div>
              <motion.span
                className="inline-flex items-center rounded-full bg-accent/10 border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Top Seller
              </motion.span>
              <motion.h1
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-primary mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                The Afgani Star Collection – Premium Heritage Kufis
              </motion.h1>
              <motion.p
                className="text-primary/80 text-base md:text-lg max-w-xl mb-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Hand-finished in Cape Town, designed for Jumu&apos;ah and Eid. The Afgani Star Cap brings together Afghan-inspired design and Cape Malay Heritage for brothers who want their crown to match their niyyah.
              </motion.p>
              <motion.ul
                className="space-y-2 text-primary/80 text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <li>• Structured, comfortable fit that keeps its shape through Salah and gatherings.</li>
                <li>• Breathable fabric suited to Cape Town masjids and South African summers.</li>
                <li>• Clean, dignified profile that pairs with thobes, suits, and kurtas.</li>
              </motion.ul>
              <motion.div
                className="mt-6 flex flex-wrap items-center gap-3 text-xs text-primary/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-primary/5 px-3 py-1 font-semibold text-accent">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  Trusted Cape Malay Heritage
                </span>
                <span>Crafted in Cape Town · Nationwide delivery</span>
              </motion.div>
            </div>

            {afganiProduct && (
              <motion.div
                className="bg-secondary rounded-xl border border-primary/10 shadow-premium p-4 sm:p-5 lg:p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top Seller</p>
                  <p className="text-[11px] text-primary/60">Limited stock · Add to cart below</p>
                </div>
                <ProductCard product={afganiProduct} />
              </motion.div>
            )}
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">Why brothers choose Afgani Star</h2>
            <p className="text-primary/80 text-base md:text-lg mb-4">
              This Traditional Kufi was designed for men who value clean, structured headwear that still feels light on the head. It holds its profile for Jumu&apos;ah, nikah, and family gatherings without feeling heavy or overly stiff.
            </p>
            <p className="text-primary/75 text-sm md:text-base">
              Each piece is checked in Cape Town before it leaves for your home. It&apos;s built to serve as your weekly Jumu&apos;ah cap, not just a once-off show piece — a proper Biedaied crown rooted in Cape Malay Heritage.
            </p>
          </section>

          <section className="mb-16 border-t border-primary/10 pt-10">
            <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 items-start">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-primary mb-3">Perfect Match: Heritage Jumu&apos;ah Set</h2>
                <p className="text-primary/80 text-base md:text-lg mb-3">
                  Complete your Jumu&apos;ah attire with our heritage scents.
                </p>
                <p className="text-primary/75 text-sm md:text-base mb-4">
                  Pair your Afgani Star Cap with Al Hassan&apos;s 100% alcohol-free perfumes. These long-lasting, masjid-friendly scents were chosen to match the same dignity and presence as your kufi.
                </p>
                <ul className="list-disc list-inside text-primary/80 text-sm md:text-base space-y-1 mb-4">
                  <li>Alcohol-free and salaah-friendly for Jumu&apos;ah and daily wear.</li>
                  <li>Scents ranging from refined oud to modern heritage blends.</li>
                  <li>Gift-ready presentation for brothers, fathers, and imams.</li>
                </ul>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-accent/90 transition-colors"
                  >
                    Browse full Jumu&apos;ah sets
                  </Link>
                  {perfumeProduct && (
                    <Link
                      to={`/product/${perfumeProduct.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      View Al Hassan Perfumes
                    </Link>
                  )}
                </div>
              </div>

              {perfumeProduct && (
                <div className="bg-secondary rounded-xl border border-primary/10 shadow-premium p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-2">Perfect Match</p>
                  <ProductCard product={perfumeProduct} index={1} />
                </div>
              )}
            </div>
          </section>

          <section className="border-t border-primary/10 pt-8 mt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-xs md:text-sm text-primary/75">
                <p className="font-semibold text-primary">Al-Ameen Caps</p>
                <p>205 Wallace Street, Glenwood, Cape Town, 7460</p>
                <p>Cape Town based · Nationwide courier delivery across South Africa</p>
              </div>
              <div className="text-xs text-primary/70">
                <p className="uppercase tracking-wide text-[11px] mb-1">Secure PayFast Checkout</p>
                <div className="flex flex-wrap justify-start gap-2">
                  <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                    Visa
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                    Mastercard
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                    Apple&nbsp;Pay
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                    Samsung&nbsp;Pay
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white text-[10px] font-semibold text-black shadow-sm">
                    SnapScan / QR
                  </span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-accent/60 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-accent">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                  Authorized Heritage Retailer
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

