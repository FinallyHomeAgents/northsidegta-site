#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");
const { loadPublishedInsights } = require("./utils/publishedInsights");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const insightDataDir = path.join(rootDir, "public", "data", "insights");
const origin = "https://northsidegta.ca";
const marketData = require(path.join(rootDir, "src", "data", "marketData.json"));
const retiredInsightSlugs = [
  "lando-test-2",
  "lando-test",
  "sample-launch",
  "sample-rich-media",
  "test4",
  "test5",
  "testing-123",
  "testpage",
  "testpage2",
];

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
  {
    route: "/moving-to-georgina-from-toronto",
    h1: "Moving to Georgina from Toronto: The Honest 2026 Guide",
    body: "What your Toronto money buys in Georgina",
    title: "Moving to Georgina from Toronto (2026 Guide) | Finally Home Agents",
    schema: ["Article", "FAQPage", "BreadcrumbList"],
  },
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
const checkedTownTitles = [];

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

function schemaNodes(doc, route) {
  const nodes = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    nodes.push(value);
    Object.values(value).forEach(visit);
  };

  doc.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    try {
      visit(JSON.parse(node.text));
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  });
  return nodes;
}

function schemaTypes(nodes) {
  const types = new Set();
  nodes.forEach((node) => {
    const type = node["@type"];
    if (Array.isArray(type)) type.forEach((item) => types.add(item));
    else if (type) types.add(type);
  });
  return types;
}

function nodeHasType(node, expectedType) {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(expectedType) : type === expectedType;
}

function validateSiteEntity(nodes, route) {
  nodes.filter((node) => nodeHasType(node, "RealEstateAgent")).forEach((node) => {
    if (node.name !== "Finally Home Agents") {
      failures.push(`${route}: RealEstateAgent name is "${node.name || "<missing>"}"`);
    }
    if (node.alternateName !== "NorthSide GTA") {
      failures.push(`${route}: RealEstateAgent alternateName is "${node.alternateName || "<missing>"}"`);
    }
    if (node.url !== origin) {
      failures.push(`${route}: RealEstateAgent url is "${node.url || "<missing>"}"`);
    }
  });

  nodes
    .filter((node) => typeof node.name === "string" && /^Finally Home Agents(?:\s|$)/.test(node.name))
    .forEach((node) => {
      if (node.name !== "Finally Home Agents") {
        failures.push(`${route}: inconsistent JSON-LD entity name "${node.name}"`);
      }
    });

  nodes.filter((node) => nodeHasType(node, "Article") || nodeHasType(node, "BlogPosting")).forEach((article) => {
    const publisher = article.publisher;
    if (!publisher || typeof publisher !== "object") {
      failures.push(`${route}: Article is missing a publisher reference`);
      return;
    }
    if (publisher.name && publisher.name !== "Finally Home Agents") {
      failures.push(`${route}: Article publisher name is "${publisher.name}"`);
    }
    if (publisher.name && publisher.alternateName !== "NorthSide GTA") {
      failures.push(`${route}: Article publisher alternateName is "${publisher.alternateName || "<missing>"}"`);
    }
    if (publisher.name && publisher.url !== origin) {
      failures.push(`${route}: Article publisher url is "${publisher.url || "<missing>"}"`);
    }
  });
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

  const nodes = schemaNodes(doc, route);
  const types = schemaTypes(nodes);
  validateSiteEntity(nodes, route);
  schema.forEach((type) => {
    if (!types.has(type)) failures.push(`${route}: missing ${type} JSON-LD`);
  });

  return { title: actualTitle, canonical, h1: actualH1, body: bodyText };
}

for (const [slug, town] of Object.entries(townNames)) {
  const route = `/communities/${slug}`;
  const result = checkRoute({
    route,
    h1: `Living in ${town}`,
    body: town,
    title: `${town} Real Estate & Homes | Moving to ${town} | Finally Home Agents`,
    schema: ["BreadcrumbList"],
  });
  if (result?.title) checkedTownTitles.push(result.title);
}

if (new Set(checkedTownTitles).size !== Object.keys(townNames).length) {
  failures.push("community pages do not have seven unique titles");
}

staticChecks.forEach(checkRoute);
checkRoute({ route: "/", schema: ["RealEstateAgent", "FAQPage"] });

const publishedInsights = loadPublishedInsights(path.join(rootDir, "public"), "verify-prerendered-seo");
const publishedInsightSlugs = new Set(publishedInsights.map(({ slug }) => slug));
const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8"));
const rewritesBySource = new Map(
  (vercelConfig.rewrites || []).map(({ source, destination }) => [source, destination]),
);
const cacheRules = vercelConfig.headers || [];
const cacheHeaderFor = (source) =>
  cacheRules
    .find((rule) => rule.source === source)
    ?.headers?.find(({ key }) => key.toLowerCase() === "cache-control")
    ?.value;
