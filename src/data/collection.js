// Al-Ameen Caps – products to display (used when Supabase has no products)
// Image mapping (original labels): cap-03=Nalain, cap-08=Afgani/Winter, cap-04=Prayer, cap-05=Red Velvet,
// cap-09=Ornate Taj, cap-07=Turban/Rumal, cap-06=Navy, cap-12=Military, cap-14=perfume placeholder

/** Hardwired id → filename so images always load from same origin (no API/CORS). */
export const COLLECTION_IMAGE_FILENAMES = {
  "collection-1": "nalain-cap.png",
  "collection-2": "afgani-star-cap.png",
  "collection-3": "saqib-shami-cap.png",
  "collection-4": "azhari-hard-cap.png",
  "collection-5": "naqshbandi-taj.png",
  "collection-6": "luxury-arabic-rumal.png",
  "collection-7": "special-ashrafi-taj.png",
  "collection-8": "geuvara-military-cap.png",
  "collection-9": "al-hassan-perfume.png",
  "collection-10": "mufti-cap.png",
  "collection-11": "ertugral-winter-cap.png",
  "collection-12": "royal-ottoman-fez.png",
  "collection-13": "emerald-sultan-crown.png",
  "collection-14": "turkish-naqshbandi-taj.png",
};

const IMAGE_BASE = "https://alameencaps.com";

/** Returns image URL. Hardcoded base, no env. No cache-bust param so browser can cache. */
export function getCollectionImageUrl(product) {
  if (!product) return null;
  const id = product.id != null ? String(product.id) : product.sku != null ? String(product.sku) : "";
  const filename = COLLECTION_IMAGE_FILENAMES[id] || (id.startsWith("collection-") ? null : null);
  if (!filename) return null;
  return `${IMAGE_BASE}/collection/${filename}`;
}

