import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

import renderHelmetTag from "./renderHelmetTag";
import { getStaticRouteMeta } from "./staticRouteMetaExports";
import { getMetaTagsFromData } from "./metaTagUtils";

export default function RouteSpecificMeta() {
  const location = useLocation();
  const pathname = (location?.pathname || "/").replace(/\/$/, "") || "/";
  const routeMeta = getStaticRouteMeta(pathname);

  if (!routeMeta) return null;

  const meta = getMetaTagsFromData(routeMeta);
  const tags = meta && Array.isArray(meta.tags) ? meta.tags : [];
  const schema = routeMeta.schema ? JSON.stringify(routeMeta.schema).replace(/</g, "\\u003c") : "";

  return (
    <Helmet>
      {tags.map(renderHelmetTag)}
      {schema ? <script type="application/ld+json">{schema}</script> : null}
    </Helmet>
  );
}
