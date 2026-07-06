const { sellersFaq } = require("./faqs");
const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const NORTHSIDE_REGION_ID = "https://northsidegta.ca/#northside-gta-region";
const SELLERS_PAGE_TITLE = "Sell Your Home North of Toronto | NorthSide GTA | Finally Home Agents";
const SELLERS_PAGE_DESCRIPTION =
  "Considering selling in Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, or Scugog? Finally Home Agents provides strategic pricing, professional marketing, and personal guidance from first conversation to closing.";

const CORE_TOWN_IDS = [
  "uxbridge",
  "georgina",
  "east-gwillimbury",
  "newmarket",
  "aurora",
  "stouffville",
  "scugog",
].map((slug) => ({ "@id": PLACE_IDS[slug] }));

function buildSellersPageSchema() {
  const pageUrl = `${BASE_URL}/sellers`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: SELLERS_PAGE_TITLE,
        description: SELLERS_PAGE_DESCRIPTION,
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": NORTHSIDE_REGION_ID }, { "@id": NORTHSIDE_ID }],
        publisher: { "@id": PUBLISHER_ID },
        mentions: [{ "@id": NORTHSIDE_REGION_ID }, ...CORE_TOWN_IDS],
      },

      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Sellers", item: pageUrl },
        ],
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Seller representation",
        serviceType: "Seller representation",
        url: pageUrl,
        provider: { "@id": PUBLISHER_ID },
        areaServed: CORE_TOWN_IDS,
        description: SELLERS_PAGE_DESCRIPTION,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: sellersFaq.map((item, index) => ({
          "@type": "Question",
          name: item.question,
          position: index + 1,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

module.exports = { buildSellersPageSchema, SELLERS_PAGE_TITLE, SELLERS_PAGE_DESCRIPTION };