const htmlCacheRuleIndex = cacheRules.findIndex((rule) => rule.source === "/(.*)");
const staticCacheRuleIndex = cacheRules.findIndex((rule) => rule.source === "/static/(.*)");

if (cacheHeaderFor("/(.*)") !== "public, max-age=0, must-revalidate") {
  failures.push("vercel.json: catch-all HTML/SPA fallback cache policy is not max-age=0, must-revalidate");
}
if (cacheHeaderFor("/static/(.*)") !== "public, max-age=31536000, immutable") {
  failures.push("vercel.json: hashed static assets are not configured as immutable");
}
if (htmlCacheRuleIndex === -1 || staticCacheRuleIndex <= htmlCacheRuleIndex) {
  failures.push("vercel.json: immutable /static override must follow the catch-all cache rule");
}
cacheRules.forEach((rule) => {
  const value = rule.headers
    ?.find(({ key }) => key.toLowerCase() === "cache-control")
    ?.value || "";
  const maxAge = Number(value.match(/(?:^|,\s*)max-age=(\d+)/i)?.[1] || 0);
  const sharedMaxAge = Number(value.match(/(?:^|,\s*)s-maxage=(\d+)/i)?.[1] || 0);
  if ((maxAge > 0 || sharedMaxAge > 0) && rule.source !== "/static/(.*)") {
    failures.push(`vercel.json: non-static route ${rule.source} has a long cache TTL (${value})`);
  }
});

