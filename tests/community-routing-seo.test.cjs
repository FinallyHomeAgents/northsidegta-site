const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://northsidegta.ca";
const { COMMUNITY_STATIC_CONTENT } = require("../src/components/seo/communityStaticContent.cjs");
const { renderStaticContent, injectIntoRoot } = require("../scripts/inject-community-static-html.js");

const ROUTES = Object.keys(COMMUNITY_STATIC_CONTENT);
const LEGACY_REDIRECTS = {
  "/georgina": "/communities/georgina",
  "/east-gwillimbury": "/communities/east-gwillimbury",
  "/newmarket": "/communities/newmarket",
  "/aurora": "/communities/aurora",
  "/stouffville": "/communities/stouffville",
  "/uxbridge": "/communities/uxbridge",
  "/scugog": "/communities/scugog",
};

test("legacy town routes permanently redirect to preferred community routes", () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const redirects = new Map(vercel.redirects.map((redirect) => [redirect.source, redirect]));

  for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
    const redirect = redirects.get(source);
    assert.ok(redirect, `missing redirect for ${source}`);
    assert.equal(redirect.destination, destination);
    assert.ok([301, 308].includes(redirect.statusCode), `${source} must redirect permanently`);
  }
});

test("community routes have unique titles and self-referencing non-www canonicals", async () => {
  const { getStaticRouteMeta } = await import("../src/components/seo/staticRouteMetaConfigs.mjs");
  const titles = new Set();

  for (const route of ROUTES) {
    const meta = getStaticRouteMeta(route);
    assert.ok(meta, `missing static metadata for ${route}`);
    assert.ok(meta.documentTitle, `missing title for ${route}`);
    assert.ok(meta.description, `missing description for ${route}`);
    assert.equal(meta.canonicalUrl, `${SITE_URL}${route}`);
    assert.doesNotMatch(meta.canonicalUrl, /www\./i);
    assert.notEqual(meta.canonicalUrl, `${SITE_URL}/`);
    titles.add(meta.documentTitle);

    const serializedSchema = JSON.stringify(meta.schema);
    assert.match(serializedSchema, /BreadcrumbList/);
    assert.match(serializedSchema, new RegExp(`${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\/communities`));
    assert.match(serializedSchema, new RegExp(`${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${route}`));
    assert.doesNotMatch(serializedSchema, /https:\/\/www\./i);
  }

  assert.equal(titles.size, ROUTES.length, "community page titles must be unique");
});

test("generated community HTML contains town-specific initial content", () => {
  for (const route of ROUTES) {
    const page = COMMUNITY_STATIC_CONTENT[route];
    const staticMarkup = renderStaticContent(route, page);
    const html = injectIntoRoot("<!doctype html><html><body><div id=\"root\"></div></body></html>", staticMarkup);

    assert.match(html, new RegExp(`<h1>${page.h1}</h1>`));
    assert.match(html, new RegExp(`data-community-static-content=\"${route}\"`));
    assert.match(html, new RegExp(page.paragraphs[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /Home[\s\S]*Communities/);
  }
});

test("sitemap generator uses only preferred community town URLs", () => {
  const generator = fs.readFileSync(path.join(ROOT, "scripts/generate-sitemap.js"), "utf8");
  const siteConfig = JSON.parse(fs.readFileSync(path.join(ROOT, "config/site.json"), "utf8"));

  assert.equal(siteConfig.siteOrigin, SITE_URL);
  assert.match(generator, /`\/communities\/\$\{slug\.trim\(\)\}`/);

  for (const legacyRoute of Object.keys(LEGACY_REDIRECTS)) {
    const literalEntry = `{ path: '${legacyRoute}'`;
    assert.equal(generator.includes(literalEntry), false, `sitemap must exclude ${legacyRoute}`);
  }
});

test("community URL sources do not introduce www URLs", () => {
  const files = [
    "src/components/seo/communityStaticContent.cjs",
    "scripts/inject-community-static-html.js",
    "scripts/generate-sitemap.js",
    "config/site.json",
  ];

  for (const relativePath of files) {
    const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    assert.doesNotMatch(content, /https:\/\/www\.northsidegta\.ca/i, `${relativePath} contains a www URL`);
  }
});
