#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "public", "content", "insights");
const outputDir = path.join(rootDir, "public", "data", "insights");

const INSIGHTS_UPLOAD_WEB_PATH = "/uploads/insights/";
const INSIGHTS_UPLOAD_INTERNAL_PREFIX = "uploads/insights/";

function splitPathAndSuffix(value) {
  const suffixIndex = value.search(/[?#]/);
  if (suffixIndex === -1) {
    return { path: value, suffix: "" };
  }
  return {
    path: value.slice(0, suffixIndex),
    suffix: value.slice(suffixIndex),
  };
}

function safeString(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return fallback;
}

function normalizeAssetPath(value) {
  const raw = safeString(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith(INSIGHTS_UPLOAD_WEB_PATH)) return raw;

  const normalized = raw
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^\/+/, "");

  if (!normalized) return "";

  const uploadsIndex = normalized.indexOf(INSIGHTS_UPLOAD_INTERNAL_PREFIX);
  if (uploadsIndex !== -1) {
    const remainder = normalized.slice(uploadsIndex + INSIGHTS_UPLOAD_INTERNAL_PREFIX.length);
    if (!remainder) return "";
    const { path: uploadPath, suffix } = splitPathAndSuffix(remainder);
    if (!uploadPath) return "";
    return `${INSIGHTS_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
  }

  const { path: uploadPath, suffix } = splitPathAndSuffix(normalized);
  if (!uploadPath) return "";
  return `${INSIGHTS_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
}

function normalizeGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === "string") {
        const image = normalizeAssetPath(entry);
        if (!image) return null;
        return { image, alt: "", caption: "" };
      }
      const image = normalizeAssetPath(entry.image);
      if (!image) return null;
      return {
        image,
        alt: safeString(entry.alt),
        caption: safeString(entry.caption),
      };
    })
    .filter(Boolean);
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
      featureImage: normalizeAssetPath(data.featureImage || data.feature_image),
      featureImageAlt: safeString(data.featureImageAlt || data.feature_image_alt),
      seo: {
        title: safeString(data?.seo?.title),
        description: safeString(data?.seo?.description),
        ogImage: normalizeAssetPath(data?.seo?.ogImage),
      },
      gallery: normalizeGallery(data.gallery),
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
