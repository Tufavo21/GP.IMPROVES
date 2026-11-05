// JSON-LD y metadatos <head>. Solo datos reales del cliente: sin dirección, horarios ni valoraciones.
export function buildJsonLd(lang, dict, b) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: b.name,
    url: b.siteUrl,
    image: `${b.siteUrl}/og-image.png`,
    logo: `${b.siteUrl}/icon-512.png`,
    description: dict.meta.jsonDescription,
    slogan: b.slogan[lang],
    telephone: b.phone.intl,
    email: b.email,
    areaServed: { '@type': 'City', name: b.city },
    founder: b.founders.map((name) => ({ '@type': 'Person', name })),
    sameAs: [b.instagram.url],
    inLanguage: lang,
  };
}

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function syncHead(lang, dict, b) {
  document.title = dict.meta.title;
  setMeta('meta[name="description"]', 'content', dict.meta.description);
  setMeta('meta[property="og:title"]', 'content', dict.meta.ogTitle);
  setMeta('meta[property="og:description"]', 'content', dict.meta.description);
  setMeta('meta[property="og:locale"]', 'content', dict.meta.ogLocale);
  setMeta('meta[name="twitter:title"]', 'content', dict.meta.ogTitle);
  setMeta('meta[name="twitter:description"]', 'content', dict.meta.description);
  const ld = document.getElementById('jsonld');
  if (ld) ld.textContent = JSON.stringify(buildJsonLd(lang, dict, b));
}
