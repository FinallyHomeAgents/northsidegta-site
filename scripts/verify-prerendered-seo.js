#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const insightDataDir = path.join(rootDir, "public", "data", "insights");
const origin = "https://northsidegta.ca";

const checks = [
  ["/communities/georgina", "Georgina", "Georgina"],
  ["/communities/east-gwillimbury", "East Gwillimbury", "East Gwillimbury"],
  ["/communities/uxbridge", "Uxbridge", "Uxbridge"],
  ["/about", "Finally Home Agents", "Matthew and Landon"],
  ["/buyers", "You don't have to leave the city", "buyer"],
];

const insightFile = fs
  .readdirSync(insightDataDir)
  .find((name) => name.endsWith(".json") && name !== "index.json");
if (insightFile) {
  const insight = JSON.parse(
    fs.readFileSync(path.join(insightDataDir, insightFile), "utf8")
  );
  const slug = insight.slug || insightFile.replace(/\.json$/i, "");
  checks.push([
    `/insights/${slug}`,
    insight.title,
    String(insight.body || insight.bodyHtml || "").split(/\s+/).find((word) => word.length > 7),
  ]);
}

const failures = [];
for (const [route, h1Text, bodyText] of checks) {
  const filePath = path.join(buildDir, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(filePath)) {
    failures.push(`${route}: missing generated index.html`);
    continue;
  }

  const doc = parse(fs.readFileSync(filePath, "utf8"));
  const title = doc.querySelector("title")?.text.trim() || "";
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const h1 = doc.querySelector("h1")?.text.trim() || "";
  const body = doc.querySelector("body")?.text || "";

  if (!title) failures.push(`${route}: missing title`);
  if (canonical !== `${origin}${route}`) {
    failures.push(`${route}: expected canonical ${origin}${route}, received ${canonical || "<missing>"}`);
  }
  if (!h1.toLowerCase().includes(String(h1Text).toLowerCase())) {
    failures.push(`${route}: H1 does not mention ${h1Text}`);
  }
  if (bodyText && !body.toLowerCase().includes(String(bodyText).toLowerCase())) {
    failures.push(`${route}: initial HTML is missing expected body content`);
  }

  doc.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    try {
      JSON.parse(node.text);
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  });
}

if (failures.length) {
  failures.forEach((failure) => console.error(`[verify-prerendered-seo] ${failure}`));
  process.exit(1);
}

console.log(`[verify-prerendered-seo] ${checks.length} raw-HTML acceptance checks passed`);
