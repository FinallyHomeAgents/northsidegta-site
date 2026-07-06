#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const insightsDir = path.join(rootDir, "public", "content", "insights");
const uploadsDir = path.join(rootDir, "public", "uploads", "insights");
const INSIGHTS_UPLOAD_WEB_PATH = "/uploads/insights/";

function parseImageDestination(destination) {
  if (!destination) return null;
  const trimmed = destination.trim();
  if (!trimmed) return null;

  let body = trimmed;
  if (body.startsWith("<") && body.endsWith(">")) {
    body = body.slice(1, -1).trim();
  }

  const match = body.match(/^([^\s]+)(?:\s+(['"])(.*)\2)?$/);
  if (!match) return null;
  return match[1];
}

function isExternal(url) {
  return /^https?:\/\//i.test(url) || url.startsWith("data:");
}

function extractMarkdownImagePaths(markdown) {
  if (!markdown) return [];
  const results = [];
  const pattern = /!\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const destination = match[1];
    const url = parseImageDestination(destination);
    if (url) {
      results.push(url);
    }
  }
  return results;
}

function findInsightMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name, "index.md"))
    .filter((filePath) => fs.existsSync(filePath));
}

function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.warn(
      `[check-insight-images] Skipping verification — uploads directory not found at ${path.relative(rootDir, uploadsDir)}`,
    );
    return;
  }

  const files = findInsightMarkdownFiles(insightsDir);
  if (!files.length) {
    console.log("[check-insight-images] No insight markdown files found.");
    return;
  }

  const missing = [];
  const unprefixed = [];

  files.forEach((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const imagePaths = extractMarkdownImagePaths(parsed.content);
    const relativeMarkdownPath = path.relative(rootDir, filePath);

    imagePaths.forEach((url) => {
      if (isExternal(url)) {
        return;
      }

      if (url.startsWith(INSIGHTS_UPLOAD_WEB_PATH)) {
        const diskPath = path.join(rootDir, "public", url);
        if (!fs.existsSync(diskPath)) {
          missing.push(`${relativeMarkdownPath} -> ${url}`);
        }
        return;
      }

      unprefixed.push(`${relativeMarkdownPath} -> ${url}`);
    });
  });

  if (missing.length) {
    console.warn("[check-insight-images] Missing insight image files:");
    missing.forEach((entry) => console.warn(`  - ${entry}`));
  }

  if (unprefixed.length) {
    console.warn("[check-insight-images] Insight markdown images missing /uploads/insights/ prefix:");
    unprefixed.forEach((entry) => console.warn(`  - ${entry}`));
  }

  if (!missing.length && !unprefixed.length) {
    console.log("[check-insight-images] All insight markdown images resolved successfully.");
  }
}

main();
