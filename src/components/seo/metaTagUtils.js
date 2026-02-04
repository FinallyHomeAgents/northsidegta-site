const { getSiteSeoForRoute } = require("./siteSeoConfig");

const SITE_BASE_URL = "https://northsidegta.ca";
const DEFAULT_META_IMAGE_PATH = "/Images/og-home.jpg";
const DEFAULT_TWITTER_CARD = "summary_large_image";
const SOCIAL_IMAGE_WIDTH = "1200";
const SOCIAL_IMAGE_HEIGHT = "630";

const SOCIAL_META_KEYS = [
  "property:og:type",
  "property:og:title",
  "property:og:description",
  "property:og:url",
  "property:og:image",
  "property:og:image:width",
  "property:og:image:height",
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
    siteSeoImage,
    raw.ogImage,
    raw.image,
    raw.twitterImage,
    raw.metaImage,
    raw.metaImagePath,
    DEFAULT_META_IMAGE_PATH,
  ];

  let resolvedPath = "";

  for (const candidate of candidates) {
    const normalized = normalizeImageCandidate(candidate);
    if (normalized) {
      resolvedPath = normalized;
      break;
    }
  }

  if (!resolvedPath) {
    resolvedPath = ensureLeadingSlash(DEFAULT_META_IMAGE_PATH);
  }

  const absoluteUrl = buildAbsoluteUrl(resolvedPath);

  return {
    path: resolvedPath,
    absoluteUrl,
  };
}

function resolveTwitterImage(twitterImage, ogImageValue) {
  const candidate = normalizeImageCandidate(twitterImage);
  if (candidate) {
    return buildAbsoluteUrl(candidate);
  }
  return ogImageValue;
}

function normalizeImageCandidate(candidate) {
  const value = safeString(candidate);
  if (!value) return "";

  if (value.startsWith("//")) {
    return normalizeImageCandidate(`https:${value}`);
  }

  if (isAbsoluteUrl(value)) {
    try {
      const url = new URL(value);
      const combined = `${url.pathname}${url.search}${url.hash}`.replace(/[#?]$/, "");
      const path = combined || url.pathname || "";
      return ensureLeadingSlash(path);
    } catch (error) {
      return "";
    }
  }

  return ensureLeadingSlash(value);
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
  const siteSeoOgTitle = safeString(siteSeo && siteSeo.og_title);
  const siteSeoOgDescription = safeString(siteSeo && siteSeo.og_description);
  const siteSeoOgImage = safeString(siteSeo && siteSeo.og_image);
  const siteSeoCanonicalUrl = safeString(siteSeo && siteSeo.canonical_url);
  const hasSiteSeoOverrides = Boolean(siteSeo);

  const fallbackTitleValue = safeString(raw.title);
  const titleValue = siteSeoTitle || fallbackTitleValue;
  const documentTitleValue = safeString(
    siteSeoTitle || raw.documentTitle || fallbackTitleValue,
  );
  const ogTitleValue = safeString(
    siteSeoOgTitle || siteSeoTitle || raw.ogTitle || fallbackTitleValue,
  );
  const twitterTitleValue = safeString(
    siteSeoTitle || raw.twitterTitle || ogTitleValue || documentTitleValue,
  );

  const fallbackDescriptionValue = safeString(raw.description);
  const descriptionValue = safeString(siteSeoDescription || raw.description);
  const ogDescriptionValue = safeString(
    siteSeoOgDescription ||
      siteSeoDescription ||
      raw.ogDescription ||
      fallbackDescriptionValue,
  );
  const twitterDescriptionValue = safeString(
    siteSeoDescription ||
      raw.twitterDescription ||
      ogDescriptionValue ||
      descriptionValue,
  );

  const canonicalValue = normalizeCanonicalUrl(
    siteSeoCanonicalUrl || raw.canonicalUrl,
    routeValue,
  );
  const ogTypeValue = safeString(raw.ogType);
  const metaImageSource = safeString(siteSeoOgImage || siteSeoImage);
  const { path: metaImagePath, absoluteUrl: resolvedMetaImageUrl } =
    normalizeMetaImage(metaImageSource, raw);
  const ogImageValue = resolvedMetaImageUrl;
  const ogImageAltValue = safeString(raw.ogImageAlt);
  const twitterCardValue = safeString(raw.twitterCard) || DEFAULT_TWITTER_CARD;
  const twitterImageValue = resolveTwitterImage(
    metaImageSource ? "" : raw.twitterImage,
    ogImageValue,
  );
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

    tags.push({
      type: "meta",
      key: "meta:og:image:width",
      attributes: { property: "og:image:width", content: SOCIAL_IMAGE_WIDTH },
    });

    tags.push({
      type: "meta",
      key: "meta:og:image:height",
      attributes: { property: "og:image:height", content: SOCIAL_IMAGE_HEIGHT },
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
      metaImageWidth: ogImageValue ? SOCIAL_IMAGE_WIDTH : "",
      metaImageHeight: ogImageValue ? SOCIAL_IMAGE_HEIGHT : "",
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
  SOCIAL_IMAGE_WIDTH,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_META_KEYS,
  buildAbsoluteUrl,
  getMetaTagsFromData,
  getMetaTagHtmlList,
  renderMetaTagsToString,
};
