#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content", "insights");
const OUTPUT_PATH = path.join(CONTENT_DIR, "_manifest.json");

function safeSlug(value) {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

function buildManifest() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`);
  }

  const entries = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();

  const manifest = [];

  for (const dirName of entries) {
    const indexPath = path.join(CONTENT_DIR, dirName, "index.md");
    if (!fs.existsSync(indexPath)) {
      continue;
    }

    const raw = fs.readFileSync(indexPath, "utf8");
    const { data } = matter(raw);
    const explicitSlug = safeSlug(data?.slug);
    const slug = explicitSlug || safeSlug(dirName);

    if (!slug) {
      console.warn(`Skipping insight without slug: ${indexPath}`);
      continue;
    }

    manifest.push({
      slug,
      dir: dirName,
      path: `${dirName}/index.md`,
      title: data?.title ? data.title.toString() : "",
    });
  }

  manifest.sort((a, b) => a.slug.localeCompare(b.slug));

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

buildManifest();
