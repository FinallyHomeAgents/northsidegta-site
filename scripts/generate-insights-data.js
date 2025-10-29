#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "public", "content", "insights");
const outputDir = path.join(rootDir, "public", "data", "insights");

function safeString(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return fallback;
}

function normalizeSlug(value) {
  const raw = safeString(value);
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collapseWhitespace(value) {
  return safeString(value)
    .replace(/\s+/g, " ")
    .trim();
}

function buildSeoDescription(excerpt, body) {
  const source = collapseWhitespace(excerpt) || collapseWhitespace(body);
  if (!source) return "";
  if (source.length <= 150) return source;
  return `${source.slice(0, 149).trimEnd()}…`;
}

function loadInsightMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return matter(raw);
  } catch (error) {
    const relativePath = path.relative(rootDir, filePath);
    throw new Error(`Failed to parse front matter in ${relativePath}: ${error.message}`);
  }
}

function normalizeTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => safeString(item))
    .filter(Boolean);
}

function normalizeImagePath(value) {
  const imagePath = safeString(value);
  if (!imagePath) return "";
  if (/^(?:https?:)?\/\//.test(imagePath)) return imagePath;
  const normalized = imagePath.replace(/^\.+\/?/, "");
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized.replace(/^\/+/, "")}`;
}

function normalizeGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string") {
        const image = normalizeImagePath(item);
        if (!image) return null;
        return { image, alt: "", caption: "" };
      }
      if (typeof item !== "object") return null;
      const image = normalizeImagePath(item.image || item.path || item.src);
      if (!image) return null;
      return {
        image,
        alt: safeString(item.alt),
        caption: safeString(item.caption || item.title || item.description),
      };
    })
    .filter(Boolean);
}

function writeJson(targetPath, data) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, json, "utf8");
}

function main() {
  if (!fs.existsSync(contentDir)) {
    console.warn(
      `[generate-insights-data] Skipping — content directory not found at ${path.relative(rootDir, contentDir)}`,
    );
    process.exit(0);
  }

  const entries = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (!entries.length) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
    console.warn("[generate-insights-data] No insight entries found.");
    return;
  }

  const results = [];
  const failures = [];

  for (const folderName of entries) {
    const folderPath = path.join(contentDir, folderName);
    const indexPath = path.join(folderPath, "index.md");
    const relativeIndexPath = path.relative(rootDir, indexPath);

    if (!fs.existsSync(indexPath)) {
      failures.push({ folderName, reason: "Missing index.md" });
      continue;
    }

    let parsed;
    try {
      parsed = loadInsightMarkdown(indexPath);
    } catch (error) {
      failures.push({ folderName, reason: error.message });
      continue;
    }

    const data = parsed.data || {};
    const folderSlug = normalizeSlug(folderName);
    const frontMatterSlug = normalizeSlug(data.slug);
    const slug = frontMatterSlug || folderSlug;

    if (!slug) {
      failures.push({ folderName, reason: `Unable to derive slug for ${relativeIndexPath}` });
      continue;
    }

    if (slug !== folderSlug) {
      console.warn(
        `[generate-insights-data] Adjusted slug for ${relativeIndexPath} from ${frontMatterSlug || "<missing>"} to ${folderSlug}`,
      );
    }

    const body = parsed.content.replace(/^\uFEFF/, "").replace(/^\n+/, "");
    const excerpt = collapseWhitespace(data.excerpt) || collapseWhitespace(body).slice(0, 150);

    const result = {
      slug: folderSlug,
      title: safeString(data.title),
      publishDate: safeString(data.publishDate || data.publish_date),
      author: safeString(data.author),
      excerpt,
      tags: normalizeTags(data.tags),
      featureImage: safeString(data.featureImage || data.feature_image),
      featureImageAlt: safeString(data.featureImageAlt || data.feature_image_alt),
      gallery: normalizeGallery(data.gallery),
      seo: {
        title: safeString(data?.seo?.title),
        description: safeString(data?.seo?.description),
        ogImage: safeString(data?.seo?.ogImage),
      },
      body,
      sourcePath: relativeIndexPath,
    };

    if (!result.title) {
      failures.push({ folderName, reason: `Missing title in ${relativeIndexPath}` });
      continue;
    }

    if (!result.publishDate) {
      const stats = fs.statSync(indexPath);
      result.publishDate = new Date(stats.mtime).toISOString();
    }

    if (!result.seo.description) {
      result.seo.description = buildSeoDescription(result.excerpt, body);
    }

    if (!result.seo.title && result.title) {
      result.seo.title = `${result.title} | NorthSide GTA`;
    }

    if (!result.seo.ogImage) {
      result.seo.ogImage = result.featureImage;
    }

    const outputPath = path.join(outputDir, `${folderSlug}.json`);
    writeJson(outputPath, result);
    results.push(folderSlug);
  }

  if (failures.length) {
    failures.forEach((failure) => {
      console.error(`[generate-insights-data] ${failure.reason}`);
    });
    process.exitCode = 1;
  }

  if (results.length) {
    console.log(
      `[generate-insights-data] Wrote ${results.length} insight data file${results.length === 1 ? "" : "s"} to ${path.relative(
        rootDir,
        outputDir,
      )}`,
    );
  }
}

main();
