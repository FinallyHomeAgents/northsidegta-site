const { sellersFaq } = require("./faqs");
const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const NORTHSIDE_REGION_ID = "https://northsidegta.ca/#northside-gta-region";

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
        name: "NorthSide GTA Seller Strategy | Finally Home Agents",
        description:
          "Listing prep, marketing, and negotiations for NorthSide GTA sellers with a plan that keeps you in control of timelines and pricing.",
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": NORTHSIDE_REGION_ID }, { "@id": NORTHSIDE_ID }],
        publisher: { "@id": PUBLISHER_ID },
        mentions: [{ "@id": NORTHSIDE_REGION_ID }, ...CORE_TOWN_IDS],
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

module.exports = { buildSellersPageSchema };
