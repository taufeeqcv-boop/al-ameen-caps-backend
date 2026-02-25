import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ImageOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import MajlisForm from "../components/MajlisForm";
import MajlisWall from "../components/MajlisWall";
import LivingTree from "../components/LivingTree";
import OptimizedImage from "../components/OptimizedImage";
import { getFirstApprovedMajlisImageUrl } from "../lib/supabase";
import { HERITAGE_SEO_KEYWORDS, HERITAGE_DESCRIPTION, HERITAGE_FAQS } from "../lib/seo";

/** Shows image or a styled placeholder if the file is missing (onError). Uses WebP + blur-until-loaded. */
function HeritageImage({ src, alt, caption, className = "", width, height, imgClassName = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-[#065f46]/20 bg-primary/5 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-10 h-10 text-primary/30 mb-2" aria-hidden />
        <span className="text-primary/50 text-sm font-serif text-center px-3">{alt}</span>
        {caption && <span className="text-primary/40 text-xs italic mt-1">{caption}</span>}
      </div>
    );
  }
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      imgClassName={imgClassName}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function Heritage() {
  const [ogImage, setOgImage] = useState(null);
  useEffect(() => {
    getFirstApprovedMajlisImageUrl().then(setOgImage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="History of Cape Islamic Headwear"
        description={HERITAGE_DESCRIPTION}
        url="/heritage"
        image={ogImage || undefined}
        keywords={HERITAGE_SEO_KEYWORDS}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Heritage", url: "/heritage" }]}
        faqs={HERITAGE_FAQS}
        heritageArticle
        heritageAboutPage
        heritageCreativeWork
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16" role="main">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="History of Cape Islamic Headwear">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            History of Cape Islamic Headwear
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Tradition, identity, and the crown of the believer
          </motion.p>

          <motion.section
            className="space-y-6 text-primary/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-lg">
              Our story begins with <strong className="text-emerald-800">Tuan Guru</strong>—Imam Abdurahman Matebe Shah—the father of Islam in the Cape (Master Teacher; Imam Abdullah Kadi Abdus Salaam), who is buried at the <strong className="text-emerald-800">Tana Baru Cemetery</strong> in Cape Town. Islamic headwear here has been shaped by that legacy: centuries of faith, trade, and community. From the
              <Link to="/near/bo-kaap" className="text-primary font-semibold hover:text-accent hover:underline"> Bo-Kaap</Link> to the Northern and Southern suburbs, the
              <strong className="text-primary"> Winelands</strong>, and beyond, the Kufi, Taj, and Fez carry meanings that go far beyond fashion. See also <Link to="/near/athlone" className="text-accent hover:underline">Athlone</Link>.
            </p>
            <p>
              The <strong className="text-accent">Kufi</strong>—often called a prayer cap or namaz cap—is worn in salaah and daily life across the Cape and South Africa. The
              <strong className="text-primary"> Taj</strong> (crown) holds a special place in the
              <strong className="text-primary"> Naqshbandi</strong> tradition, where it symbolises devotion and spiritual lineage. The
              <strong className="text-primary"> Fez</strong> (Tarboush, Rumi hat) connects Cape Malay and Sufi heritage to Ottoman and North African roots.
            </p>
            <p>
              Cape Town&apos;s Muslim communities have preserved and evolved these styles, blending local identity with global Islamic craft. Today, the same care for quality and symbolism guides
              <Link to="/shop" className="text-accent hover:underline font-medium"> what we curate at Al-Ameen Caps</Link>—so that the crown of the believer continues to be honoured in every stitch and choice we offer.
            </p>
          </motion.section>

          {/* SEO Heart: Evolution of the Fez & Kufi — entity-rich, E-E-A-T aligned */}
          <motion.section
            className="mt-14 bg-secondary rounded-2xl border border-primary/10 p-6 sm:p-8 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            aria-labelledby="evolution-fez-heading"
          >
            <h2 id="evolution-fez-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-2">
              The Evolution of the Fez &amp; Kufi in the Cape
            </h2>
            <p className="font-serif text-lg text-emerald-800 mb-8">The Legacy of the Cape Fez: From Bo-Kaap to the Modern Day</p>

            <div className="space-y-6 text-primary/90 leading-relaxed">
              <p>
                The story of the Fez (or <strong>Tarboosh</strong>) in South Africa is inextricably linked to the resilience and identity of the <strong className="text-emerald-800">Cape Malay</strong> community. While its roots trace back to the <strong>Ottoman Empire</strong> and North Africa, the Fez found a unique home in the steep, cobbled streets of the <Link to="/near/bo-kaap" className="text-emerald-800 font-semibold hover:text-emerald-700 hover:underline">Bo-Kaap</Link>.
              </p>

              <h3 className="font-serif text-xl font-semibold text-primary mt-8 mb-2">A Symbol of Scholars and Resilience</h3>
              <p>
                When the first political exiles and scholars—most notably <strong className="text-emerald-800">Tuan Guru</strong>—established the foundations of Islam at the Cape, the headwear was more than a garment. It was a statement of faith and community. In the early days of the <strong className="text-emerald-800">Auwal Masjid</strong>, the traditional red Fez became a hallmark of the learned and the devout during <strong>Jumu&apos;ah</strong> and <strong>Salah</strong>.
              </p>

              <h3 className="font-serif text-xl font-semibold text-primary mt-8 mb-2">From the &quot;Kappie&quot; to the Modern Kufi</h3>
              <p>
                Over centuries, the tradition evolved. The high, stiff Fez often worn for formal occasions and weddings began to share space with more breathable, versatile designs. This gave rise to the Cape <strong>Kufi</strong> and <strong>Taqiyah</strong>—styles that maintained the dignity of the tradition while adapting to the South African climate.
              </p>

              <h3 className="font-serif text-xl font-semibold text-primary mt-8 mb-2">Why We Preserve the Craft</h3>
              <p>
                At Al-Ameen Caps, we see ourselves as custodians of this evolution. Our designs honour the lineage of the <strong>Essop</strong> and <strong>Rakiep</strong> families—from <strong>Imam Abdur-Raof</strong> and <strong>Imam Abdur-Rakieb</strong> to <strong>Ou Bappa</strong> at the <strong>Quawwatul Islam Mosque</strong> in Loop Street—rooted in the heritage of those who built the vibrant tapestry of Cape Town. Every stitch in our modern <Link to="/product/collection-1" className="text-emerald-800 font-semibold hover:text-emerald-700 hover:underline">Na&apos;lain Cap</Link> or breathable cotton <Link to="/shop" className="text-emerald-800 font-semibold hover:text-emerald-700 hover:underline">Taqiyah</Link> is a tribute to the craftsmen who walked before us.
              </p>
            </div>
          </motion.section>

          {/* A Legacy of Scholarship & Craft — family lineage, E-E-A-T / historical authority */}
          <motion.section
            className="mt-14 bg-secondary rounded-2xl border-2 border-[#065f46]/30 p-6 sm:p-8 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            aria-labelledby="legacy-heading"
          >
            <h2 id="legacy-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-6">
              A Legacy of Scholarship &amp; Craft
            </h2>
            <div className="space-y-6 text-primary/90 leading-relaxed" itemScope itemType="https://schema.org/Article">
              <p>
                <strong>Maternal lineage:</strong> Al-Ameen Caps carries direct descent from <span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">Tuan Guru</span></span> (<span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">Imam Abdurahman Matebe Shah</span></span>), the founding scholar of Islam at the Cape, via <span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">Asia Taliep (Oemie)</span></span>. This lineage connects our craft to the very establishment of the <strong>Auwal Masjid</strong> in the <Link to="/near/bo-kaap" className="text-[#065f46] font-semibold hover:underline">Bo-Kaap</Link> and the first generations of Cape Malay scholarship.
              </p>
              <p>
                <strong>Paternal lineage:</strong> Through the line of <span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">Sayed Abdurrahman Motura</span></span>, we honour a tradition of piety and leadership that has shaped Islamic life at the Cape for centuries. Together, these lineages inform every choice we make—from the <Link to="/shop" className="text-[#065f46] font-semibold hover:underline">Kufi</Link> and <Link to="/shop" className="text-[#065f46] font-semibold hover:underline">Fez</Link> we offer to the standards we hold for <strong>Jumu&apos;ah</strong> and <strong>Salah</strong>.
              </p>
            </div>
          </motion.section>

          {/* Founder's Note — full-width emerald tint; bridges heritage and mission (E-E-A-T) */}
          <motion.section
            className="mt-14 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none bg-emerald-50/30 border-y border-emerald-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.29 }}
            aria-labelledby="founder-note-heading"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
              <h2 id="founder-note-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary text-center mb-2">
                A Note from the Founder
              </h2>
              <p className="font-serif text-lg text-emerald-800 text-center mb-8">The Golden Thread</p>

              <div className="border-l-4 border-emerald-800 pl-6 sm:pl-8 space-y-5 text-primary/90 leading-relaxed">
                <p>
                  My journey is anchored in the light of my maternal grandmother, <strong className="text-emerald-800">Asia Taliep (Oemie)</strong>. She was the daughter of <strong className="text-emerald-800">Imam Achmat Taliep (Bappa)</strong> and the granddaughter of the great <strong className="text-emerald-800">Imam Mogamat Talaabodien (Ou Bappa)</strong>—the Patriarch of District Six. Our lineage reaches back to the royal scholarship of <strong className="text-emerald-800">Tuan Guru (Imam Abdullah)</strong>, Prince of Tidore and descendant of Sultan Saifuddin. These six generations of dignity are the fabric of Al-Ameen.
                </p>
                <p>
                  — <strong className="text-emerald-800">Taufeeq Essop</strong>
                </p>
              </div>

              <p id="al-kimya" className="mt-6 text-sm text-primary/70 border-l-2 border-emerald-600/50 pl-4">
                <strong className="text-primary">Al-Kimya Origin</strong> is a spiritual recovery companion—blending Sufi wisdom with therapeutic techniques to support spiritual recovery and mental well-being in our community.
              </p>

              <div className="mt-8 text-center">
                <p className="font-serif italic text-primary/90">With gratitude and purpose,</p>
                <p className="font-serif italic text-2xl md:text-3xl text-primary mt-1">Taufeeq Essop</p>
                <p className="text-primary/80 font-medium mt-1">Founder &amp; Director</p>
              </div>

              <div className="mt-10 text-center">
                <Link
                  to="/shop"
                  className="btn-primary px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center font-medium"
                >
                  Shop the Legacy
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Historical Story — staggered layout: 1700s → present */}
          <motion.section
            className="mt-14 space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            aria-labelledby="story-heading"
          >
            <h2 id="story-heading" className="font-serif text-2xl font-semibold text-primary mb-8 text-center sr-only">
              A Timeline of Cape Islamic Headwear
            </h2>

            {/* Timeline video — development from the 1600s */}
            <div className="max-w-4xl mx-auto">
              <p className="font-serif text-sm text-[#065f46] font-medium mb-3 text-center">Development over time · 1600s onward</p>
              <div className="rounded-xl border-2 border-[#065f46]/20 overflow-hidden bg-primary/5 shadow-lg">
                <video
                  className="w-full aspect-video object-contain"
                  src="/videos/heritage-timeline.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  width={1280}
                  height={720}
                  aria-label="Video showing the development of Cape Islamic heritage and headwear from the 1600s to the present"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="mt-2 text-sm text-primary/60 text-center italic">
                The journey of faith, scholarship, and craft from the 1600s to today.
              </p>
            </div>

            {/* Map: Places of origin and transportation routes to the Cape */}
            <figure className="max-w-4xl mx-auto mt-10 rounded-xl border-2 border-[#065f46]/15 bg-secondary/50 p-4 sm:p-6">
              <OptimizedImage
                src="/images/heritage/cape-slaves-routes-map.png"
                alt="Cape Slaves: Places of Origin and Main Transportation Routes (17th–19th centuries)—map showing flow from Africa and Asia to Cape Town."
                className="w-full rounded-lg"
                imgClassName="object-contain rounded-lg"
                width={1200}
                height={800}
                loading="lazy"
              />
              <figcaption className="mt-2 text-sm text-primary/60 italic text-center">
                Cape Slaves: Places of Origin and Main Transportation Routes (17th–19th centuries). (Historical map)
              </figcaption>
            </figure>

            {/* Row 1: Text left, image right — 1700s / Auwal / journey to Robben Island */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3 text-primary/90 leading-relaxed order-2 md:order-1">
                <p className="font-serif text-sm text-[#065f46] font-medium">1700s · Foundations</p>
                <p>
                  The first scholars and political exiles—including <strong>Tuan Guru</strong>—brought the Fez and the traditions of the <strong>Auwal Masjid</strong> to the <strong>Bo-Kaap</strong>. Headwear became a mark of faith and learning for <strong>Jumu&apos;ah</strong> and <strong>Salah</strong>.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <HeritageImage
                  src="/images/heritage/ships-cape-robben-island.png"
                  alt="Historic ships in Table Bay harbour: the kind of vessels that brought Tuan Guru and the first exiles to the Cape and Robben Island."
                  caption="Ships in Table Bay harbour—illustrative of the journey that brought Tuan Guru to the Cape and Robben Island."
                  className="aspect-[4/3] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={800}
                  height={600}
                />
                <p className="mt-2 text-sm text-primary/60 italic">
                  Ships in Table Bay harbour—illustrative of the journey that brought Tuan Guru to the Cape and Robben Island.
                </p>
              </div>
            </div>

            {/* Pull quote — emerald border */}
            <blockquote className="border-l-4 border-[#065f46] pl-6 py-2 my-8 text-primary/90 font-serif italic">
              &ldquo;The traditional red Fez became a hallmark of the learned and the devout.&rdquo;
            </blockquote>

            {/* Row 2: Image left, text right — 1800s / evolution / the fez back then */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <HeritageImage
                  src="/images/heritage/fez-cape-malay-archival.png"
                  alt="The fez back then: archival photo of Cape Malay Muslims in traditional dress and fezzes."
                  caption="The fez back then — Abu Bakr Efendi (c) left a remarkable legacy among the Muslims living in Cape Town. (Archival photo)"
                  className="aspect-[4/3] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={800}
                  height={600}
                />
                <p className="mt-2 text-sm text-primary/60 italic">
                  The fez back then — Abu Bakr Efendi (c) left a remarkable legacy among the Muslims living in Cape Town. (Archival photo)
                </p>
              </div>
              <div className="space-y-3 text-primary/90 leading-relaxed">
                <p className="font-serif text-sm text-[#065f46] font-medium">1800s · Evolution</p>
                <p>
                  The high, stiff Fez worn for formal occasions and weddings began to share space with breathable, versatile designs—the Cape <strong>Kufi</strong> and <strong>Taqiyah</strong>—that maintained dignity while adapting to the South African climate.
                </p>
              </div>
            </div>

            {/* Row 3: Text left, image right — present day */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3 text-primary/90 leading-relaxed order-2 md:order-1">
                <p className="font-serif text-sm text-[#065f46] font-medium">Present · Cape Town</p>
                <p>
                  Today, Al-Ameen Caps continues this legacy in Cape Town. Every <Link to="/product/collection-1" className="text-[#065f46] font-semibold hover:underline">Na&apos;lain Cap</Link> and <Link to="/shop" className="text-[#065f46] font-semibold hover:underline">Kufi</Link> we offer is a tribute to the craftsmen and scholars who walked before us.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Link to="/shop" className="block group">
                  <HeritageImage
                    src="/images/heritage/present-cape-town.png"
                    alt="Ottoman fez—traditional red fez with tassel. Shop our Fez collection at Al-Ameen Caps."
                    caption="Today: the crown of the believer in Cape Town and beyond."
                    className="aspect-[4/3] w-full rounded-lg border-2 border-[#065f46]/20 object-cover group-hover:border-accent/50 transition-colors"
                    width={800}
                    height={600}
                  />
                  <p className="mt-2 text-sm text-primary/60 italic group-hover:text-accent transition-colors">
                    Ottoman fez—today&apos;s crown of the believer. <span className="font-medium text-accent">Shop the collection →</span>
                  </p>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Heritage Portraits — Golden Thread and family */}
          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            aria-labelledby="heritage-portraits-heading"
          >
            <h2 id="heritage-portraits-heading" className="font-serif text-2xl font-semibold text-primary mb-2">Heritage Portraits</h2>
            <p className="text-primary/80 text-sm mb-6 max-w-xl">
              From the archive: Sultan Saifuddin of Tidore, Sunan Gunung Jati, Tuan Guru (Imam Abdullah Kadi Abdus Salaam), Imam Achmat (Bappa), Asia Taliep (Oemie), and Imam Ebrahiem Talaboedien with his grandson Imam Abdulatiief Talaaboedien.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <HeritageImage
                  src="/images/heritage/sultan-saifuddin-tidore.png"
                  alt="Sultan Saifuddin (Sayfoedien), King of Tidore — oil portrait."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Sultan Saifuddin of Tidore</p>
                <p className="text-xs text-primary/60 italic">Sayfoedien, King of Tidore</p>
              </div>
              <div>
                <HeritageImage
                  src="/images/heritage/sunan-gunung-jati.png"
                  alt="Sunan Gunung Jati (Syarif Hidayatullah) — portrait."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Sunan Gunung Jati</p>
                <p className="text-xs text-primary/60 italic">Syarif Hidayatullah</p>
              </div>
              <div>
                <HeritageImage
                  src="/images/heritage/tuan-guru-portrait.png"
                  alt="Tuan Guru (Imam Abdullah Kadi Abdus Salaam), founding scholar of Islam at the Cape — white turban, patterned shawl, walking stick."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Tuan Guru</p>
                <p className="text-xs text-primary/60 italic">Imam Abdullah Kadi Abdus Salaam</p>
              </div>
              <div>
                <HeritageImage
                  src="/images/heritage/imam-achmat-talaabodien-bappa.png"
                  alt="Imam Achmat Talaabodien (Bappa), known as Imam Taliep — archival portrait."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Imam Achmat (Bappa)</p>
                <p className="text-xs text-primary/60 italic">Imam Taliep</p>
              </div>
              <div>
                <HeritageImage
                  src="/images/heritage/asia-taliep-oemie.png"
                  alt="Asia Taliep (Oemie) — the heart of the Al-Ameen legacy, daughter of Imam Achmat (Bappa)."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Asia Taliep (Oemie)</p>
                <p className="text-xs text-primary/60 italic">The heart of the Al-Ameen legacy</p>
              </div>
              <div>
                <HeritageImage
                  src="/images/heritage/ebrahim-abdul-latief-talaabodien.png"
                  alt="Die Kaapenaar Imam Ebrahiem Talaboedien and his grandson Imam Abdulatiief Talaaboedien."
                  className="aspect-[3/4] w-full rounded-lg border-2 border-[#065f46]/20 object-cover"
                  width={400}
                  height={533}
                />
                <p className="mt-2 text-sm text-primary/70 font-medium">Imam Ebrahiem &amp; Imam Abdulatiief</p>
                <p className="text-xs text-primary/60 italic">Grandfather and grandson</p>
              </div>
            </div>
          </motion.section>

          {/* Lineage Gallery — Tuan Guru, fez, ships (visual journey) */}
          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            aria-labelledby="lineage-gallery-heading"
          >
            <h2 id="lineage-gallery-heading" className="font-serif text-2xl font-semibold text-primary mb-2">Lineage Gallery</h2>
            <p className="text-primary/80 text-sm mb-6 max-w-xl">
              A visual journey through Cape Malay and Islamic headwear heritage—from <strong>Tuan Guru</strong> and the <strong>Auwal Masjid</strong> to the fez in Cape Town and the voyage that brought tradition to our shores.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <HeritageImage
                src="/images/heritage/tuan-guru-portrait.png"
                alt="Portrait of Tuan Guru (Imam Abdullah Kadi Abdus Salaam), founding scholar of Islam at the Cape."
                className="aspect-[4/3] w-full rounded-lg border border-primary/20 object-cover"
                width={400}
                height={300}
              />
              <HeritageImage
                src="/images/heritage/fez-cape-malay-archival.png"
                alt="Cape Malay Muslims in traditional dress and fezzes—archival photo of community and headwear."
                className="aspect-[4/3] w-full rounded-lg border border-primary/20 object-cover"
                width={400}
                height={300}
              />
              <HeritageImage
                src="/images/heritage/ships-cape-robben-island.png"
                alt="Ships in Table Bay: the journey that brought Tuan Guru and the first exiles to the Cape and Robben Island."
                className="aspect-[4/3] w-full rounded-lg border border-primary/20 object-cover"
                width={400}
                height={300}
              />
            </div>
          </motion.section>

          {/* From the Archive — Fez, mosques, katil, family (entity-rich for SEO) */}
          <motion.section
            className="mt-14 pt-10 border-t-2 border-[#065f46]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            aria-labelledby="archive-heading"
          >
            <h2 id="archive-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-2">From the Archive</h2>
            <p className="text-primary/80 text-sm mb-8 max-w-2xl">
              Archival photographs of the <strong>Malay Quarter</strong>, <strong>Chiappini Street Mosque</strong>, and Cape Malay tradition—the fez, the katil, and the Imams who shaped our community.
            </p>

            {/* Fez in the Malay Quarter — Ideroos and Abubakar Dantu */}
            <div className="mb-12">
              <h3 id="fez-malay-quarter-heading" className="font-serif text-xl font-semibold text-primary mb-3">Fez in the Malay Quarter</h3>
              <figure className="max-w-xl rounded-xl overflow-hidden border-2 border-[#065f46]/20 shadow-sm">
                <HeritageImage
                  src="/images/heritage/fez-malay-quarter-old-school.png"
                  alt="Ideroos and Abubakar Dantu at an old-fashioned window in the Malay Quarter, wearing fezzes."
                  className="w-full object-cover"
                  width={640}
                  height={480}
                />
                <figcaption className="p-3 bg-primary/5 text-sm text-primary/70 italic">
                  Ideroos and Abubakar Dantu at an old-fashioned window in the Malay Quarter. Forebears of the Dantu family. (Archival photo)
                </figcaption>
              </figure>
            </div>

            {/* Old Chiappini Street Mosque */}
            <div className="mb-12">
              <h3 id="chiappini-mosque-heading" className="font-serif text-xl font-semibold text-primary mb-3">Old Chiappini Street Mosque</h3>
              <p className="text-primary/80 text-sm mb-4 max-w-2xl">
                The historic <strong>Chiappini Street Mosque</strong> in the <strong>Malay Quarter</strong>—ceremonies, Imams, and the fez as a mark of dignity.
              </p>
              <div className="max-w-2xl space-y-6">
                <figure className="rounded-xl overflow-hidden border-2 border-[#065f46]/20 shadow-sm">
                  <HeritageImage
                    src="/images/heritage/chiappini-street-mosque.png"
                    alt="Interior of the old Chiappini Street mosque during a ceremony with a bridegroom and four Imams."
                    className="w-full object-cover"
                    width={800}
                    height={600}
                  />
                  <figcaption className="p-3 bg-primary/5 text-sm text-primary/70 italic">
                    A bridegroom with Imams Achmat Jamja, Sayed Saafi Alwia, Bassier, and Ishmael Moos. (Archival photo)
                  </figcaption>
                </figure>
                <figure className="max-w-md rounded-xl overflow-hidden border-2 border-[#065f46]/20 shadow-sm">
                  <HeritageImage
                    src="/images/heritage/imam-chiappini-street-mosque.png"
                    alt="An Imam of the old Chiappini Street mosque — traditional headwear and prayer beads."
                    className="w-full object-cover"
                    width={448}
                    height={336}
                  />
                  <figcaption className="p-3 bg-primary/5 text-sm text-primary/70 italic">
                    An Imam of the old Chiappini Street mosque. (Archival photo)
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* To the Burial Ground — katil */}
            <div className="mb-12">
              <h3 id="katil-burial-heading" className="font-serif text-xl font-semibold text-primary mb-3">To the Burial Ground</h3>
              <figure className="max-w-2xl rounded-xl overflow-hidden border-2 border-[#065f46]/20 shadow-sm">
                <HeritageImage
                  src="/images/heritage/malay-bearers-katil-burial.png"
                  alt="Malay bearers carrying the katil to the burial ground. No vehicles are used."
                  className="w-full object-cover"
                  width={800}
                  height={600}
                />
                <figcaption className="p-3 bg-primary/5 text-sm text-primary/70 italic">
                  Malay bearers carrying the katil to the burial ground. No vehicles are used. (Archival photo)
                </figcaption>
              </figure>
            </div>

            {/* Family Portrait — Imam Ebrahiem and Imam Abdulatiief */}
            <div>
              <h3 id="family-portrait-heading" className="font-serif text-xl font-semibold text-primary mb-3">Family Portrait</h3>
              <figure className="max-w-2xl mx-auto rounded-xl overflow-hidden border-2 border-[#065f46]/20 shadow-sm">
                <HeritageImage
                  src="/images/heritage/ebrahim-abdul-latief-talaabodien.png"
                  alt="Die Kaapenaar Imam Ebrahiem Talaboedien and his grandson Imam Abdulatiief Talaaboedien—archival portrait."
                  caption="Die Kaapenaar Imam Ebrahiem Talaboedien and his grandson Imam Abdulatiief Talaaboedien. (Archival photo)"
                  className="aspect-[4/3] w-full object-cover"
                  width={800}
                  height={600}
                />
                <figcaption className="p-3 bg-primary/5 text-sm text-primary/70 italic">
                  Die Kaapenaar Imam Ebrahiem Talaboedien and his grandson Imam Abdulatiief Talaaboedien. (Archival photo)
                </figcaption>
              </figure>
            </div>
          </motion.section>

          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2 className="font-serif text-2xl font-semibold text-primary mb-4">From the Cape to the World</h2>
            <p className="text-primary/90 leading-relaxed mb-4">
              The Cape has long been a meeting point of cultures—from <strong>Tana Baru</strong> and the <strong>Auwal Masjid</strong> to the <strong>Chiappini Street Mosque</strong> and the <strong>Malay Quarter</strong>. Islamic headwear here reflects that diversity: the soft Kufi for daily wear and prayer, the structured Taj for scholars and those in the Naqshbandi path, the <Link to="/product/collection-1" className="text-emerald-800 font-semibold hover:text-emerald-700 hover:underline">Na&apos;lain cap</Link> with its emblematic symbolism, and the <Link to="/shop" className="text-emerald-800 font-semibold hover:text-emerald-700 hover:underline">Fez</Link> for occasions and tradition. Each style carries the weight of heritage and the intention of the wearer.
            </p>
            <p className="text-primary/90 leading-relaxed">
              At Al-Ameen Caps, our Lead Curator draws on this history to select and quality-check every piece—so that you receive headwear that is both authentic to tradition and built to last. Learn more
              <Link to="/about" className="text-accent hover:underline font-medium"> about our approach and our artisan process</Link>.
            </p>
          </motion.section>

          {/* Digital Majlis — interactive wall + submission form */}
          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            aria-labelledby="digital-majlis-heading"
          >
            <h2 id="digital-majlis-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-2 scroll-mt-24">
              The Digital Majlis
            </h2>
            <p className="text-primary/80 mb-8 max-w-2xl">
              Rooted in the legacy of <strong className="text-primary">Tuan Guru</strong>, our mission is to discover the specific branches of the Taliep and Rakiep families—from Imam Mogamat Talaabodien (Ou Bappa)&apos;s 80+ branches to every thread of the Golden Thread. Submit your ancestor&apos;s story and photo; once verified, it appears on the wall for the family to see and add memories.
            </p>
            <div className="grid lg:grid-cols-[minmax(340px,1fr)_2fr] gap-8">
              <div className="min-w-0">
                <MajlisForm />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-semibold text-primary mb-4">The Wall</h3>
                <p className="text-primary/60 text-sm mb-4">
                  Approved ancestor photos and stories appear here. Once you submit and we verify, your contribution shows on the wall for the family to see.
                </p>
                <MajlisWall />
              </div>
            </div>
          </motion.section>

          {/* The Living Tree — hierarchical lineage (parent_id). Future Phase: Full SVG tree. */}
          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.37 }}
            aria-labelledby="living-tree-heading"
          >
            <h2 id="living-tree-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-2">
              The Living Tree
            </h2>
            <p className="text-primary/80 mb-4 max-w-2xl">
              <strong className="text-primary">Tuan Guru</strong> sits at the root (Level 0). His grandson, <strong className="text-primary">Imam Mogamat Talaabodien (Ou Bappa)</strong>, and his son, <strong className="text-primary">Imam Achmat (Bappa)</strong>, lead directly to <strong className="text-primary">Asia Taliep (Oemie)</strong>. Every branch here is a verified thread of our shared history.
            </p>
            <LivingTree />
          </motion.section>

          {/* Carry the Legacy — CTA to collections */}
          <motion.section
            className="mt-14 bg-secondary rounded-2xl border-2 border-[#065f46]/30 p-8 sm:p-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            aria-labelledby="carry-legacy-heading"
          >
            <h2 id="carry-legacy-heading" className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-3">
              Carry the Legacy
            </h2>
            <p className="text-primary/80 mb-6 max-w-xl mx-auto">
              Honour the tradition with handcrafted headwear for <strong>Jumu&apos;ah</strong>, <strong>Salah</strong>, and <strong>Eid</strong>. Shop our Na&apos;lain and Kufi collections.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/product/collection-1"
                className="btn-outline-contrast px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center font-medium"
              >
                Na&apos;lain Cap
              </Link>
              <Link
                to="/shop"
                className="btn-primary px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center font-medium"
              >
                Kufi &amp; Fez Collection
              </Link>
            </div>
          </motion.section>

          {/* Emerald Star motif — ties to Featured Reviews / community voice */}
          <motion.section
            className="mt-14 pt-10 flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            aria-label="Community recognition"
          >
            <div className="flex items-center gap-1 text-emerald-800" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-emerald-800" aria-hidden />
              ))}
            </div>
            <p className="font-serif text-sm text-primary/70">Rated by our community</p>
          </motion.section>

          {/* FAQ — entity-rich for SEO and FAQPage schema (SERP rich results) */}
          <motion.section
            className="mt-14 pt-10 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            aria-labelledby="heritage-faq-heading"
          >
            <h2 id="heritage-faq-heading" className="font-serif text-2xl font-semibold text-primary mb-6">
              Frequently asked questions
            </h2>
            <dl className="space-y-6">
              {HERITAGE_FAQS.map((faq, i) => (
                <div key={i} className="border-b border-primary/10 pb-6 last:border-0">
                  <dt className="font-semibold text-primary mb-1">{faq.question}</dt>
                  <dd className="text-primary/80 text-sm leading-relaxed">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </motion.section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
