import React from "react";

import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

const TASTE_HUB_CMS_META = getStaticRouteMeta("/cms/tastehub") || {};

export default function TasteHubCmsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DynamicMetaTags {...TASTE_HUB_CMS_META} />
      <iframe
        src="/cms"
        title="TasteHub CMS"
        className="min-h-screen w-full border-0"
        style={{ minHeight: "100vh" }}
      />
    </div>
  );
}
