import { PLACE_IDS } from "./globalGraph.js";

const BASE_URL = "https://northsidegta.ca";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const TASTEHUB_ID = "https://northsidegta.ca/#tastehub";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const NORTHSIDE_REGION_ID = "https://northsidegta.ca/#northside-gta-region";

function buildAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

export function buildTasteHubPollSchema({ slug, title, description, image, townSlug, townName, items = [] }) {
  const pageUrl = `${BASE_URL}/tastehub/${encodeURIComponent(slug || "")}`;
  const aboutNodes = [
    { "@id": TASTEHUB_ID },
    { "@id": NORTHSIDE_REGION_ID },
    { "@id": NORTHSIDE_ID },
  ];
  const placeId = PLACE_IDS[townSlug];

  if (placeId) {
    aboutNodes.push({ "@id": placeId });
  }

  const mentions = aboutNodes.map((node) => ({ ...node }));

  const keywordList = [title, townName ? `${townName} restaurants` : null, "NorthSide TasteHub", "NorthSide GTA food", "Finally Home Agents community"].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${title} | NorthSide TasteHub`,
        description: description || "",
        inLanguage: "en-CA",
        isPartOf: { "@id": WEBSITE_ID },
        about: aboutNodes,
        publisher: { "@id": PUBLISHER_ID },
        mentions,
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: buildAbsoluteUrl(image),
        },
        keywords: keywordList,
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}/#ranking`,
        name: `${title} Rankings | NorthSide TasteHub`,
        description: townName
          ? `Community-ranked list for ${title} in ${townName}, based on votes from NorthSide GTA locals.`
          : `Community-ranked list for ${title} across the NorthSide GTA, based on votes from locals.`,
        itemListOrder: "http://schema.org/ItemListOrderDescending",
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: {
            "@type": "LocalBusiness",
            name: item.name,
            address: townName
              ? {
                  "@type": "PostalAddress",
                  addressLocality: townName,
                  addressRegion: "ON",
                  addressCountry: "CA",
                }
              : undefined,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
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
          {
            "@type": "ListItem",
            position: 3,
            name: title || "",
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
