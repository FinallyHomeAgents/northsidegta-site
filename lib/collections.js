// lib/collections.js
const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data", "collections");

function getAllSlugs() {
  if (!fs.existsSync(dataDir)) return [];
  return fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function getPageBySlug(slug) {
  try {
    const raw = fs.readFileSync(path.join(dataDir, `${slug}.json`), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

module.exports = { getAllSlugs, getPageBySlug };