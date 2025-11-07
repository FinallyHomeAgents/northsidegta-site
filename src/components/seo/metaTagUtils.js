const { getSiteSeoForRoute } = require("./siteSeoConfig");

const SITE_BASE_URL = "https://northsidegta.ca";
const DEFAULT_META_IMAGE_PATH = "/Images/og-home.jpg";
const DEFAULT_TWITTER_CARD = "summary_large_image";

const SOCIAL_META_KEYS = [
  "property:og:type",
  "property:og:title",
  "property:og:description",
  "property:og:url",
  "property:og:image",
  "property:og:image:alt",
  "property:og:site_name",
  "name:twitter:card",
  "name:twitter:title",
  "name:twitter:description",
  "name:twitter:image",
  "name:twitter:image:alt",
];

const SOCIAL_META_KEY_SET = new Set(SOCIAL_META_KEYS);

function getMetaAttributeKey(attributes = {}) {
  if (!attributes || typeof attributes !== "object") return "";
  const property = safeString(attributes.property);
  if (property) {
    return `property:${property}`;
  }
  const name = safeString(attributes.name);
  if (name) {
    return `name:${name}`;
  }
  return "";
}

function dedupeSocialMetaTags(tags = []) {
  if (!Array.isArray(tags) || tags.length <= 1) {
    return tags;
  }

  const result = tags.slice();
  const latestIndexByKey = new Map();

  for (let index = 0; index < result.length; index += 1) {
    const tag = result[index];
    if (!tag || tag.type !== "meta") continue;

    const key = getMetaAttributeKey(tag.attributes);
    if (!key || !SOCIAL_META_KEY_SET.has(key)) continue;

    if (latestIndexByKey.has(key)) {
      const previousIndex = latestIndexByKey.get(key);
      result[previousIndex] = null;
    }

    latestIndexByKey.set(key, index);
  }

  return result.filter(Boolean);
}

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

