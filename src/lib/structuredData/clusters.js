const { PLACE_IDS } = require("./globalGraph");

const INSIGHT_CLUSTERS = {
  "northside-tastehub-launch": ["move-north", "tastehub"],
  "spotlight-on-uxbridge": ["town-spotlight", "uxbridge"],
  "spotlight-on-newmarket": ["town-spotlight", "newmarket"],
  "spotlight-on-aurora": ["town-spotlight", "aurora"],
  "spotlight-on-east-gwillimbury": ["town-spotlight", "east-gwillimbury"],
  "spotlight-on-georgina": ["town-spotlight", "georgina"],
  "spotlight-on-stouffville": ["town-spotlight", "stouffville"],
  "spotlight-on-scugog": ["town-spotlight", "scugog"],
  "why-we-built-northside-gta": ["move-north", "northside-gta"],
  "blue-jays-game7": ["community", "events"],
};

function normalizeSlug(slug) {
  return String(slug || "").toLowerCase();
}

function getInsightClusters(slug) {
  const key = normalizeSlug(slug);
  return INSIGHT_CLUSTERS[key] ? [...INSIGHT_CLUSTERS[key]] : [];
}

function getPlaceIdsFromClusters(clusterIds = []) {
  return clusterIds
    .map((id) => PLACE_IDS[id])
    .filter(Boolean)
    .map((id) => ({ "@id": id }));
}

module.exports = { getInsightClusters, getPlaceIdsFromClusters };
