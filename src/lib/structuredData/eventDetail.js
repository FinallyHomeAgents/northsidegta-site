const BASE_URL = "https://northsidegta.ca";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";

function buildEventDetailSchema(event) {
  if (!event) return null;
  const pageUrl = event.url || `${BASE_URL}/events/${encodeURIComponent(event.slug || "")}`;

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
    location: {
      "@type": "Place",
      name: event.venueName || event.townName || "NorthSide GTA",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.townName || "NorthSide GTA",
        addressRegion: "ON",
        addressCountry: "CA",
      },
    },
    organizer: { "@id": NORTHSIDE_ID },
  };
}

module.exports = { buildEventDetailSchema };
