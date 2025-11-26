const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";

function buildCommunityEventsSchema({ events = [] }) {
  const placeNodes = Object.values(PLACE_IDS).map((id) => ({ "@id": id }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${BASE_URL}/community/#webpage`,
        url: `${BASE_URL}/community`,
        name: "Community Events | NorthSide GTA",
        description:
          "Discover community events happening across the NorthSide GTA, including Uxbridge, Georgina, Newmarket, Aurora, East Gwillimbury, Stouffville, and Scugog.",
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: [{ "@id": NORTHSIDE_ID }, ...placeNodes],
        publisher: { "@id": PUBLISHER_ID },
      },
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}/community/#events-list`,
        name: "NorthSide GTA Community Events",
        itemListOrder: "http://schema.org/ItemListUnordered",
        numberOfItems: events.length,
        itemListElement: events.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Event",
            name: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: event.venueName || event.townName || "NorthSide GTA",
              address: event.townName
                ? {
                    "@type": "PostalAddress",
                    addressLocality: event.townName,
                    addressRegion: "ON",
                    addressCountry: "CA",
                  }
                : undefined,
            },
            image: event.imageUrl ? [event.imageUrl] : undefined,
            description: event.description,
            url: event.url,
            organizer: {
              "@id": NORTHSIDE_ID,
            },
          },
        })),
      },
    ],
  };
}

module.exports = { buildCommunityEventsSchema };
