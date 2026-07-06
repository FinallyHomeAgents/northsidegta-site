#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seoDir = path.join(rootDir, "public", "data", "seo");
const outputPath = path.join(rootDir, "src", "components", "seo", "__generatedSiteSeo.json");

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[sync-site-seo] Skipping ${path.basename(filePath)} — ${error.message}`);
    return null;
  }
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRoute(value) {
  const cleaned = cleanString(value);
  if (!cleaned) return "";
  if (!cleaned.startsWith("/")) {
    return `/${cleaned}`;
  }
  return cleaned;
}

function buildSiteSeoMap() {
  const map = {};
  if (!fs.existsSync(seoDir)) {
    return map;
  }

  const files = fs
    .readdirSync(seoDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  for (const file of files) {
    const filePath = path.join(seoDir, file);
    const data = readJson(filePath);
    if (!data || typeof data !== "object") continue;

    const route = normalizeRoute(data.route || "");
    if (!route) {
      console.warn(`[sync-site-seo] Missing route in ${file}`);
      continue;
    }

    map[route] = {
      seo_title: cleanString(data.seo_title || data.seoTitle),
      seo_description: cleanString(data.seo_description || data.seoDescription),
      seo_image: cleanString(data.seo_image || data.seoImage),
    };
  }

  return map;
}

function writeOutput(map) {
  const sortedEntries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  const sortedMap = Object.fromEntries(sortedEntries);
  const json = `${JSON.stringify(sortedMap, null, 2)}\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, json, "utf8");
  return sortedEntries.length;
}

function main() {
  const map = buildSiteSeoMap();
  const count = writeOutput(map);
  console.log(`[sync-site-seo] Wrote ${count} route${count === 1 ? "" : "s"} to ${path.relative(rootDir, outputPath)}`);
}

main();