export const COLLECTION_PRODUCTS = [
  {
    id: "collection-1",
    name: "Na'lain Cap – Premium Nalain Kufi",
    quantityAvailable: 50,
    stockQuantity: 50,
    price: 140,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Na'lain Premium Cap — Signature Collection\n\nCrafted for those who carry tradition with quiet confidence, the Na'lain Premium Cap blends timeless Islamic heritage with refined modern craftsmanship.\n\nInspired by sacred geometry and classical artistry, the elegant embroidered motif crowns a cap designed for comfort, dignity, and everyday wear — whether for Jumu'ah, special gatherings, or daily devotion.\n\nEach piece reflects meticulous attention to detail: clean stitching, breathable fabric, and a structured form that maintains its shape while offering all-day comfort.\n\nWhy customers love it\n• Premium woven construction for durability and comfort\n• Elegant embroidered design inspired by sacred tradition\n• Lightweight and breathable for daily wear\n• Maintains shape and structure over time\n• Suitable for masjid, events, and everyday use\n\nMore than just headwear, the Na'lain Premium Cap is a statement of identity — honoring heritage while embracing modern style.\n\nWear it with dignity. Carry tradition with pride.\n\nHeritage Note: This Premium Nalain Cap is a traditional kufi rooted in Cape Malay Heritage — a Jumu'ah ready, Biedaied-inspired piece handcrafted in Cape Town for those who want their crown to reflect local dignity.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/nalain-cap.png",
    category: "Caps",
  },
  {
    id: "collection-2",
    name: "Afgani Star Cap – Traditional Kufi",
    quantityAvailable: 24,
    stockQuantity: 24,
    price: 140,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Afgani Star Cap — Premium Collection\n\nDesigned for men who value heritage and refined simplicity, the Afgani Star Cap brings together classic Afghan-inspired style with modern craftsmanship.\n\nIts structured form, soft premium fabric, and clean finish make it ideal for Jumu'ah, gatherings, or daily wear. Available in a range of elegant tones, each cap complements both traditional and modern attire.\n\nBuilt for comfort and durability, the Afgani Star Cap maintains its shape while remaining breathable for all-day use.\n\nWhy customers choose it\n• Premium fabric with soft, durable finish\n• Classic structured Afghan design\n• Comfortable and breathable for daily wear\n• Maintains shape over time\n• Suitable for masjid, events, and everyday style\n\nMore than headwear, the Afgani Star Cap reflects dignity, heritage, and confident style.\n\nHeritage Note: This traditional kufi style cap is Jumu'ah ready and speaks to Cape Malay Heritage, offering a handcrafted-in-Cape-Town alternative to generic headwear.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/afgani-star-cap.png",
    category: "Caps",
  },
  {
    id: "collection-3",
    name: "Saqib Shami Cap – Heritage Crown",
    quantityAvailable: 7,
    stockQuantity: 7,
    price: 660,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Saqib Shami Cap — Royal Premium Collection\n\nThe Saqib Shami Cap is crafted for those who appreciate regal tradition and commanding elegance. Inspired by classical Shami ceremonial headwear, this cap carries a presence that instantly elevates formal attire.\n\nIts layered construction, intricate weaving, and rich crown detailing reflect royal heritage, making it a perfect choice for weddings, special gatherings, Eid occasions, and distinguished events.\n\nDesigned with premium materials, it delivers both comfort and structure, ensuring the cap maintains its dignified shape while remaining comfortable for long wear.\n\nWhy customers choose it\n• Royal ceremonial design with bold visual presence\n• Rich crown detailing that stands out in formal settings\n• Structured layered build for a distinguished profile\n• Ideal for weddings, Eid, and special occasions\n• A statement piece for those who value tradition and prestige\n\nMore than headwear, the Saqib Shami Cap is a symbol of heritage, honor, and royal style.\n\nHeritage Note: This heritage crown pairs perfectly with Cape Malay Heritage occasions, offering a Jumu'ah ready statement piece handcrafted in Cape Town for men who value dignified presence.\n\n🛒 Limited stock available — secure yours today.",
    imageURL: "/collection/saqib-shami-cap.png",
    category: "Caps",
  },
  {
    id: "collection-4",
    name: "Azhari Hard Cap – Scholar's Kufi",
    quantityAvailable: 0,
    stockQuantity: 0,
    price: 600,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Azhari Hard Cap — Scholar's Collection\n\nThe Azhari Hard Cap reflects the timeless scholarly tradition associated with the great centers of Islamic learning. Recognized for its clean structure and dignified form, this cap is designed for those who carry knowledge, leadership, and tradition with pride.\n\nIts firm construction maintains a sharp, elegant profile, making it ideal for imams, students of knowledge, and formal religious gatherings. The classic color contrast further enhances its distinguished appearance.\n\nCrafted for durability and comfort, the cap retains its shape while remaining suitable for extended wear.\n\nWhy customers choose it\n• Iconic Azhari-inspired scholarly design\n• Firm structured build for a dignified appearance\n• Ideal for imams, scholars, and formal religious occasions\n• Durable construction that keeps its shape\n• A respected symbol of knowledge and tradition\n\nA cap that represents scholarship, dignity, and timeless Islamic heritage.\n\nHeritage Note: This scholar's kufi honours Cape Malay Heritage and the Biedaied tradition of dressing beautifully for Jumu'ah, with each pre-order piece handcrafted in Cape Town.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/azhari-hard-cap.png",
    category: "Caps",
  },
  {
    id: "collection-5",
    name: "Naqshbandi Taj – Cape Heritage",
    quantityAvailable: 7,
    stockQuantity: 7,
    price: 990,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Naqshbandi Taj — Spiritual Heritage Collection\n\nThe Naqshbandi Taj represents spiritual refinement and timeless Sufi tradition. Designed with elegance and simplicity, this Taj reflects humility, discipline, and inner dignity — values long associated with the Naqshbandi spiritual path.\n\nIts rounded, layered structure and subtle detailing create a calm yet distinguished presence, making it ideal for spiritual gatherings, dhikr assemblies, and special religious occasions.\n\nCrafted for comfort and graceful appearance, the Taj maintains its form while offering light, breathable wear for extended use.\n\nWhy customers choose it\n• Traditional Taj design inspired by Sufi heritage\n• Elegant layered form symbolizing spiritual discipline\n• Ideal for gatherings, dhikr, and sacred occasions\n• Lightweight and comfortable for extended wear\n• A symbol of humility and spiritual identity\n\nMore than headwear, the Naqshbandi Taj represents tradition, devotion, and inner refinement.\n\nHeritage Note: This Naqshbandi Taj connects Cape Malay Heritage with classical Sufi lineage and is Jumu'ah ready for dhikr and gatherings, carefully handcrafted in Cape Town.\n\n🛒 Limited pieces available — secure yours today.",
    imageURL: "/images/WhatsApp Image 2026-03-12 at 2.15.40 AM.jpeg",
    category: "Taj",
  },
  {
    id: "collection-6",
    name: "Luxury Arabic Rumal – Cape Malay",
    quantityAvailable: 12,
    stockQuantity: 12,
    price: 260,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Luxury Arabic Rumal — Classic Desert Collection\n\nThe Luxury Arabic Rumal blends timeless Middle Eastern tradition with modern versatility. Known for its distinctive woven patterns and flowing tassel finish, the rumal has long been worn as both a practical and stylish garment across the Arab world.\n\nCrafted from soft, breathable fabric, it provides comfort in warm and cool conditions while adding character to both traditional and contemporary outfits. Whether worn around the neck, over the shoulders, or styled as headwear, it offers effortless elegance.\n\nWhy customers choose it\n• Authentic Arabic woven pattern with premium finish\n• Soft, breathable fabric suitable for all seasons\n• Versatile styling for daily wear or travel\n• Adds character to both traditional and modern attire\n• Durable weave with elegant tassel detailing\n\nA timeless accessory that combines function, culture, and refined style.\n\nHeritage Note: Paired with a Traditional Kufi or Premium Nalain Cap, this rumal supports a full Jumu'ah ready look that honours Cape Malay Heritage while remaining handcrafted in Cape Town.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/luxury-arabic-rumal.png",
    category: "Rumal",
  },
  {
    id: "collection-7",
    name: "Special Ashrafi Taj – Heritage",
    quantityAvailable: 2,
    stockQuantity: 2,
    price: 1600,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "The Special Ashrafi Taj is a rare prestige piece, crafted for those who appreciate deep spiritual heritage and ceremonial elegance. Handwoven by master craftsmen from the Ansaar family, descendants connected to the noble household of Ahlul Bayt (SAW), this Taj carries both artistry and legacy.\n\nIts rich layered wrapping and elevated crown design create a commanding yet graceful presence, traditionally worn during sacred gatherings, Mawlid, spiritual assemblies, and distinguished occasions.\n\nEach piece reflects meticulous handcraftsmanship, resulting in a Taj that embodies respect, devotion, and noble tradition.\n\nWhy collectors and devotees choose it\n• Handwoven by master craftsmen of the Ansaar lineage\n• Ceremonial Ashrafi design reserved for special occasions\n• Rich layered construction symbolizing honor and tradition\n• Prestige piece rarely available in the open market\n• Ideal for Mawlid, spiritual gatherings, and ceremonial wear\n\nMore than headwear, the Special Ashrafi Taj represents lineage, craftsmanship, and spiritual prestige.\n\nHeritage Note: This Taj sits at the heart of Religious Headwear for the Cape, echoing Cape Malay Heritage and offering a Jumu'ah ready, handcrafted-in-Cape-Town piece for truly special occasions.\n\nPersonal Edition: One 60cm founder&apos;s piece is reserved as a personal edition and not available for general sale.\n\n🛒 Only one piece available — a rare addition for those who value heritage and distinction.",
    imageURL: "/images/WhatsApp Image 2026-03-12 at 2.15.44 AM.jpeg",
    category: "Taj",
  },
  {
    id: "collection-8",
    name: "Guevara Military Cap – Street Heritage",
    quantityAvailable: 7,
    stockQuantity: 7,
    price: 260,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Guevara Military Cap — Cuban-Afghan Hybrid Collection\n\nInspired by the iconic revolutionary style associated with Che Guevara and blended with traditional Afghan Pakol craftsmanship, the Guevara Military Cap delivers a bold Cuban-Afghan hybrid look. Designed for men who appreciate heritage with a strong, modern edge, this cap makes a confident statement wherever it's worn.\n\nCrafted from soft yet durable fabric, the structured military profile meets the comfort of the classic rolled Pakol form, while the metal star insignia reinforces its rugged, commanding appeal. Perfect for casual wear, travel, and outdoor styling.\n\nWhy customers choose it\n• Unique Cuban-Afghan hybrid military design\n• Signature star insignia for a bold visual statement\n• Soft, warm fabric suited for cooler conditions\n• Comfortable rolled construction for daily wear\n• Ideal for casual, travel, and street styling\n\nA cap that merges tradition, resilience, and unmistakable character.\n\nHeritage Note: For brothers who want a street-ready cap with a nod to Cape Malay Heritage, this piece can sit alongside your Traditional Kufi collection as a casual, handcrafted-in-Cape-Town option.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/geuvara-military-cap.png",
    category: "Caps",
  },
  {
    id: "collection-9",
    name: "Al Hassan Perfumes – Jumu'ah Ready",
    quantityAvailable: 0,
    stockQuantity: 0,
    price: 140,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Al Hassan Perfumes — Alcohol-Free Collection\n\nDiscover the richness of Arabian fragrance with Al Hassan Alcohol-Free Perfumes, crafted for long-lasting scent and everyday elegance. Perfect for daily wear, prayer, and special occasions.\n\nAvailable Scents\n\nWhite Oudh – Smooth, refined oud with a soft woody warmth, ideal for daily elegance.\n\nAmeer Al Oudh – Deep, rich, and powerful oud with warm amber tones, perfect for evening and special occasions.\n\nBaccarat Rouge Style – Modern, sweet, and musky notes for a bold, contemporary signature scent.\n\nWhy customers choose it\n• Alcohol-free and skin-friendly\n• Long-lasting fragrance\n• Perfect for daily and occasion wear\n• Elegant, gift-ready presentation\n\nHeritage Note: Paired with a Premium Nalain Cap or Traditional Kufi, these scents complete a Jumu'ah ready look that reflects Cape Malay Heritage and the dignity of being properly Biedaied.\n\n🛒 Choose your signature scent today.",
    imageURL: "/collection/al-hassan-perfume.png",
    category: "Perfumes",
  },
  {
    id: "collection-10",
    name: "Mufti Cap – Jumu'ah Ready Kufi",
    quantityAvailable: 12,
    stockQuantity: 12,
    price: 200,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Mufti Cap — Premium Collection\n\nThe Mufti Premium Cap combines classic scholarship style with refined embroidery, creating a cap suited for both formal and everyday wear. Designed with rich detailing and premium stitching, it offers a dignified look while remaining comfortable throughout the day.\n\nAvailable in striking red, black, and gold variations, each cap adds elegance to traditional attire while maintaining a clean, structured profile.\n\nWhy customers choose it\n• Detailed embroidery with premium finish\n• Comfortable and breathable for daily wear\n• Structured design that keeps its shape\n• Ideal for masjid, gatherings, and formal occasions\n• Available in rich, elegant color options\n\nHeritage Note: This Mufti cap is a Jumu'ah ready Traditional Kufi that pairs with the Premium Nalain Cap range, handcrafted in Cape Town and rooted in Cape Malay Heritage for a true Biedaied appearance.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/mufti-cap.png",
    category: "Caps",
  },
  {
    id: "collection-11",
    name: "Ertugral Winter Cap – Heritage Warrior",
    quantityAvailable: 0,
    stockQuantity: 0,
    price: 660,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Ertugral Winter Cap — Qadiriyah Collection\n\nInspired by the legendary Ertugral style and linked to Qadiriyah heritage aesthetics, this Ertugral Winter Cap combines rugged tradition with winter-ready craftsmanship. Its conical leather structure and warm faux-fur brim create a bold, commanding look while offering excellent cold-weather protection.\n\nDesigned for outdoor wear and winter gatherings, the cap blends historical warrior style with modern comfort, making it both practical and distinctive.\n\nWhy customers choose it\n• Ertugral-inspired winter warrior design\n• Durable leather finish with warm fur-lined brim\n• Provides warmth and comfort in cold conditions\n• Distinctive emblem detailing for added character\n• Ideal for winter wear and outdoor styling\n\nA winter cap that carries strength, heritage, and unmistakable presence.\n\nHeritage Note: This winter crown complements your Religious Headwear collection for colder days, giving Cape Town brothers a Jumu'ah ready, handcrafted nod to classical warrior heritage.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/images/WhatsApp Image 2026-03-12 at 2.15.45 AM (1).jpeg",
    category: "Caps",
  },
  {
    id: "collection-12",
    name: "Royal Ottoman Fez – Cape Malay",
    quantityAvailable: 2,
    stockQuantity: 2,
    price: 560,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "Royal Ottoman Fez — Heritage Collection\n\nThe Royal Ottoman Fez is a timeless symbol of dignity and classical Ottoman elegance. Crafted from premium velvet with its signature black tassel, this fez delivers a refined presence suited for ceremonial wear, formal gatherings, and cultural occasions.\n\nMade with exceptional craftsmanship and durable construction, this is among the finest quality fez caps available — designed to maintain its shape and beauty for years, often lasting a lifetime with proper care.\n\nWhy customers choose it\n• Premium velvet finish with classic Ottoman design\n• Durable, structured build for long-term use\n• Elegant tassel detail completing the traditional look\n• Ideal for ceremonies, events, and cultural attire\n• A timeless piece that never goes out of style\n\nA fez that carries history, elegance, and lasting quality.\n\nHeritage Note: This Royal Ottoman Fez sits naturally within Religious Headwear for Cape Malay Heritage, offering a Jumu'ah ready and ceremonial option that is finished and checked by hand in Cape Town.\n\n🛒 Limited stock available — add yours to cart today.",
    imageURL: "/collection/royal-ottoman-fez.png",
    category: "Caps",
  },
  {
    id: "collection-13",
    name: "Emerald Sultan Crown – Premium",
    quantityAvailable: 1,
    stockQuantity: 1,
    price: 840,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "A symbol of dignity and refined tradition. The Emerald Sultan Crown features a deep emerald-green velvet top, detailed with elegant white radial stitching and a classic central button finish. The crisp white structured base creates a powerful contrast, giving the piece a royal and commanding presence.\n\nDesigned for men who carry themselves with confidence and honour, this cap is perfect for Jumu'ah, Eid, special gatherings, or formal occasions. A timeless statement of faith, prestige, and craftsmanship.\n\nHeritage Note: This premium crown is Jumu'ah ready and speaks directly to Cape Malay Heritage, giving you a handcrafted-in-Cape-Town alternative to mass-produced occasion headwear.\n",
    imageURL: "/images/WhatsApp Image 2026-03-12 at 2.15.41 AM (1).jpeg",
    category: "Caps",
  },
  {
    id: "collection-14",
    name: "Turkish Naqshbandi Taj – Spiritual Lineage",
    quantityAvailable: 6,
    stockQuantity: 6,
    price: 960,
    lastmod: "2026-03-12",
    changefreq: "daily",
    description:
      "A powerful expression of spiritual lineage and refined tradition. The Turkish Naqshbandi Taj is meticulously wrapped with precision-folded layers, forming a structured and commanding silhouette rooted in classical Turkish and Naqshbandi heritage.\n\nAvailable in timeless shades of deep black, pure white, and rich emerald green, each Taj reflects balance, discipline, and inner strength. The clean, symmetrical wrapping represents order and spiritual focus, while the firm construction ensures lasting shape and dignified comfort throughout the day.\n\nIdeal for scholars, seekers, and men of presence, this Taj is suited for Jumu'ah, Eid, nikah ceremonies, dhikr gatherings, and formal spiritual occasions. It is not merely worn—it is carried with intention.\n\nA mark of humility and authority. A symbol of the Naqshbandi path.\n\nHeritage Note: This Turkish Naqshbandi Taj ties Cape Town brothers into a global Sufi and Cape Malay Heritage line, providing a Jumu'ah ready, handcrafted Religious Headwear piece that honours the Naqshbandi path.\n",
    imageURL: "/images/WhatsApp Image 2026-03-12 at 2.15.41 AM.jpeg",
    category: "Taj",
  },
];
