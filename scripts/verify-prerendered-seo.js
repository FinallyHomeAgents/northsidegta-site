#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const insightDataDir = path.join(rootDir, "public", "data", "insights");
const origin = "https://northsidegta.ca";

const townNames = {
  georgina: "Georgina",
  "east-gwillimbury": "East Gwillimbury",
  newmarket: "Newmarket",
  aurora: "Aurora",
  stouffville: "Stouffville",
  uxbridge: "Uxbridge",
  scugog: "Scugog",
};

const staticChecks = [
  { route: "/about", h1: "About Finally Home Agents", body: "Matthew and Landon" },
  { route: "/buyers", h1: "You don't have to leave the city", body: "Town strategy" },
  { route: "/sellers", h1: "A Better Sale Starts Before the Listing Goes Live", body: "seller" },
  { route: "/homeanalysis", h1: "What’s Your Home Worth", body: "NorthSide GTA Market" },
  { route: "/contact", h1: "Glad you found us", body: "Matthew" },
  { route: "/insights", h1: "NorthSide GTA Insights", body: "market" },
  { route: "/media", h1: "NorthSide GTA Videos", body: "Reels" },
  { route: "/tastehub", h1: "NorthSide TasteHub", body: "community-powered food voting hub" },
  { route: "/community", h1: "NorthSide Events Guide", body: "Browse events" },
  { route: "/neighbourhood-guide", h1: "Compare the NorthSide GTA", body: "Moving north of Toronto" },
];

const failures = [];
let checkedRoutes = 0;

function routeFile(route) {
  if (route === "/") return path.join(buildDir, "index.html");
  return path.join(buildDir, route.replace(/^\//, ""), "index.html");
}

function readRoute(route) {
  const filePath = routeFile(route);
  if (!fs.existsSync(filePath)) {
    failures.push(`${route}: missing generated index.html`);
    return null;
  }
  return parse(fs.readFileSync(filePath, "utf8"));
}

function expectedCanonical(route) {
  return route === "/" ? `${origin}/` : `${origin}${route}`;
}

function schemaTypes(doc) {
  const types = new Set();
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    try {
      const schema = JSON.parse(node.text);
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) {
          value.forEach(visit);
          return;
        }
        const type = value["@type"];
        if (Array.isArray(type)) type.forEach((item) => types.add(item));
        else if (type) types.add(type);
        Object.values(value).forEach(visit);
      };
      visit(schema);
    } catch (error) {
      failures.push(`invalid JSON-LD (${error.message})`);
    }
  });
  return types;
}

function checkRoute({ route, h1, body, title, schema = [] }) {
  const doc = readRoute(route);
  if (!doc) return;
  checkedRoutes += 1;

  const actualTitle = doc.querySelector("title")?.text.trim() || "";
  const canonicals = doc.querySelectorAll('link[rel="canonical"]');
  const canonical = canonicals[0]?.getAttribute("href") || "";
  const actualH1 = doc.querySelector("h1")?.text.replace(/\s+/g, " ").trim() || "";
  const bodyText = doc.querySelector("body")?.text.replace(/\s+/g, " ").trim() || "";

  if (!actualTitle) failures.push(`${route}: missing title`);
  if (title && actualTitle !== title) {
    failures.push(`${route}: expected title "${title}", received "${actualTitle}"`);
  }
  if (canonicals.length !== 1) {
    failures.push(`${route}: expected one canonical, received ${canonicals.length}`);
  }
  if (canonical !== expectedCanonical(route)) {
    failures.push(`${route}: expected canonical ${expectedCanonical(route)}, received ${canonical || "<missing>"}`);
  }
  if (h1 && !actualH1.toLowerCase().includes(h1.toLowerCase())) {
    failures.push(`${route}: H1 does not contain "${h1}"`);
  }
  if (body && !bodyText.toLowerCase().includes(body.toLowerCase())) {
    failures.push(`${route}: initial HTML is missing "${body}"`);
  }

  const types = schemaTypes(doc);
  schema.forEach((type) => {
    if (!types.has(type)) failures.push(`${route}: missing ${type} JSON-LD`);
  });
}

for (const [slug, town] of Object.entries(townNames)) {
  const route = `/communities/${slug}`;
  checkRoute({
    route,
    h1: `Living in ${town}`,
    body: town,
    title: `${town} Real Estate & Homes | Moving to ${town} | Finally Home Agents`,
    schema: ["BreadcrumbList"],
  });
}

staticChecks.forEach(checkRoute);
checkRoute({ route: "/", schema: ["RealEstateAgent", "FAQPage"] });

const insightFiles = fs
  .readdirSync(insightDataDir)
  .filter((name) => name.endsWith(".json") && name !== "index.json")
  .sort();

let checkedInsights = 0;
for (const fileName of insightFiles) {
  const insight = JSON.parse(fs.readFileSync(path.join(insightDataDir, fileName), "utf8"));
  if (insight.draft === true) continue;
  const slug = insight.slug || fileName.replace(/\.json$/i, "");
  const articleText = parse(String(insight.bodyHtml || "")).text.replace(/\s+/g, " ").trim();
  const bodyExcerpt = articleText.split(/\s+/).slice(0, 8).join(" ");
  checkRoute({
    route: `/insights/${slug}`,
    h1: insight.title,
    body: bodyExcerpt,
    schema: ["Article"],
  });
  checkedInsights += 1;
}

function walkIndexFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkIndexFiles(fullPath));
    else if (entry.name === "index.html") files.push(fullPath);
  }
  return files;
}

for (const filePath of walkIndexFiles(buildDir)) {
  const doc = parse(fs.readFileSync(filePath, "utf8"));
  const head = doc.querySelector("head")?.toString() || "";
  if (/www\.northsidegta\.ca/i.test(head)) {
    failures.push(`${path.relative(buildDir, filePath)}: rendered head contains www.northsidegta.ca`);
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`[verify-prerendered-seo] ${failure}`));
  process.exit(1);
}

console.log(
  `[verify-prerendered-seo] ${checkedRoutes} route checks and ${checkedInsights} insight checks passed`,
);
