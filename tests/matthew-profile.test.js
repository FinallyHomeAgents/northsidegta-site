const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const {
  PROFILE_PATH,
  faqEntries,
  buildMatthewProfileSchema,
} = require("../src/lib/structuredData/matthewProfile");

test("Matthew profile schema links one profile page to the canonical person entity", () => {
  const schema = buildMatthewProfileSchema();
  const graph = schema["@graph"];
  const profile = graph.find((node) => node["@type"] === "ProfilePage");
  const person = graph.find((node) => node["@type"] === "Person");
  const faq = graph.find((node) => node["@type"] === "FAQPage");

  assert.equal(profile.url, "https://northsidegta.ca/agents/matthew-mulhall");
  assert.equal(profile.mainEntity["@id"], "https://northsidegta.ca/#matthew-mulhall");
  assert.equal(person["@id"], profile.mainEntity["@id"]);
  assert.equal(person.award.length, 3);
  assert.equal(faq.mainEntity.length, faqEntries.length);
});

test("Matthew profile is routed, prerendered, and included in the sitemap source", () => {
  const app = fs.readFileSync(path.join(root, "src", "App.js"), "utf8");
  const prerender = fs.readFileSync(path.join(root, "scripts", "prerender-routes.js"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "scripts", "generate-sitemap.js"), "utf8");

  assert.match(app, /path="\/agents\/matthew-mulhall"/);
  assert.match(prerender, /"\/agents\/matthew-mulhall": "\.\.\/src\/MatthewMulhallPage"/);
  assert.match(sitemap, /path: '\/agents\/matthew-mulhall'/);
});

test("Matthew profile SEO uses a self canonical and crawlable metadata", async () => {
  const { getStaticRouteMeta } = await import("../src/components/seo/staticRouteMetaConfigs.mjs");
  const meta = getStaticRouteMeta(PROFILE_PATH);

  assert.equal(meta.canonicalUrl, "https://northsidegta.ca/agents/matthew-mulhall");
  assert.match(meta.documentTitle, /^Matthew Mulhall/);
  assert.match(meta.description, /HomeLife Optimum Realty/);
  assert.equal(meta.additionalMeta.find((item) => item.name === "robots").content, "index, follow");
  assert.equal(meta.schema["@graph"].some((node) => node["@type"] === "ProfilePage"), true);
});

test("Matthew profile content reuses the FAQ source used by structured data", () => {
  const page = fs.readFileSync(path.join(root, "src", "MatthewMulhallPage.js"), "utf8");
  assert.match(page, /faqEntries\.map/);
  assert.doesNotMatch(page, /best realtor|#1 realtor in/i);
});
