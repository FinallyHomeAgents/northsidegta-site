const assert = require("node:assert/strict");
const test = require("node:test");

const { buildHeadFragments } = require("../scripts/generate-static-route-html.js");
const { getMetaTagsFromData } = require("../src/components/seo/metaTagUtils.js");

const TEMPLATE = `<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="keywords" content="stale keywords" />
  <meta property="og:image" content="https://www.northsidegta.ca/uploads/buyers-page-seo.jpg" />
  <meta name="twitter:image" content="https://www.northsidegta.ca/uploads/buyers-page-seo.jpg" />
</head><body><div id="root"></div></body></html>`;

test("buyers static HTML shell includes route SEO before JavaScript runs", async () => {
  const { DEFAULT_GLOBAL_META_CONFIG, STATIC_ROUTE_META_CONFIGS } = await import(
    "../src/components/seo/staticRouteMetaConfigs.mjs"
  );
  const buyersEntry = STATIC_ROUTE_META_CONFIGS.find((entry) => entry.route === "/buyers");
  assert.ok(buyersEntry, "buyers route is configured for static shell generation");

  const baseMeta = getMetaTagsFromData(DEFAULT_GLOBAL_META_CONFIG);
  const html = buildHeadFragments(
    TEMPLATE,
    "<!DOCTYPE html>",
    baseMeta && Array.isArray(baseMeta.tags) ? baseMeta.tags : [],
    buyersEntry.meta,
  );

  assert.match(html, /<link rel="canonical" href="https:\/\/northsidegta\.ca\/buyers"/);
  assert.match(html, /<meta property="og:url" content="https:\/\/northsidegta\.ca\/buyers"/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/northsidegta\.ca\/uploads\/buyers-page-seo\.jpg"/,
  );
  assert.match(
    html,
    /<meta name="twitter:image" content="https:\/\/northsidegta\.ca\/uploads\/buyers-page-seo\.jpg"/,
  );
  assert.match(html, /<meta name="author" content="Finally Home Agents"/);
  assert.match(html, /<meta name="publisher" content="Finally Home Agents"/);
  assert.match(html, /<script type="application\/ld\+json"[^>]*>/);
  assert.match(html, /"@type":"RealEstateAgent"/);
  assert.match(html, /"@type":"WebPage"/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /name="keywords"/i);
  assert.doesNotMatch(html, /https:\/\/www\.northsidegta\.ca\/uploads\/buyers-page-seo\.jpg/);
  assert.doesNotMatch(html, /aggregateRating/i);
  assert.doesNotMatch(html, /"@type":"Review"/);
});

test("meta tag utility suppresses keyword meta descriptors", () => {
  const meta = getMetaTagsFromData({
    route: "/keyword-filter-test",
    title: "Keyword filter test",
    description: "Keyword filter test description",
    additionalMeta: [
      { name: "keywords", content: "do not render" },
      { name: "author", content: "Finally Home Agents" },
    ],
  });

  const names = meta.tags
    .filter((tag) => tag.type === "meta")
    .map((tag) => tag.attributes && tag.attributes.name)
    .filter(Boolean);

  assert.ok(names.includes("author"));
  assert.ok(!names.includes("keywords"));
});
