import React from "react";
import { Helmet } from "react-helmet-async";

import { getGlobalGraphJson } from "../../lib/structuredData/globalGraph";

export default function GlobalStructuredData() {
  const graphJson = React.useMemo(() => getGlobalGraphJson(), []);

  if (!graphJson) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{graphJson}</script>
    </Helmet>
  );
}
