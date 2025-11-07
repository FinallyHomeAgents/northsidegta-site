import React from "react";
import { Helmet } from "react-helmet-async";

import {
  SITE_BASE_URL,
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
  const socialImageContent = resolveSocialImageContent(metaValues);
  const tagsWithSocialImages = ensureSocialImageTags(tags, socialImageContent);
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

function ensureSocialImageTags(tags, socialImageContent) {
  if (!socialImageContent) {
    return tags.slice();
  }

  const next = [];
  let hasOgImage = false;
  let hasTwitterImage = false;

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
        attributes: { ...attributes, content: socialImageContent },
      });
      continue;
    }

    if (attributes.name === "twitter:image") {
      hasTwitterImage = true;
      next.push({
        ...tag,
        attributes: { ...attributes, content: socialImageContent },
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
        content: socialImageContent,
      },
    });
  }

  if (!hasTwitterImage) {
    next.push({
      type: "meta",
      key: "meta:twitter:image",
      attributes: {
        name: "twitter:image",
        content: socialImageContent,
      },
    });
  }

  return next;
}

function resolveSocialImageContent(values = {}) {
  const path = safeString(values.metaImagePath);
  if (path) {
    return `${SITE_BASE_URL}${path}`;
  }
  return safeString(values.metaImage);
}

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

