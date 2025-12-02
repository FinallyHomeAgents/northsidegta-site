import React from "react";
import { Helmet } from "react-helmet-async";
import * as globalGraph from "../../lib/structuredData/globalGraph";

const { buildGlobalGraph } = globalGraph;

export default function GlobalStructuredData() {
  const graph = React.useMemo(() => buildGlobalGraph(), []);

  if (!graph) return null;

  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
    </Helmet>
  );
}
