import React from "react";
import { Helmet } from "react-helmet-async";

import { getMetaTagsFromData, SOCIAL_META_KEYS } from "./metaTagUtils";

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
  const hasSiteSeoOverrides = Boolean(meta.flags && meta.flags.hasSiteSeoOverrides);
  const filteredChildren = filterMetaChildren(children, hasSiteSeoOverrides);

  if (tags.length === 0 && filteredChildren.length === 0) {
    return null;
  }

  return (
    <Helmet>
      {tags.map(renderHelmetTag)}
      {filteredChildren}
    </Helmet>
  );
}

function renderHelmetTag(tag, index) {
  if (!tag) return null;
  const key = tag.key || `${tag.type || "meta"}-${index}`;

  if (tag.type === "title") {
    return <title key={key}>{tag.content}</title>;
  }

  if (tag.type === "meta") {
    return <meta key={key} {...(tag.attributes || {})} />;
  }

  if (tag.type === "link") {
    return <link key={key} {...(tag.attributes || {})} />;
  }

  return null;
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

