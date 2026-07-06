import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const { getGlobalGraphJson } = require("../../lib/structuredData/globalGraph");

const ROUTES_WITH_ROUTE_SPECIFIC_SCHEMA_ONLY = new Set(["/buyers"]);

export default function GlobalStructuredData() {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const graphJson = React.useMemo(() => getGlobalGraphJson(), []);

  if (!graphJson || ROUTES_WITH_ROUTE_SPECIFIC_SCHEMA_ONLY.has(normalizedPathname)) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{graphJson}</script>
    </Helmet>
  );
}
