#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const insightsDir = path.join(rootDir, "public", "content", "insights");
const INSIGHTS_UPLOAD_WEB_PATH = "/uploads/insights/";
const INSIGHTS_UPLOAD_INTERNAL_PREFIX = "uploads/insights/";

function ensureUploadPath(value) {
  if (value == null) return "";
  const raw = typeof value === "string" ? value.trim() : String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith(INSIGHTS_UPLOAD_WEB_PATH)) return raw;

  const normalized = raw
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^\/+/, "");

  if (!normalized) return "";

  if (normalized.startsWith(INSIGHTS_UPLOAD_INTERNAL_PREFIX)) {
    return `/${normalized}`;
  }

  return `${INSIGHTS_UPLOAD_WEB_PATH}${normalized}`;
}

function updateAssetField(target, key) {
  if (!target || typeof target !== "object") return false;
  if (!Object.prototype.hasOwnProperty.call(target, key)) return false;
  const current = target[key];
  const normalized = ensureUploadPath(current);
  if (!normalized || normalized === current) return false;
  target[key] = normalized;
  return true;
}

function normalizeGalleryEntries(gallery) {
  if (!Array.isArray(gallery)) return false;
  let changed = false;
  gallery.forEach((entry, index) => {
    if (!entry) return;
    if (typeof entry === "string") {
      const normalized = ensureUploadPath(entry);
      if (normalized && normalized !== entry) {
        gallery[index] = normalized;
        changed = true;
      }
      return;
    }

    if (typeof entry === "object") {
      const normalized = ensureUploadPath(entry.image);
      if (normalized && normalized !== entry.image) {
        entry.image = normalized;
        changed = true;
      }
    }
  });
  return changed;
}

function parseImageDestination(destination) {
  if (!destination) return null;
  const trimmed = destination.trim();
  if (!trimmed) return null;

  let body = trimmed;
  let hasAngles = false;
  if (body.startsWith("<") && body.endsWith(">")) {
    body = body.slice(1, -1).trim();
    hasAngles = true;
  }

  const match = body.match(/^([^\s]+?)(?:\s+(['"])(.*)\2)?$/);
  if (!match) {
    return {
      url: body,
      title: "",
      quote: "\"",
      hasAngles,
    };
  }

  return {
    url: match[1],
    title: match[3] || "",
    quote: match[2] || "\"",
    hasAngles,
  };
}

function rewriteMarkdownImages(markdown) {
  if (!markdown) return { content: markdown, changed: false };

  const imagePattern = /!\[([^\]]*)]\(([^)]+)\)/g;
  let changed = false;

  const updated = markdown.replace(imagePattern, (match, altText, destination) => {
    const parsed = parseImageDestination(destination);
    if (!parsed) return match;

    const normalized = ensureUploadPath(parsed.url);
    if (!normalized || normalized === parsed.url) {
      return match;
    }

    changed = true;
    const urlPart = parsed.hasAngles ? `<${normalized}>` : normalized;
    const quote = parsed.quote || '"';
    const titleSegment = parsed.title ? ` ${quote}${parsed.title}${quote}` : "";
    return `![${altText}](${urlPart}${titleSegment})`;
  });

  return { content: updated, changed };
}

function findInsightEntries(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name, "index.md"))
    .filter((filePath) => fs.existsSync(filePath));
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};

  let changed = false;

  if (updateAssetField(data, "featureImage")) changed = true;
  if (updateAssetField(data, "feature_image")) changed = true;

  if (data.seo && typeof data.seo !== "object") {
    data.seo = {};
    changed = true;
  }

  if (data.seo && typeof data.seo === "object") {
    if (updateAssetField(data.seo, "ogImage")) changed = true;
    if (updateAssetField(data.seo, "og_image")) changed = true;
  }

  if (normalizeGalleryEntries(data.gallery)) changed = true;

  const { content: updatedContent, changed: bodyChanged } = rewriteMarkdownImages(parsed.content);
  if (bodyChanged) {
    parsed.content = updatedContent;
    changed = true;
  }

  if (!changed) return false;

  const output = matter.stringify(parsed.content, data, { lineWidth: 1000 });
  fs.writeFileSync(filePath, output, "utf8");
  console.log(`[migrate-insight-image-paths] Updated ${path.relative(rootDir, filePath)}`);
  return true;
}

function main() {
  if (!fs.existsSync(insightsDir)) {
    console.warn(
      `[migrate-insight-image-paths] Skipping — insights directory not found at ${path.relative(rootDir, insightsDir)}`,
    );
    return;
  }

  const files = findInsightEntries(insightsDir);
  if (!files.length) {
    console.log("[migrate-insight-image-paths] No insight markdown files found.");
    return;
  }

  let updatedCount = 0;
  files.forEach((filePath) => {
    if (processFile(filePath)) {
      updatedCount += 1;
    }
  });

  if (updatedCount === 0) {
    console.log("[migrate-insight-image-paths] All insight image paths are already normalized.");
  } else {
    console.log(`[migrate-insight-image-paths] Normalized image paths in ${updatedCount} file${updatedCount === 1 ? "" : "s"}.`);
  }
}

main();