function ensureLeadingSlash(value) {
  const trimmed = safeString(value);
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function normalizeCanonicalUrl(value, routeValue) {
  const provided = safeString(value);
  if (provided) {
    return buildAbsoluteUrl(provided);
  }
  if (!routeValue) return "";
  const normalizedRoute = routeValue === "/" ? "/" : ensureLeadingSlash(routeValue);
  return `${SITE_BASE_URL}${normalizedRoute === "/" ? "/" : normalizedRoute}`;
}

function buildAbsoluteUrl(value) {
  const trimmed = safeString(value);
  if (!trimmed) return "";
  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  const withLeadingSlash = ensureLeadingSlash(trimmed);
  return `${SITE_BASE_URL}${withLeadingSlash}`;
}

function normalizeMetaImage(siteSeoImage, raw = {}) {
  const candidates = [
    safeString(siteSeoImage),
    safeString(raw.ogImage),
    safeString(raw.image),
    safeString(raw.twitterImage),
    DEFAULT_META_IMAGE_PATH,
  ];

  let chosen = "";
  for (const candidate of candidates) {
    if (candidate) {
      chosen = candidate;
      break;
    }
  }

  let absoluteUrl = "";
  let path = "";

  if (chosen) {
    if (isAbsoluteUrl(chosen)) {
      absoluteUrl = chosen;
      if (absoluteUrl.startsWith(`${SITE_BASE_URL}`)) {
        try {
          const url = new URL(absoluteUrl);
          path = `${url.pathname}${url.search}${url.hash}`.replace(/[#?]$/, "");
        } catch (error) {
          path = "";
        }
      }
    } else if (chosen.startsWith("//")) {
      absoluteUrl = `https:${chosen}`;
    } else {
      path = ensureLeadingSlash(chosen);
      absoluteUrl = `${SITE_BASE_URL}${path}`;
    }
  }

  if (!absoluteUrl) {
    path = ensureLeadingSlash(DEFAULT_META_IMAGE_PATH);
    absoluteUrl = `${SITE_BASE_URL}${path}`;
  } else if (!path && absoluteUrl.startsWith(`${SITE_BASE_URL}`)) {
    try {
      const url = new URL(absoluteUrl);
      path = `${url.pathname}${url.search}${url.hash}`.replace(/[#?]$/, "");
    } catch (error) {
      path = ensureLeadingSlash(DEFAULT_META_IMAGE_PATH);
    }
  }

  return {
    path,
    absoluteUrl,
  };
}

function normalizeAdditionalMeta(additionalMeta) {
  if (!Array.isArray(additionalMeta)) return [];
  return additionalMeta
    .map((meta) => {
      if (!meta) return null;
      const name = safeString(meta.name);
      const property = safeString(meta.property);
      const content = safeString(meta.content);
      if (!content || (!name && !property)) return null;
      const key = safeString(meta.key);
      return {
        key: key || (name ? `name:${name}` : `property:${property}`),
        name: name || undefined,
        property: property || undefined,
        content,
      };
    })
    .filter(Boolean);
}

function getMetaTagsFromData(raw = {}) {
  const routeValue = safeString(raw.route);
  const siteSeo = routeValue ? getSiteSeoForRoute(routeValue) : null;
  const siteSeoTitle = safeString(siteSeo && siteSeo.seo_title);
  const siteSeoDescription = safeString(siteSeo && siteSeo.seo_description);
  const siteSeoImage = safeString(siteSeo && siteSeo.seo_image);
  const hasSiteSeoOverrides = Boolean(siteSeo);

  const fallbackTitleValue = safeString(raw.title);
  const titleValue = siteSeoTitle || fallbackTitleValue;
  const documentTitleValue = safeString(
    siteSeoTitle || raw.documentTitle || fallbackTitleValue,
  );
  const ogTitleValue = safeString(siteSeoTitle || raw.ogTitle || fallbackTitleValue);
  const twitterTitleValue = safeString(
    siteSeoTitle || raw.twitterTitle || ogTitleValue || documentTitleValue,
  );

  const fallbackDescriptionValue = safeString(raw.description);
  const descriptionValue = safeString(siteSeoDescription || raw.description);
  const ogDescriptionValue = safeString(
    siteSeoDescription || raw.ogDescription || fallbackDescriptionValue,
  );
  const twitterDescriptionValue = safeString(
    siteSeoDescription ||
      raw.twitterDescription ||
      ogDescriptionValue ||
      descriptionValue,
  );

  const canonicalValue = normalizeCanonicalUrl(raw.canonicalUrl, routeValue);
  const ogTypeValue = safeString(raw.ogType);
  const { path: metaImagePath, absoluteUrl: resolvedMetaImageUrl } =
    normalizeMetaImage(siteSeoImage, raw);
  const ogImageValue = resolvedMetaImageUrl;
  const ogImageAltValue = safeString(raw.ogImageAlt);
  const twitterCardValue = safeString(raw.twitterCard) || DEFAULT_TWITTER_CARD;
  const twitterImageValue = resolvedMetaImageUrl;
  const twitterImageAltValue = safeString(raw.twitterImageAlt || ogImageAltValue);
  const siteNameValue = safeString(raw.siteName);
  const articleAuthorValue = safeString(raw.articleAuthor);
  const articlePublishedTimeValue = safeString(raw.articlePublishedTime);

  const normalizedAdditionalMeta = normalizeAdditionalMeta(raw.additionalMeta);

  const tags = [];

  if (documentTitleValue) {
    tags.push({
      type: "title",
      key: "document-title",
      content: documentTitleValue,
    });
  }

  if (descriptionValue) {
    tags.push({
      type: "meta",
      key: "meta:description",
      attributes: { name: "description", content: descriptionValue },
    });
  }

  if (canonicalValue) {
    tags.push({
      type: "link",
      key: "link:canonical",
      attributes: { rel: "canonical", href: canonicalValue },
    });
  }

  if (ogTypeValue) {
    tags.push({
      type: "meta",
      key: "meta:og:type",
      attributes: { property: "og:type", content: ogTypeValue },
    });
  }

  if (ogTitleValue) {
    tags.push({
      type: "meta",
      key: "meta:og:title",
      attributes: { property: "og:title", content: ogTitleValue },
    });
  }

  if (ogDescriptionValue) {
    tags.push({
      type: "meta",
      key: "meta:og:description",
      attributes: { property: "og:description", content: ogDescriptionValue },
    });
  }

  if (canonicalValue) {
    tags.push({
      type: "meta",
      key: "meta:og:url",
      attributes: { property: "og:url", content: canonicalValue },
    });
  }

  if (ogImageValue) {
    tags.push({
      type: "meta",
      key: "meta:og:image",
      attributes: { property: "og:image", content: ogImageValue },
    });
  }

  if (ogImageAltValue) {
    tags.push({
      type: "meta",
      key: "meta:og:image:alt",
      attributes: { property: "og:image:alt", content: ogImageAltValue },
    });
  }

  if (siteNameValue) {
    tags.push({
      type: "meta",
      key: "meta:og:site_name",
      attributes: { property: "og:site_name", content: siteNameValue },
    });
  }

  tags.push({
    type: "meta",
    key: "meta:twitter:card",
    attributes: { name: "twitter:card", content: twitterCardValue },
  });

  if (twitterTitleValue || ogTitleValue) {
    tags.push({
      type: "meta",
      key: "meta:twitter:title",
      attributes: {
        name: "twitter:title",
        content: twitterTitleValue || ogTitleValue,
      },
    });
  }

  if (twitterDescriptionValue || ogDescriptionValue) {
    tags.push({
      type: "meta",
      key: "meta:twitter:description",
      attributes: {
        name: "twitter:description",
        content: twitterDescriptionValue || ogDescriptionValue,
      },
    });
  }

  if (twitterImageValue) {
    tags.push({
      type: "meta",
      key: "meta:twitter:image",
      attributes: { name: "twitter:image", content: twitterImageValue },
    });
  }

  if (twitterImageAltValue) {
    tags.push({
      type: "meta",
      key: "meta:twitter:image:alt",
      attributes: {
        name: "twitter:image:alt",
        content: twitterImageAltValue,
      },
    });
  }

  if (articlePublishedTimeValue) {
    tags.push({
      type: "meta",
      key: "meta:article:published_time",
      attributes: {
        property: "article:published_time",
        content: articlePublishedTimeValue,
      },
    });
  }

  if (articleAuthorValue) {
    tags.push({
      type: "meta",
      key: "meta:article:author",
      attributes: {
        property: "article:author",
        content: articleAuthorValue,
      },
    });
  }

  normalizedAdditionalMeta.forEach((meta, index) => {
    const key = meta.key || `meta:additional:${index}`;
    if (meta.name) {
      tags.push({
        type: "meta",
        key,
        attributes: { name: meta.name, content: meta.content },
      });
    } else if (meta.property) {
      tags.push({
        type: "meta",
        key,
        attributes: { property: meta.property, content: meta.content },
      });
    }
  });

  if (
    !documentTitleValue &&
    !titleValue &&
    !descriptionValue &&
    !canonicalValue &&
    !ogTypeValue &&
    !ogImageValue &&
    !twitterImageValue &&
    !siteNameValue &&
    !articleAuthorValue &&
    !articlePublishedTimeValue &&
    normalizedAdditionalMeta.length === 0
  ) {
    return null;
  }

  const dedupedTags = dedupeSocialMetaTags(tags);

  return {
    tags: dedupedTags,
    values: {
      documentTitle: documentTitleValue,
      title: titleValue,
      description: descriptionValue,
      canonicalUrl: canonicalValue,
      ogType: ogTypeValue,
      ogImage: ogImageValue,
      metaImagePath,
      metaImage: resolvedMetaImageUrl,
      ogImageAlt: ogImageAltValue,
      twitterCard: twitterCardValue,
      twitterImage: twitterImageValue,
      twitterImageAlt: twitterImageAltValue,
      siteName: siteNameValue,
      articleAuthor: articleAuthorValue,
      articlePublishedTime: articlePublishedTimeValue,
    },
    flags: {
      hasSiteSeoOverrides,
    },
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function stringifyTag(descriptor) {
  if (!descriptor) return "";
  if (descriptor.type === "title") {
    return `<title>${escapeHtml(descriptor.content || "")}</title>`;
  }

  if (descriptor.type === "meta") {
    const attrs = descriptor.attributes || {};
    const attrText = Object.entries(attrs)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
      .join(" ");
    return attrText ? `<meta ${attrText} />` : "";
  }

  if (descriptor.type === "link") {
    const attrs = descriptor.attributes || {};
    const attrText = Object.entries(attrs)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
      .join(" ");
    return attrText ? `<link ${attrText} />` : "";
  }

  return "";
}

function getMetaTagHtmlList(raw = {}) {
  const meta = getMetaTagsFromData(raw);
  if (!meta) return [];
  return meta.tags.map(stringifyTag).filter(Boolean);
}

function renderMetaTagsToString(raw = {}) {
  return getMetaTagHtmlList(raw).join("\n");
}

module.exports = {
  DEFAULT_META_IMAGE_PATH,
  DEFAULT_TWITTER_CARD,
  SITE_BASE_URL,
  SOCIAL_META_KEYS,
  buildAbsoluteUrl,
  getMetaTagsFromData,
  getMetaTagHtmlList,
  renderMetaTagsToString,
};
