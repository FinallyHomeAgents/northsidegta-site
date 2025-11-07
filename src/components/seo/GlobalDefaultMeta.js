import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_TITLE = "NorthSide GTA | Real Estate Agents for Buyers & Sellers";
const DEFAULT_DESCRIPTION =
  "Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.";
const DEFAULT_URL = "https://www.northsidegta.ca/";
const DEFAULT_IMAGE = "https://www.northsidegta.ca/Images/og-home.jpg";
const DEFAULT_IMAGE_ALT =
  "NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog";

export default function GlobalDefaultMeta() {
  return (
    <Helmet>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={DEFAULT_TITLE} />
      <meta property="og:description" content={DEFAULT_DESCRIPTION} />
      <meta property="og:url" content={DEFAULT_URL} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:alt" content={DEFAULT_IMAGE_ALT} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="NorthSide GTA" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={DEFAULT_TITLE} />
      <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
    </Helmet>
  );
}
