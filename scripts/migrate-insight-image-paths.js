#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const insightsDir = path.join(rootDir, "public", "content", "insights");
const uploadsDir = path.join(rootDir, "public", "uploads", "insights");
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

function cleanupEmptyDirectories(...dirs) {
  dirs.forEach((dir) => {
    if (!dir) return;
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn(`[migrate-insight-image-paths] Failed to clean up ${path.relative(rootDir, dir)}: ${error.message}`);
    }
  });
}

function moveNestedInsightAssets() {
  if (!fs.existsSync(insightsDir)) return;

  fs.mkdirSync(uploadsDir, { recursive: true });

  const entries = fs
    .readdirSync(insightsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  let movedCount = 0;
  const collisions = [];

  entries.forEach((entry) => {
    const nestedDir = path.join(insightsDir, entry.name, "public", "uploads", "insights");
    if (!fs.existsSync(nestedDir)) return;

    const files = fs.readdirSync(nestedDir, { withFileTypes: true });
    files.forEach((file) => {
      if (!file.isFile()) return;

      const sourcePath = path.join(nestedDir, file.name);
      const targetPath = path.join(uploadsDir, file.name);

      if (fs.existsSync(targetPath)) {
        collisions.push({
          source: path.relative(rootDir, sourcePath),
          target: path.relative(rootDir, targetPath),
        });
        return;
      }

      fs.renameSync(sourcePath, targetPath);
      movedCount += 1;
    });

    cleanupEmptyDirectories(
      nestedDir,
      path.join(insightsDir, entry.name, "public", "uploads"),
      path.join(insightsDir, entry.name, "public"),
    );
  });

  if (movedCount > 0) {
    console.log(
      `[migrate-insight-image-paths] Moved ${movedCount} nested asset${movedCount === 1 ? "" : "s"} into ${path.relative(
        rootDir,
        uploadsDir,
      )}`,
    );
  }

  collisions.forEach(({ source, target }) => {
    console.warn(
      `[migrate-insight-image-paths] Skipped moving ${source} — destination already exists at ${target}. Delete or rename the nested file if it is outdated.`,
    );
  });
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

  moveNestedInsightAssets();

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
