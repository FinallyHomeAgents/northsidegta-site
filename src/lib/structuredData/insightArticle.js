const { getInsightClusters, getPlaceIdsFromClusters } = require("./clusters");
const { PLACE_IDS } = require("./globalGraph");

const BASE_URL = "https://northsidegta.ca";
const DEFAULT_AUTHOR_ID = "https://northsidegta.ca/#matthew-mulhall";
const PUBLISHER_ID = "https://northsidegta.ca/#finally-home-agents";
const WEBSITE_ID = "https://northsidegta.ca/#website";
const NORTHSIDE_ID = "https://northsidegta.ca/#northside-gta";
const TASTEHUB_ID = "https://northsidegta.ca/#tastehub";

function buildAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

function normalizeAuthorId(authorId) {
  if (!authorId) return DEFAULT_AUTHOR_ID;
  if (authorId.startsWith("http")) return authorId;
  return `${BASE_URL}/#${authorId}`;
}

function escapeSlug(slug) {
  if (!slug) return "";
  try {
    return encodeURIComponent(slug);
  } catch (error) {
    return slug;
  }
}

function buildKeywordList(title, clusterIds = []) {
  const keywords = ["NorthSide GTA", "Finally Home Agents", "real estate"];
  if (title) {
    keywords.push(title);
  }
  if (Array.isArray(clusterIds) && clusterIds.length) {
    keywords.push(...clusterIds);
  }
  return keywords;
}

function buildAboutAndMentions(slug) {
  const clusters = getInsightClusters(slug);
  const placeMentions = getPlaceIdsFromClusters(clusters);
  const mentions = [{ "@id": NORTHSIDE_ID }, ...placeMentions];

  if (clusters.includes("tastehub")) {
    mentions.push({ "@id": TASTEHUB_ID });
  }

  const about = placeMentions.length ? [...placeMentions] : [{ "@id": NORTHSIDE_ID }];

  if (clusters.includes("northside-gta") && !about.find((n) => n["@id"] === NORTHSIDE_ID)) {
    about.push({ "@id": NORTHSIDE_ID });
  }

  const directPlaceId = PLACE_IDS[slug];
  if (directPlaceId && !about.find((n) => n["@id"] === directPlaceId)) {
    about.push({ "@id": directPlaceId });
  }

  if (directPlaceId && !mentions.find((n) => n["@id"] === directPlaceId)) {
    mentions.push({ "@id": directPlaceId });
  }

  return { about, mentions, clusters };
}

function buildInsightArticleSchema({ slug, title, summary, image, published, updated, authorId }) {
  const safeSlug = escapeSlug(slug);
  const baseUrl = `${BASE_URL}/insights/${safeSlug}`;
  const normalizedAuthor = normalizeAuthorId(authorId);
  const description = summary || "";
  const { about, mentions, clusters } = buildAboutAndMentions(slug);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Article", "BlogPosting"],
        "@id": `${baseUrl}/#article`,
        headline: title || "",
        description,
        image: buildAbsoluteUrl(image),
        datePublished: published || updated || "",
        dateModified: updated || published || "",
        inLanguage: "en-CA",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/#webpage`,
        },
        author: { "@id": normalizedAuthor },
        publisher: { "@id": PUBLISHER_ID },
        isPartOf: { "@id": WEBSITE_ID },
        articleSection: "Insights",
        keywords: buildKeywordList(title, clusters),
        about,
        mentions,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
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
            name: "Insights",
            item: `${BASE_URL}/insights`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title || "",
            item: baseUrl,
          },
        ],
      },
    ],
  };
}

module.exports = { buildInsightArticleSchema };
