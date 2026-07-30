const fs = require("fs");
const path = require("path");

const RETIRED_COLLECTION_SLUGS = Object.freeze([
  "landontest",
  "slugtest",
  "test-collection",
  "test2",
  "test3",
]);

const retiredCollectionSlugs = new Set(RETIRED_COLLECTION_SLUGS);
const publicStatuses = new Set(["public", "published"]);

function resolveCollectionSlug(data, fileName = "") {
  const configuredSlug = typeof data?.slug === "string" ? data.slug.trim() : "";
  if (configuredSlug) return configuredSlug;
  return String(fileName).replace(/\.json$/i, "").trim();
}

function isPublicCollection(data, slug) {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (!normalizedSlug || retiredCollectionSlugs.has(normalizedSlug)) return false;

  if (
    data?.published === false ||
    data?.public === false ||
    data?.hidden === true ||
    data?.draft === true ||
    data?.disabled === true
  ) {
    return false;
  }

  const status = typeof data?.status === "string" ? data.status.trim().toLowerCase() : "";
  return !status || publicStatuses.has(status);
}

function loadPublicCollections(dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) return [];

  const caller = options.caller || "public-collections";
  const onInvalid =
    typeof options.onInvalid === "function"
      ? options.onInvalid
      : ({ file, reason }) => console.warn(`[${caller}] Skipping collection ${file}: ${reason}`);

  const entries = [];
  const files = fs
    .readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      onInvalid({ file, reason: `Invalid JSON (${error.message})` });
      continue;
    }

    const slug = resolveCollectionSlug(data, file);
    if (!slug) {
      onInvalid({ file, reason: "Missing slug" });
      continue;
    }
    if (!isPublicCollection(data, slug)) continue;

    entries.push({ data, file, filePath, slug });
  }

  return entries;
}

module.exports = {
  RETIRED_COLLECTION_SLUGS,
  isPublicCollection,
  loadPublicCollections,
  resolveCollectionSlug,
};