const removedInsightApi = fs.readFileSync(path.join(rootDir, "api", "removed-insight.js"), "utf8");
if (!/status\(410\)/.test(removedInsightApi) || !/Cache-Control["'],\s*["']no-store/.test(removedInsightApi)) {
  failures.push("api/removed-insight.js: retired insight response must be 410 with Cache-Control: no-store");
}

retiredInsightSlugs.forEach((slug) => {
  if (publishedInsightSlugs.has(slug)) {
    failures.push(`/insights/${slug}: retired slug is present in the published index`);
  }
  if (rewritesBySource.get(`/insights/${slug}`) !== "/api/removed-insight") {
    failures.push(`/insights/${slug}: retired slug is missing its HTTP 410 rewrite`);
  }
});

let checkedInsights = 0;
for (const { slug: publishedSlug } of publishedInsights) {
  const fileName = `${publishedSlug}.json`;
  const filePath = path.join(insightDataDir, fileName);
  if (!fs.existsSync(filePath)) {
    failures.push(`/insights/${publishedSlug}: missing published insight data`);
    continue;
  }
  const insight = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const slug = insight.slug || fileName.replace(/\.json$/i, "");
  if (slug !== publishedSlug) {
    failures.push(`/insights/${publishedSlug}: payload slug is ${slug}`);
    continue;
  }
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

const generatedInsightSlugs = fs
  .readdirSync(path.join(buildDir, "insights"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(buildDir, "insights", entry.name, "index.html")))
  .map((entry) => entry.name)
  .sort();

const unexpectedInsightSlugs = generatedInsightSlugs.filter((slug) => !publishedInsightSlugs.has(slug));
const missingInsightSlugs = [...publishedInsightSlugs].filter((slug) => !generatedInsightSlugs.includes(slug));
if (unexpectedInsightSlugs.length) {
  failures.push(`generated unpublished insight pages: ${unexpectedInsightSlugs.join(", ")}`);
}
if (missingInsightSlugs.length) {
  failures.push(`missing published insight pages: ${missingInsightSlugs.join(", ")}`);
}

const sitemapPath = path.join(buildDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  failures.push("sitemap.xml: missing from production build");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const sitemapInsightSlugs = [...sitemap.matchAll(/<loc>https:\/\/northsidegta\.ca\/insights\/([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .sort();
  const unexpectedSitemapSlugs = sitemapInsightSlugs.filter((slug) => !publishedInsightSlugs.has(slug));
  const missingSitemapSlugs = [...publishedInsightSlugs].filter((slug) => !sitemapInsightSlugs.includes(slug));
  if (unexpectedSitemapSlugs.length) {
    failures.push(`sitemap.xml advertises unpublished insights: ${unexpectedSitemapSlugs.join(", ")}`);
  }
  if (missingSitemapSlugs.length) {
    failures.push(`sitemap.xml is missing published insights: ${missingSitemapSlugs.join(", ")}`);
  }
}

const homepageText = readRoute("/")?.querySelector("body")?.text.replace(/\s+/g, " ").trim() || "";
[
  marketData.period,
  marketData.source,
  marketData.homeType,
  ...Object.values(marketData.municipalities).flatMap(({ averageSalePrice, salesCount, avgLdom }) => [
    averageSalePrice,
    `Sales count ${salesCount}`,
    `Avg. LDOM ${avgLdom}`,
  ]),
].forEach((value) => {
  if (!homepageText.includes(value)) {
    failures.push(`/: homepage market snapshot is missing shared value "${value}"`);
  }
});

Object.entries(marketData.municipalities).forEach(([slug, town]) => {
  const route = `/communities/${slug}`;
  const communityText = readRoute(route)?.querySelector("body")?.text.replace(/\s+/g, " ").trim() || "";
  [
    marketData.period,
    `Source: ${marketData.source}`,
    town.averageSalePrice,
    "Sales count",
    String(town.salesCount),
    "Avg. LDOM",
    String(town.avgLdom),
  ].forEach((value) => {
    if (!communityText.includes(value)) {
      failures.push(`${route}: community market snapshot is missing shared value "${value}"`);
    }
  });
});

const movingGuideRoute = "/moving-to-georgina-from-toronto";
const movingGuideDoc = readRoute(movingGuideRoute);
const movingGuideText = movingGuideDoc?.querySelector("body")?.text.replace(/\s+/g, " ").trim() || "";
const movingGuideHtml = movingGuideDoc?.toString() || "";
[
  marketData.period,
  `Source: ${marketData.source}`,
  marketData.homeType,
  ...["georgina", "newmarket", "aurora"].flatMap((slug) => {
    const town = marketData.municipalities[slug];
    return [
      town.averageSalePrice,
      String(town.salesCount),
      String(town.avgLdom),
      town.yearOverYear,
    ];
  }),
].forEach((value) => {
  if (!movingGuideText.includes(value)) {
    failures.push(`${movingGuideRoute}: moving guide is missing shared market value "${value}"`);
  }
});

[
  'href="/communities/georgina"',
  'href="/tastehub?town=georgina"',
  'href="/neighbourhood-guide"',
  'href="/buyers#town-match"',
  'href="/contact"',
  'href="https://wa.me/16476684646"',
].forEach((value) => {
  if (!movingGuideHtml.includes(value)) {
    failures.push(`${movingGuideRoute}: missing outbound link ${value}`);
  }
});

if (marketData.toronto?.condoAverage == null && /The average Toronto condo now sells for/.test(movingGuideText)) {
  failures.push(`${movingGuideRoute}: Toronto comparison must be hidden while placeholder values are null`);
}

const robots = fs.readFileSync(path.join(rootDir, "public", "robots.txt"), "utf8");
if (
  !/User-agent:\s*\*/i.test(robots) ||
  !/Allow:\s*\/\s*$/im.test(robots) ||
  /User-agent:\s*(GPTBot|ClaudeBot|Claude-Web|PerplexityBot|Google-Extended)/i.test(robots)
) {
  failures.push("robots.txt: AI crawlers are not covered solely by the permissive wildcard policy");
}

const llmsPath = path.join(rootDir, "public", "llms.txt");
if (!fs.existsSync(llmsPath)) {
  failures.push("llms.txt: missing");
} else {
  const llms = fs.readFileSync(llmsPath, "utf8");
  const llmsLines = llms.split(/\r?\n/).length;
  if (llmsLines > 60) failures.push(`llms.txt: ${llmsLines} lines exceeds the 60-line limit`);
  [
    "Matthew Mulhall",
    "Landon Mulhall",
    "HomeLife Optimum Realty",
    "RECO",
    `${origin}/contact`,
    `${origin}/sitemap.xml`,
    ...Object.keys(townNames).map((slug) => `${origin}/communities/${slug}`),
  ].forEach((value) => {
    if (!llms.includes(value)) failures.push(`llms.txt: missing "${value}"`);
  });
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
  const relativeRoute = path.relative(buildDir, filePath);
  if (/www\.northsidegta\.ca/i.test(head)) {
    failures.push(`${relativeRoute}: rendered head contains www.northsidegta.ca`);
  }
  validateSiteEntity(schemaNodes(doc, relativeRoute), relativeRoute);
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
if (/www\.northsidegta\.ca/i.test(sitemap)) {
  failures.push("sitemap.xml contains www.northsidegta.ca");
}

if (failures.length) {
  failures.forEach((failure) => console.error(`[verify-prerendered-seo] ${failure}`));
  process.exit(1);
}

console.log(
  `[verify-prerendered-seo] ${checkedRoutes} route checks and ${checkedInsights} insight checks passed`,
);
console.log("[audit] PASS — 7 community pages: unique H1/title, self canonical, BreadcrumbList");
console.log("[audit] PASS — 10 static pages: crawlable body content and self canonicals");
console.log(`[audit] PASS — ${checkedInsights} published insights: body content and Article JSON-LD`);
console.log("[audit] PASS — homepage and community snapshots: exact shared June 2026 market data");
console.log("[audit] PASS — sitemap: published non-www URLs only; rendered heads: zero www references");
console.log("[audit] PASS — cache: HTML/fallback revalidate, hashed assets immutable, retired insights 410/no-store");
console.log("[audit] PASS — AI search: llms.txt, permissive robots, consistent site entity JSON-LD");
