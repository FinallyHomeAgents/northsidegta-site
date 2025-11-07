import React from "react";
import { Helmet } from "react-helmet-async";

import {
  DEFAULT_META_IMAGE_PATH,
  SITE_BASE_URL,
  getMetaTagsFromData,
} from "./metaTagUtils";
import renderHelmetTag from "./renderHelmetTag";

const DEFAULT_TITLE = "NorthSide GTA | Real Estate Agents for Buyers & Sellers";
const DEFAULT_DESCRIPTION =
  "Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.";
const DEFAULT_IMAGE_ALT =
  "NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog";

const DEFAULT_META_CONFIG = {
  route: "/",
  documentTitle: DEFAULT_TITLE,
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  canonicalUrl: `${SITE_BASE_URL}/`,
  ogType: "website",
  ogImage: DEFAULT_META_IMAGE_PATH,
  ogImageAlt: DEFAULT_IMAGE_ALT,
  twitterCard: "summary_large_image",
  twitterImage: DEFAULT_META_IMAGE_PATH,
  twitterImageAlt: DEFAULT_IMAGE_ALT,
  siteName: "NorthSide GTA",
};

export default function GlobalDefaultMeta() {
  const meta = getMetaTagsFromData(DEFAULT_META_CONFIG);
  const tags = meta && Array.isArray(meta.tags) ? meta.tags : [];

  if (tags.length === 0) {
    return null;
  }

  return <Helmet>{tags.map(renderHelmetTag)}</Helmet>;
}
