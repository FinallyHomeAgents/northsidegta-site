let cachedSiteSeo = null;

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRoute(value) {
  const cleaned = cleanString(value);
  if (!cleaned) return "";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function loadFromFileSystem() {
  try {
    if (typeof window !== "undefined") {
      return null;
    }
    const fs = eval("require")("fs");
    const path = eval("require")("path");
    const rootDir = process.cwd();
    const seoDir = path.join(rootDir, "public", "data", "seo");
    if (!fs.existsSync(seoDir)) {
      return null;
    }
    const files = fs
      .readdirSync(seoDir)
      .filter((name) => name.toLowerCase().endsWith(".json"))
      .sort();

    const map = {};
    for (const file of files) {
      const filePath = path.join(seoDir, file);
      let data;
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        data = JSON.parse(raw);
      } catch (error) {
        continue;
      }
      const route = normalizeRoute(data && (data.route || data.Route));
      if (!route) continue;
      map[route] = {
        seo_title: cleanString(data.seo_title || data.seoTitle),
        seo_description: cleanString(data.seo_description || data.seoDescription),
        seo_image: cleanString(data.seo_image || data.seoImage),
        og_title: cleanString(data.og_title || data.ogTitle),
        og_description: cleanString(data.og_description || data.ogDescription),
        og_image: cleanString(data.og_image || data.ogImage),
        canonical_url: cleanString(data.canonical_url || data.canonicalUrl),
      };
    }
    return map;
  } catch (error) {
    return null;
  }
}

function loadFromBundle() {
  try {
    // eslint-disable-next-line global-require
    const generated = require("./__generatedSiteSeo.json");
    if (!generated || typeof generated !== "object") {
      return {};
    }
    const map = {};
    for (const [route, value] of Object.entries(generated)) {
      const normalizedRoute = normalizeRoute(route);
      if (!normalizedRoute) continue;
      map[normalizedRoute] = {
        seo_title: cleanString(value && (value.seo_title || value.seoTitle)),
        seo_description: cleanString(value && (value.seo_description || value.seoDescription)),
        seo_image: cleanString(value && (value.seo_image || value.seoImage)),
        og_title: cleanString(value && (value.og_title || value.ogTitle)),
        og_description: cleanString(value && (value.og_description || value.ogDescription)),
        og_image: cleanString(value && (value.og_image || value.ogImage)),
        canonical_url: cleanString(value && (value.canonical_url || value.canonicalUrl)),
      };
    }
    return map;
  } catch (error) {
    return {};
  }
}

function loadSiteSeo() {
  if (cachedSiteSeo) {
    return cachedSiteSeo;
  }
  const fromFs = loadFromFileSystem();
  const map = fromFs || loadFromBundle();
  cachedSiteSeo = map || {};
  return cachedSiteSeo;
}

function getSiteSeoForRoute(route) {
  const map = loadSiteSeo();
  const normalizedRoute = normalizeRoute(route);
  if (!normalizedRoute) return null;
  const entry = map[normalizedRoute];
  if (!entry) return null;
  const hasValues = Boolean(
    entry.seo_title ||
      entry.seo_description ||
      entry.seo_image ||
      entry.og_title ||
      entry.og_description ||
      entry.og_image ||
      entry.canonical_url,
  );
  return hasValues ? entry : null;
}

module.exports = { getSiteSeoForRoute };
