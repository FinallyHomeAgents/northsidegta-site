const { PLACE_IDS } = require("./globalGraph");
const { getTownFaq } = require("./faqs");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const NORTHSIDE_REGION_ID = "https://northsidegta.ca/#northside-gta-region";

function buildAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

function buildFaqSchema({ safeUrl, faqEntries }) {
  if (!Array.isArray(faqEntries) || faqEntries.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${safeUrl}/#faq`,
    mainEntity: faqEntries.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildTownPageSchema({ slug, name, url, heroImage, description }) {
  const path = url?.replace(BASE_URL, "") || `/${slug}`;
  const safeUrl = url || `${BASE_URL}${path}`;
  const normalizedSlug = slug || path.replace(/^\//, "");
  const placeId = PLACE_IDS[normalizedSlug] || `${BASE_URL}/#${normalizedSlug}`;
  const townDescription =
    description ||
    `Discover life in ${name}, a NorthSide GTA community with real estate insights, commuting tips, and neighbourhood highlights.`;
  const faqEntries = getTownFaq(normalizedSlug);
  const faqSchema = buildFaqSchema({ safeUrl, faqEntries });

  const about = [
    { "@id": NORTHSIDE_REGION_ID },
    { "@id": placeId },
    { "@id": NORTHSIDE_ID },
  ];

  const graph = [
    {
      "@type": ["WebPage", "CollectionPage"],
      "@id": `${safeUrl}/#webpage`,
      url: safeUrl,
      name: `Living in ${name} | NorthSide GTA Real Estate Guide`,
      description: townDescription,
      inLanguage: "en-CA",
      isPartOf: { "@id": WEBSITE_ID },
      about,
      spatialCoverage: { "@id": placeId },
      withinAdministrativeArea: { "@id": NORTHSIDE_REGION_ID },
      publisher: { "@id": PUBLISHER_ID },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl(heroImage),
      },
      mentions: [
        { "@id": NORTHSIDE_REGION_ID },
        { "@id": placeId },
        { "@id": NORTHSIDE_ID },
      ],
      keywords: [
        `${name} real estate`,
        `homes for sale in ${name}`,
        `living in ${name}`,
        `moving to ${name}`,
        "NorthSide GTA",
        `${name} neighbourhoods`,
        "Finally Home Agents",
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${safeUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${BASE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Towns",
          item: `${BASE_URL}/towns`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: name || "",
          item: safeUrl,
        },
      ],
    },
  ];

  if (faqSchema) {
    graph.push(faqSchema);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

module.exports = { buildTownPageSchema };
