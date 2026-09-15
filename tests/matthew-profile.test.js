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

test("Matthew profile SEO uses a self canonical and crawlable metadata", () => {
  const generatedMeta = require("../src/components/seo/__generatedSiteSeo.json")[PROFILE_PATH];
  const publicMeta = require("../public/data/seo/matthew-mulhall.json");
  const staticConfig = fs.readFileSync(
    path.join(root, "src", "components", "seo", "staticRouteMetaConfigs.mjs"),
    "utf8"
  );

  assert.equal(publicMeta.canonical_url, "https://northsidegta.ca/agents/matthew-mulhall");
  assert.match(generatedMeta.seo_title, /^Matthew Mulhall/);
  assert.match(generatedMeta.seo_description, /HomeLife Optimum Realty/);
  assert.match(staticConfig, /route: "\/agents\/matthew-mulhall"[\s\S]*schema: buildMatthewProfileSchema\(\)/);
});

test("Matthew profile content reuses the FAQ source used by structured data", () => {
  const page = fs.readFileSync(path.join(root, "src", "MatthewMulhallPage.js"), "utf8");
  assert.match(page, /faqEntries\.map/);
  assert.doesNotMatch(page, /best realtor|#1 realtor in/i);
});

test("Matthew profile uses the solo portrait in both the page and person schema", () => {
  const portrait = "/assets/agents/matthew-mulhall-solo-portrait.jpg";
  const page = fs.readFileSync(path.join(root, "src", "MatthewMulhallPage.js"), "utf8");
  const person = buildMatthewProfileSchema()["@graph"].find((node) => node["@type"] === "Person");

  assert.ok(fs.existsSync(path.join(root, "public", portrait)));
  assert.ok(page.includes(`src="${portrait}"`));
  assert.equal(person.image, `https://northsidegta.ca${portrait}`);
  assert.match(page, /aspect-\[4\/5\]/);
});

test("SEO scripts retain executable permissions", () => {
  for (const script of ["generate-sitemap.js", "seo-check.cjs"]) {
    assert.notEqual(fs.statSync(path.join(root, "scripts", script)).mode & 0o111, 0);
  }
});
