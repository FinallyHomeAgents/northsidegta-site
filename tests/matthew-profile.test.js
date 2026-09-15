const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const {
  PROFILE_PATH,
  faqEntries,
  buildMatthewProfileSchema,
  buildMatthewProfileMeta,
  MATTHEW_IDENTITY,
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
  assert.match(staticConfig, /route: "\/agents\/matthew-mulhall", meta: buildMatthewProfileMeta\(\)/);
});

test("Matthew social tags use the page-specific image and copy from one SEO source", () => {
  const { getMetaTagsFromData } = require("../src/components/seo/metaTagUtils.js");
  const seo = require("../public/data/seo/matthew-mulhall.json");
  const generatedSeo = require("../src/components/seo/__generatedSiteSeo.json")[PROFILE_PATH];
  for (const key of Object.keys(generatedSeo)) assert.equal(generatedSeo[key], seo[key]);
  const meta = buildMatthewProfileMeta();
  const tags = getMetaTagsFromData(meta).tags;
  function value(key) {
    const matches = tags.filter((tag) => tag.attributes &&
      (tag.attributes.property === key || tag.attributes.name === key));
    assert.equal(matches.length, 1, `Exactly one ${key} tag`);
    return matches[0].attributes.content;
  }
  for (const key of ["og:image", "twitter:image", "og:image:secure_url"]) {
    assert.equal(value(key), `https://northsidegta.ca${seo.og_image}`);
  }
  for (const key of ["og:title", "twitter:title"]) assert.equal(value(key), seo.og_title);
  for (const key of ["og:description", "twitter:description"]) assert.equal(value(key), seo.og_description);
  for (const key of ["og:image:alt", "twitter:image:alt"]) {
    assert.equal(value(key), seo.og_image_alt);
    assert.doesNotMatch(value(key), /Landon/);
  }
  assert.equal(value("og:type"), "profile");
  assert.equal(value("og:image:type"), "image/jpeg");
  assert.equal(String(value("og:image:width")), "1200");
  assert.equal(String(value("og:image:height")), "630");
  const { imageSize } = require("image-size");
  const asset = fs.readFileSync(path.join(root, "public", seo.og_image));
  assert.deepEqual([imageSize(asset).width, imageSize(asset).height], [1200, 630]);
  assert.ok(asset.length < 300000, "Social image stays below 300 KB");
});

test("Matthew identity matches the global graph and team socials belong to the business", () => {
  const profilePerson = buildMatthewProfileSchema()["@graph"].find((node) => node["@type"] === "Person");
  for (const [key, value] of Object.entries(MATTHEW_IDENTITY)) assert.deepEqual(profilePerson[key], value);
  assert.equal(profilePerson.sameAs, undefined);
  const globalSource = fs.readFileSync(path.join(root, "src/lib/structuredData/globalGraph.js"), "utf8");
  const matthewSource = globalSource.split("const matthewMulhall = {")[1].split("const landonMulhall")[0];
  assert.ok(matthewSource.includes('jobTitle: "Sales Representative"'));
  assert.ok(matthewSource.includes('/assets/agents/matthew-mulhall-solo-portrait.jpg'));
  assert.ok(matthewSource.includes('/agents/matthew-mulhall'));
  assert.ok(matthewSource.includes(MATTHEW_IDENTITY.description));
  assert.doesNotMatch(matthewSource, /sameAs/);
});

test("Matthew preview and profile schema are present in HTML before JavaScript runs", () => {
  const { buildHeadFragments } = require("../scripts/generate-static-route-html.js");
  const { getMetaTagsFromData } = require("../src/components/seo/metaTagUtils.js");
  const { parse } = require("node-html-parser");
  const html = buildHeadFragments(
    '<html><head><title>Old</title><meta property="og:image" content="old-about.jpg"></head><body></body></html>',
    "<!DOCTYPE html>",
    getMetaTagsFromData({
      ignoreSiteSeo: true,
      title: "NorthSide GTA",
      ogImage: "https://northsidegta.ca/uploads/og-about-northsidegta.jpg",
      twitterImage: "https://northsidegta.ca/uploads/og-about-northsidegta.jpg",
    }).tags,
    buildMatthewProfileMeta()
  );
  const doc = parse(html);
  assert.equal(doc.querySelectorAll('meta[property="og:image"]').length, 1);
  assert.equal(doc.querySelector('meta[property="og:image"]').getAttribute("content"), buildMatthewProfileMeta().ogImage);
  assert.equal(doc.querySelector('meta[name="twitter:title"]').getAttribute("content"), buildMatthewProfileMeta().twitterTitle);
  assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute("href"), "https://northsidegta.ca/agents/matthew-mulhall");
  const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
  assert.ok(schema["@graph"].some((node) => node["@type"] === "ProfilePage"));
  assert.doesNotMatch(html, /old-about\.jpg|og-about-northsidegta\.jpg/);
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
