import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { COLLECTION_PRODUCTS } from "../data/collection";
import { injectJsonLd, getHeadwearTypeItemListSchema } from "../lib/seo";

const NALAIN_IDS = ["collection-1"];
const FEZ_IDS = ["collection-12"];
const KUFI_IDS = [
  "collection-1",
  "collection-2",
  "collection-3",
  "collection-4",
  "collection-8",
  "collection-10",
  "collection-11",
  "collection-13",
];

export default function HeadwearCollection() {
  const byId = useMemo(
    () => new Map(COLLECTION_PRODUCTS.map((p) => [p.id, p])),
    []
  );

  const nalainProducts = useMemo(
    () => NALAIN_IDS.map((id) => byId.get(id)).filter(Boolean),
    [byId]
  );
  const fezProducts = useMemo(
    () => FEZ_IDS.map((id) => byId.get(id)).filter(Boolean),
    [byId]
  );
  const kufiProducts = useMemo(
    () => KUFI_IDS.map((id) => byId.get(id)).filter(Boolean),
    [byId]
  );

  useEffect(() => {
    const cleanups = [];
    if (nalainProducts.length) {
      cleanups.push(
        injectJsonLd(
          getHeadwearTypeItemListSchema({
            type: "Na'lain Caps",
            description:
              "Na'lain caps collection from Al-Ameen Caps — handcrafted Islamic headwear rooted in Cape Malay heritage.",
            products: nalainProducts,
          })
        )
      );
    }
    if (kufiProducts.length) {
      cleanups.push(
        injectJsonLd(
          getHeadwearTypeItemListSchema({
            type: "Kufi & Everyday Caps",
            description:
              "Kufi and everyday Islamic caps for Jumu'ah, Salah and daily wear in Cape Town and across South Africa.",
            products: kufiProducts,
          })
        )
      );
    }
    if (fezProducts.length) {
      cleanups.push(
        injectJsonLd(
          getHeadwearTypeItemListSchema({
            type: "Fez Collection",
            description:
              "Fez headwear collection — Ottoman-style fez and Cape Malay heritage pieces from Al-Ameen Caps.",
            products: fezProducts,
          })
        )
      );
    }
    return () => cleanups.forEach((cleanup) => cleanup && cleanup());
  }, [nalainProducts, kufiProducts, fezProducts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Headwear Collection – Fez, Kufi, Na'lain"
        description="Explore the Al-Ameen Caps headwear collection: Na'lain caps, Fez, and Kufi styles. Handcrafted Islamic headwear rooted in Cape Malay heritage, available across South Africa."
        url="/collection/headwear"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: "Headwear Collection", url: null },
        ]}
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[var(--site-header-offset)] pb-24" role="main">
        <header className="mb-10 max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-primary mb-4">
            Headwear Collection — Na&apos;lain, Kufi &amp; Fez
          </h1>
          <p className="text-primary/80">
            This collection gathers our signature Islamic headwear into one place — from the Na&apos;lain premium cap to
            everyday Kufi styles and the Royal Ottoman Fez. Each piece is handcrafted to honour Cape Malay and Cape Town
            Islamic heritage.
          </p>
        </header>

        <section aria-labelledby="nalain-collection-heading" className="mb-12">
          <h2
            id="nalain-collection-heading"
            className="font-serif text-2xl font-semibold text-primary mb-3"
          >
            Na&apos;lain Caps
          </h2>
          <p className="text-primary/80 mb-4 max-w-2xl">
            The Na&apos;lain cap is the heart of the collection — a premium Kufi-style cap inspired by sacred geometry and
            classical Islamic artistry. Ideal for Jumu&apos;ah, Eid, and special gatherings.
          </p>
          <ul className="space-y-2 list-disc list-inside">
            {nalainProducts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  className="text-accent hover:underline font-medium"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="kufi-collection-heading" className="mb-12">
          <h2
            id="kufi-collection-heading"
            className="font-serif text-2xl font-semibold text-primary mb-3"
          >
            Kufi &amp; Everyday Caps
          </h2>
          <p className="text-primary/80 mb-4 max-w-2xl">
            From Afgani Star to Mufti and Emerald Sultan designs, these kufi and everyday caps are crafted for daily
            salah, Jumu&apos;ah, and gatherings — breathable, structured, and rooted in Cape Town tradition.
          </p>
          <ul className="space-y-2 list-disc list-inside">
            {kufiProducts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  className="text-accent hover:underline font-medium"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="fez-collection-heading">
          <h2
            id="fez-collection-heading"
            className="font-serif text-2xl font-semibold text-primary mb-3"
          >
            Fez Collection
          </h2>
          <p className="text-primary/80 mb-4 max-w-2xl">
            The Fez is a symbol of dignity and classical Ottoman elegance, carried into the Cape Malay tradition. These
            pieces are ideal for nikah, Mawlid, and formal occasions where heritage is worn with honour.
          </p>
          <ul className="space-y-2 list-disc list-inside">
            {fezProducts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  className="text-accent hover:underline font-medium"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}

