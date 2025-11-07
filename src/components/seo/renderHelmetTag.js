import React from "react";

export default function renderHelmetTag(tag, index) {
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
