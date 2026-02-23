/**
 * Blog posts for SEO and engagement. Each post links to /shop or relevant product.
 * Add new posts here; sitemap includes /blog and /blog/:slug.
 */
export const BLOG_POSTS = [
  {
    slug: 'how-to-choose-a-kufi-cape-town',
    title: 'How to Choose a Kufi in Cape Town',
    description: 'A practical guide to choosing the right kufi for Jumu\'ah, daily wear, and special occasions. Cape Town and South Africa.',
    date: '2026-02-20',
    author: 'Al-Ameen Caps',
    category: 'Guides',
    content: [
      { type: 'p', text: 'Choosing a kufi in Cape Town and across South Africa is about fit, fabric, and occasion. Whether you wear one for Jumu\'ah, daily salaah, or Eid, a few simple tips help you find the right cap.' },
      { type: 'h2', text: 'Fit and comfort' },
      { type: 'p', text: 'A kufi should sit comfortably without slipping. Look for a structured weave that keeps its shape—ideal for masjid, work, or travel. Breathable fabrics work best for Cape Town\'s climate.' },
      { type: 'h2', text: 'Occasion' },
      { type: 'p', text: 'For everyday and Jumu\'ah, a classic woven kufi or Nalain-style cap is versatile. For Eid, weddings, or special events, a Taj or embroidered cap adds dignity. At Al-Ameen Caps we offer both everyday and ceremonial pieces.' },
      { type: 'h2', text: 'Where to buy' },
      { type: 'p', text: 'Al-Ameen Caps is based in Cape Town with nationwide delivery. Browse our collection of premium kufis, fez, and Taj—handcrafted and ready to wear.' },
    ],
  },
  {
    slug: 'eid-headwear-guide-south-africa',
    title: 'Eid Headwear Guide: Kufi, Taj & Fez in South Africa',
    description: 'Eid headwear ideas for South Africa: kufi, Taj, and fez for Eid salah and celebrations. Cape Town, Johannesburg, Durban.',
    date: '2026-02-18',
    author: 'Al-Ameen Caps',
    category: 'Eid',
    content: [
      { type: 'p', text: 'Eid is a time when many choose a special cap or Taj for the day. In South Africa—Cape Town, Johannesburg, Durban, and nationwide—families dress for Eid salah and gatherings with dignity and style.' },
      { type: 'h2', text: 'Kufi for Eid' },
      { type: 'p', text: 'A clean, well-made kufi in white, black, or a subtle colour suits Eid perfectly. Choose one that holds its shape and matches your outfit. Our Nalain and Afgani Star caps are popular for Eid.' },
      { type: 'h2', text: 'Taj and Fez for the day' },
      { type: 'p', text: 'For a more formal look, a Taj or fez adds presence. The Naqshbandi Taj and Royal Ottoman Fez are ideal for Eid salah and family photos. Order in advance so it arrives before Eid.' },
      { type: 'h2', text: 'Order in time' },
      { type: 'p', text: 'We deliver across South Africa. Order early so your Eid headwear arrives in time. Shop the collection and add a piece that honours the day.' },
    ],
  },
  {
    slug: 'types-of-islamic-headwear-kufi-taj-fez',
    title: 'Types of Islamic Headwear: Kufi, Taj, Fez & More',
    description: 'Learn about kufi, Taj, fez, rumal, and other Islamic headwear. Cape Town and South Africa\'s leading selection.',
    date: '2026-02-15',
    author: 'Al-Ameen Caps',
    category: 'Learn',
    content: [
      { type: 'p', text: 'Islamic headwear comes in many forms—each with its own history and place in tradition. Here we outline the main types you\'ll find at Al-Ameen Caps and across Cape Town and South Africa.' },
      { type: 'h2', text: 'Kufi' },
      { type: 'p', text: 'The kufi (also prayer cap, namaz cap) is a close-fitting cap worn for salaah and daily life. Woven or embroidered, it is the most common Islamic cap in South Africa and the Cape.' },
      { type: 'h2', text: 'Taj' },
      { type: 'p', text: 'The Taj (crown) is often layered or wrapped, and is associated with spiritual and ceremonial occasions. The Naqshbandi Taj and Turkish Naqshbandi Taj are worn for Jumu\'ah, Eid, and gatherings.' },
      { type: 'h2', text: 'Fez' },
      { type: 'p', text: 'The fez is a brimless, usually felt or velvet cap with a tassel. It carries Ottoman and North African heritage and is worn for formal and cultural events. Our Royal Ottoman Fez is a classic choice.' },
      { type: 'h2', text: 'Rumal and more' },
      { type: 'p', text: 'The Arabic rumal is a woven scarf that can be worn as headwear or around the neck. We also offer military-style caps and winter caps for variety. Explore the full collection online.' },
    ],
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getAllSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}
