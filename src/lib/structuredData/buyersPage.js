const { buyersFaq } = require("./faqs");
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

function buildBuyersPageSchema() {
  const pageUrl = `${BASE_URL}/buyers`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "NorthSide GTA Buyer Representation | Finally Home Agents",
        description:
          "Buyer guidance tailored to the NorthSide GTA with tours, offer strategy, and neighbourhood expertise from Finally Home Agents.",
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": NORTHSIDE_REGION_ID }, { "@id": NORTHSIDE_ID }],
        publisher: { "@id": PUBLISHER_ID },
        mentions: [{ "@id": NORTHSIDE_REGION_ID }, ...CORE_TOWN_IDS],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: buyersFaq.map((item, index) => ({
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

module.exports = { buildBuyersPageSchema };
