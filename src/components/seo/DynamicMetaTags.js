import React from "react";
import { Helmet } from "react-helmet-async";

import {
  SITE_BASE_URL,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_WIDTH,
  getMetaTagsFromData,
  SOCIAL_META_KEYS,
} from "./metaTagUtils";
import renderHelmetTag from "./renderHelmetTag";

export { getMetaTagsFromData } from "./metaTagUtils";

const SOCIAL_META_KEY_SET = new Set(SOCIAL_META_KEYS);

export default function DynamicMetaTags(props) {
  const { children, ...metaProps } = props || {};
  const meta = getMetaTagsFromData(metaProps);

  if (!meta) {
    const childArray = React.Children.toArray(children);
    if (childArray.length === 0) {
      return null;
    }
    return <Helmet>{childArray}</Helmet>;
  }

  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const metaValues = meta.values || {};
  const socialImage = resolveSocialImageContent(metaValues);
  const tagsWithSocialImages = ensureSocialImageTags(tags, socialImage);
  const hasSiteSeoOverrides = Boolean(meta.flags && meta.flags.hasSiteSeoOverrides);
  const filteredChildren = filterMetaChildren(children, hasSiteSeoOverrides);

  if (tagsWithSocialImages.length === 0 && filteredChildren.length === 0) {
    return null;
  }

  return (
    <Helmet>
      {tagsWithSocialImages.map(renderHelmetTag)}
      {filteredChildren}
    </Helmet>
  );
}

function filterMetaChildren(children, hasSiteSeoOverrides) {
  const array = React.Children.toArray(children);
  if (!hasSiteSeoOverrides || array.length === 0) {
    return array;
  }

  return array.filter((child) => {
    if (!React.isValidElement(child)) return true;
    if (child.type !== "meta") return true;
    const key = getChildMetaKey(child.props);
    if (!key) return true;
    return !SOCIAL_META_KEY_SET.has(key);
  });
}

function getChildMetaKey(props = {}) {
  if (!props || typeof props !== "object") return "";
  const property = safeMetaKey(props.property);
  if (property) {
    return `property:${property}`;
  }
  const name = safeMetaKey(props.name);
  if (name) {
    return `name:${name}`;
  }
  return "";
}

function safeMetaKey(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function ensureSocialImageTags(tags, socialImage) {
  if (!socialImage || !socialImage.url) {
    return tags.slice();
  }

  const next = [];
  let hasOgImage = false;
  let hasTwitterImage = false;
  let hasOgImageWidth = false;
  let hasOgImageHeight = false;

  const imageUrl = socialImage.url;
  const imageWidth = safeString(socialImage.width) || SOCIAL_IMAGE_WIDTH;
  const imageHeight = safeString(socialImage.height) || SOCIAL_IMAGE_HEIGHT;

  for (const tag of tags) {
    if (!tag || tag.type !== "meta") {
      next.push(tag);
      continue;
    }

    const attributes = tag.attributes || {};
    if (attributes.property === "og:image") {
      hasOgImage = true;
      next.push({
        ...tag,
        attributes: { ...attributes, content: imageUrl },
      });
      continue;
    }

    if (attributes.property === "og:image:width") {
      hasOgImageWidth = true;
      next.push({
        ...tag,
        attributes: { ...attributes, content: imageWidth },
      });
      continue;
    }

    if (attributes.property === "og:image:height") {
      hasOgImageHeight = true;
      next.push({
        ...tag,
        attributes: { ...attributes, content: imageHeight },
      });
      continue;
    }

    if (attributes.name === "twitter:image") {
      hasTwitterImage = true;
      next.push({
        ...tag,
        attributes: { ...attributes, content: imageUrl },
      });
      continue;
    }

    next.push(tag);
  }

  if (!hasOgImage) {
    next.push({
      type: "meta",
      key: "meta:og:image",
      attributes: {
        property: "og:image",
        content: imageUrl,
      },
    });
  }

  if (!hasOgImageWidth) {
    next.push({
      type: "meta",
      key: "meta:og:image:width",
      attributes: {
        property: "og:image:width",
        content: imageWidth,
      },
    });
  }

  if (!hasOgImageHeight) {
    next.push({
      type: "meta",
      key: "meta:og:image:height",
      attributes: {
        property: "og:image:height",
        content: imageHeight,
      },
    });
  }

  if (!hasTwitterImage) {
    next.push({
      type: "meta",
      key: "meta:twitter:image",
      attributes: {
        name: "twitter:image",
        content: imageUrl,
      },
    });
  }

  return next;
}

function resolveSocialImageContent(values = {}) {
  const absoluteUrl = safeString(values.metaImage);
  let resolvedUrl = absoluteUrl;

  if (!resolvedUrl) {
    const path = safeString(values.metaImagePath);
    if (path) {
      resolvedUrl = `${SITE_BASE_URL}${path}`;
    }
  }

  if (!resolvedUrl) {
    return null;
  }

  const width = safeString(values.metaImageWidth) || SOCIAL_IMAGE_WIDTH;
  const height = safeString(values.metaImageHeight) || SOCIAL_IMAGE_HEIGHT;

  return {
    url: resolvedUrl,
    width,
    height,
  };
}

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

