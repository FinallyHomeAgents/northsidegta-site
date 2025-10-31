import React from "react";
import { Helmet } from "react-helmet-async";

import { getMetaTagsFromData } from "./metaTagUtils";

export { getMetaTagsFromData } from "./metaTagUtils";

export default function DynamicMetaTags(props) {
  const { children, ...metaProps } = props || {};
  const meta = getMetaTagsFromData(metaProps);

  if (!meta) {
    if (!children) {
      return null;
    }
    return <Helmet>{children}</Helmet>;
  }

  return (
    <Helmet>
      {meta.tags.map(renderHelmetTag)}
      {children}
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

