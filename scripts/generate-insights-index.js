#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const INSIGHTS_DIR = path.join(ROOT, "public", "content", "insights");
const OUTPUT_FILE = path.join(INSIGHTS_DIR, "index.json");

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

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function collectInsightEntries(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) continue;

    const markdownPath = path.join(fullPath, "index.md");
    if (!fs.existsSync(markdownPath)) continue;

    const raw = fs.readFileSync(markdownPath, "utf8");
    let frontMatter;
    try {
      frontMatter = matter(raw).data || {};
    } catch (error) {
      const relativePath = path.relative(ROOT, markdownPath);
      console.warn(`Skipping ${relativePath}: ${error.message}`);
      continue;
    }

    const folderSlug = normalizeSlug(entry);
    const frontMatterSlug = normalizeSlug(frontMatter.slug);
    const slug = folderSlug || frontMatterSlug;

    if (folderSlug && frontMatterSlug && folderSlug !== frontMatterSlug) {
      const relativePath = path.relative(ROOT, markdownPath);
      console.warn(
        `[generate-insights-index] Adjusted slug for ${relativePath} from ${frontMatterSlug || "<missing>"} to ${folderSlug}`
      );
    }

    const item = {
      slug,
      title: safeString(frontMatter.title),
      publishDate: safeString(frontMatter.publishDate),
      excerpt: safeString(frontMatter.excerpt),
      featureImage: safeString(frontMatter.featureImage),
      featureImageAlt: safeString(frontMatter.featureImageAlt),
    };

    if (!item.slug || !item.title || !item.publishDate) {
      const relativePath = path.relative(ROOT, markdownPath);
      console.warn(
        `Skipping ${relativePath}: missing required fields (slug/title/publishDate)`
      );
      continue;
    }

    entries.push(item);
  }
  return entries;
}

function sortByPublishDateDesc(a, b) {
  const timeA = new Date(a.publishDate).getTime();
  const timeB = new Date(b.publishDate).getTime();

  const aValid = Number.isFinite(timeA);
  const bValid = Number.isFinite(timeB);
  if (aValid && bValid) {
    return timeB - timeA;
  }
  if (aValid) return -1;
  if (bValid) return 1;
  return 0;
}

function ensureOutputDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  ensureOutputDir(filePath);
  fs.writeFileSync(filePath, `${json}\n`, "utf8");
}

function main() {
  const items = collectInsightEntries(INSIGHTS_DIR).sort(sortByPublishDateDesc);
  writeJson(OUTPUT_FILE, items);
  const relative = path.relative(ROOT, OUTPUT_FILE);
  console.log(`Wrote ${items.length} insights to ${relative}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
