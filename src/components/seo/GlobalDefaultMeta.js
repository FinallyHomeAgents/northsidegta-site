import React from "react";
import { Helmet } from "react-helmet-async";

import { getMetaTagsFromData } from "./metaTagUtils";
import renderHelmetTag from "./renderHelmetTag";
import { DEFAULT_GLOBAL_META_CONFIG } from "./staticRouteMetaExports";

export default function GlobalDefaultMeta() {
  const meta = getMetaTagsFromData(DEFAULT_GLOBAL_META_CONFIG);
  const tags = meta && Array.isArray(meta.tags) ? meta.tags : [];

  if (tags.length === 0) {
    return null;
  }

  return <Helmet>{tags.map(renderHelmetTag)}</Helmet>;
}
