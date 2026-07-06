const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const NORTHSIDE_REGION_ID = "https://northsidegta.ca/#northside-gta-region";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildEventDetailSchema(event) {
  if (!event) return null;
  const pageUrl = event.url || `${BASE_URL}/events/${encodeURIComponent(event.slug || "")}`;
  const townSlug = event.townSlug || slugify(event.townName);
  const placeId = PLACE_IDS[townSlug];

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${pageUrl}#event`,
    name: event.title || "",
    description: event.description || "",
    startDate: event.startDate || "",
    endDate: event.endDate || event.startDate || "",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.imageUrl ? [event.imageUrl] : undefined,
    url: pageUrl,
    location: placeId
      ? { "@id": placeId }
      : {
          "@type": "Place",
          name: event.venueName || event.townName || "NorthSide GTA",
          address: {
            "@type": "PostalAddress",
            addressLocality: event.townName || "NorthSide GTA",
            addressRegion: "ON",
            addressCountry: "CA",
          },
      },
    areaServed: placeId ? { "@id": placeId } : undefined,
    organizer: { "@id": NORTHSIDE_REGION_ID },
    about: [
      { "@id": NORTHSIDE_REGION_ID },
      { "@id": NORTHSIDE_ID },
      ...(placeId ? [{ "@id": placeId }] : []),
    ],
    mentions: [
      { "@id": NORTHSIDE_REGION_ID },
      ...(placeId ? [{ "@id": placeId }] : []),
    ],
  };
}

module.exports = { buildEventDetailSchema };
