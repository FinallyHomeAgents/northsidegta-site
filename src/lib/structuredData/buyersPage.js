const { buyersFaq } = require("./faqs");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";

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
        about: { "@id": NORTHSIDE_ID },
        publisher: { "@id": PUBLISHER_ID },
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
