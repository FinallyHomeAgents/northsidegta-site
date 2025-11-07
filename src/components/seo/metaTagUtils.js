const { getSiteSeoForRoute } = require("./siteSeoConfig");

const DEFAULT_TWITTER_CARD = "summary_large_image";

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
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

  const canonicalValue = safeString(raw.canonicalUrl);
  const ogTypeValue = safeString(raw.ogType);
  const ogImageValue = safeString(siteSeoImage || raw.ogImage || raw.image);
  const ogImageAltValue = safeString(raw.ogImageAlt);
  const twitterCardValue = safeString(raw.twitterCard) || DEFAULT_TWITTER_CARD;
  const twitterImageValue = safeString(siteSeoImage || raw.twitterImage || ogImageValue);
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

  return {
    tags,
    values: {
      documentTitle: documentTitleValue,
      title: titleValue,
      description: descriptionValue,
      canonicalUrl: canonicalValue,
      ogType: ogTypeValue,
      ogImage: ogImageValue,
      ogImageAlt: ogImageAltValue,
      twitterCard: twitterCardValue,
      twitterImage: twitterImageValue,
      twitterImageAlt: twitterImageAltValue,
      siteName: siteNameValue,
      articleAuthor: articleAuthorValue,
      articlePublishedTime: articlePublishedTimeValue,
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
  DEFAULT_TWITTER_CARD,
  getMetaTagsFromData,
  getMetaTagHtmlList,
  renderMetaTagsToString,
};
