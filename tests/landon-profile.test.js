const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { imageSize } = require("image-size");

const root = path.resolve(__dirname, "..");
const {
  PROFILE_PATH,
  LANDON_IDENTITY,
  faqEntries,
  buildLandonProfileSchema,
  buildLandonProfileMeta,
} = require("../src/lib/structuredData/landonProfile");

test("Landon profile schema links the canonical person, profile, and FAQs", () => {
  const graph = buildLandonProfileSchema()["@graph"];
  const profile = graph.find((node) => node["@type"] === "ProfilePage");
  const person = graph.find((node) => node["@type"] === "Person");
  const faq = graph.find((node) => node["@type"] === "FAQPage");
  assert.equal(profile.url, "https://northsidegta.ca/agents/landon-mulhall");
  assert.equal(profile.mainEntity["@id"], LANDON_IDENTITY["@id"]);
  assert.equal(person.telephone, "+1-416-455-4594");
  assert.equal(person.sameAs[0], "https://www.instagram.com/lando.realtor/");
  assert.equal(faq.mainEntity.length, faqEntries.length);
  assert.equal(person.award, undefined);
  assert.equal(person.review, undefined);
});

test("Landon profile is routed, prerendered, discoverable, and internally linked", () => {
  const app = fs.readFileSync(path.join(root, "src/App.js"), "utf8");
  const prerender = fs.readFileSync(path.join(root, "scripts/prerender-routes.js"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "scripts/generate-sitemap.js"), "utf8");
  const about = fs.readFileSync(path.join(root, "src/AboutPage.js"), "utf8");
  assert.match(app, /path="\/agents\/landon-mulhall"/);
  assert.match(prerender, /"\/agents\/landon-mulhall": "\.\.\/src\/LandonMulhallPage"/);
  assert.match(sitemap, /path: '\/agents\/landon-mulhall'/);
  assert.match(about, /to="\/agents\/landon-mulhall"/);
});

test("Landon metadata and social image are unique and production ready", () => {
  const seo = require("../public/data/seo/landon-mulhall.json");
  const generated = require("../src/components/seo/__generatedSiteSeo.json")[PROFILE_PATH];
  for (const [key, value] of Object.entries(generated)) assert.equal(value, seo[key]);
  assert.equal(seo.canonical_url, "https://northsidegta.ca/agents/landon-mulhall");
  assert.match(seo.seo_title, /^Landon Mulhall/);
  assert.doesNotMatch(seo.og_image, /matthew|about|homepage/i);
  const asset = fs.readFileSync(path.join(root, "public", seo.og_image));
  assert.deepEqual([imageSize(asset).width, imageSize(asset).height], [1200, 630]);
  assert.ok(asset.length < 300000, "Social image stays below 300 KB");
  const meta = buildLandonProfileMeta();
  assert.equal(meta.ogType, "profile");
  assert.equal(meta.ogImage, `https://northsidegta.ca${seo.og_image}`);
  assert.equal(meta.twitterImage, meta.ogImage);
});

test("Landon page uses his approved facts, FAQ source, and solo portrait", () => {
  const page = fs.readFileSync(path.join(root, "src/LandonMulhallPage.js"), "utf8");
  const portrait = "/assets/agents/landon-mulhall-solo-portrait.jpg";
  assert.ok(fs.existsSync(path.join(root, "public", portrait)));
  assert.match(page, /faqEntries\.map/);
  assert.ok(page.includes(`src="${portrait}"`));
  assert.match(page, /grew up in Uxbridge/i);
  assert.match(page, /East Gwillimbury/i);
  assert.match(page, /LandoTheRealtor@gmail\.com/);
  assert.doesNotMatch(page, /#1 Individual Agent|Since 2009|wife and our twin toddlers/);
  assert.doesNotMatch(page, /best realtor|#1 realtor in/i);
});

test("SEO scripts retain executable permissions", () => {
  for (const script of ["generate-sitemap.js", "seo-check.cjs"]) {
    assert.notEqual(fs.statSync(path.join(root, "scripts", script)).mode & 0o111, 0);
  }
});
