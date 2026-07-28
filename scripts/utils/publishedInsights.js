const fs = require("fs");
const path = require("path");

function loadPublishedInsights(publicDir, caller = "published-insights") {
  const indexPath = path.join(publicDir, "content", "insights", "index.json");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`[${caller}] Published insights index not found at ${indexPath}`);
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch (error) {
    throw new Error(`[${caller}] Unable to parse published insights index: ${error.message}`);
  }

  if (!Array.isArray(entries)) {
    throw new Error(`[${caller}] Published insights index must contain an array`);
  }

  const seen = new Set();
  return entries.map((entry, index) => {
    const slug = typeof entry?.slug === "string" ? entry.slug.trim() : "";
    if (!slug) {
      throw new Error(`[${caller}] Published insight at index ${index} is missing a slug`);
    }
    if (seen.has(slug)) {
      throw new Error(`[${caller}] Published insights index contains duplicate slug: ${slug}`);
    }
    seen.add(slug);
    return { ...entry, slug };
  });
}

module.exports = { loadPublishedInsights };
