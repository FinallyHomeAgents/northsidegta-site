const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const TASTEHUB_ID = "https://northsidegta.ca/#tastehub";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";

function buildTasteHubPageSchema() {
  const placeMentions = Object.values(PLACE_IDS).map((id) => ({ "@id": id }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${BASE_URL}/tastehub/#webpage`,
        url: `${BASE_URL}/tastehub`,
        name: "NorthSide TasteHub | Community Food Rankings Across the NorthSide GTA",
        description:
          "NorthSide TasteHub lets locals across Uxbridge, Georgina, Newmarket, Aurora, East Gwillimbury, Stouffville, and Scugog vote for their favourite food spots.",
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": TASTEHUB_ID }, { "@id": NORTHSIDE_ID }, ...placeMentions],
        publisher: { "@id": PUBLISHER_ID },
        mentions: [{ "@id": NORTHSIDE_ID }, ...placeMentions],
        keywords: [
          "NorthSide GTA food",
          "NorthSide GTA restaurants",
          "NorthSide GTA pizza",
          "NorthSide GTA wings",
          "NorthSide TasteHub",
          "Finally Home Agents community",
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE_URL}/tastehub/#breadcrumb`,
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
            name: "TasteHub",
            item: `${BASE_URL}/tastehub`,
          },
        ],
      },
    ],
  };
}

module.exports = { buildTasteHubPageSchema };
