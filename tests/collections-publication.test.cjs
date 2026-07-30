const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "..");
const {
  RETIRED_COLLECTION_SLUGS,
  isPublicCollection,
  loadPublicCollections,
} = require("../scripts/utils/publicCollections");

test("legacy and explicitly published collections remain public", () => {
  assert.equal(isPublicCollection({}, "legitimate-legacy-collection"), true);
  assert.equal(isPublicCollection({ published: true }, "published-collection"), true);
  assert.equal(isPublicCollection({ status: "published" }, "published-status"), true);
  assert.equal(isPublicCollection({ status: "public" }, "public-status"), true);
});

test("publication controls and retired slug denylist are fail closed", () => {
  assert.equal(isPublicCollection({ published: false }, "draft-collection"), false);
  assert.equal(isPublicCollection({ public: false }, "private-collection"), false);
  assert.equal(isPublicCollection({ hidden: true }, "hidden-collection"), false);
  assert.equal(isPublicCollection({ status: "draft" }, "draft-status"), false);
  assert.equal(isPublicCollection({ status: "unexpected" }, "unknown-status"), false);

  RETIRED_COLLECTION_SLUGS.forEach((slug) => {
    assert.equal(isPublicCollection({ published: true, status: "published" }, slug), false);
  });
});

test("collection loader returns only public records and reports malformed JSON", t => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "northside-collections-"));
  t.after(() => fs.rmSync(fixtureDir, { recursive: true, force: true }));

  fs.writeFileSync(
    path.join(fixtureDir, "legacy.json"),
    JSON.stringify({ slug: "legacy", headline: "Legacy" }),
  );
  fs.writeFileSync(
    path.join(fixtureDir, "draft.json"),
    JSON.stringify({ slug: "draft", published: false }),
  );
  fs.writeFileSync(
    path.join(fixtureDir, "test2.json"),
    JSON.stringify({ slug: "test2", published: true }),
  );
  fs.writeFileSync(path.join(fixtureDir, "broken.json"), "{");

  const invalid = [];
  const publicEntries = loadPublicCollections(fixtureDir, {
    onInvalid: failure => invalid.push(failure),
  });

  assert.deepEqual(publicEntries.map(({ slug }) => slug), ["legacy"]);
  assert.equal(invalid.length, 1);
  assert.equal(invalid[0].file, "broken.json");
});

test("repository sources, tombstones, and legitimate collections stay aligned", () => {
  const collectionDir = path.join(ROOT, "public", "data", "collections");
  const publicSlugs = loadPublicCollections(collectionDir).map(({ slug }) => slug);
  const sourceSlugs = fs
    .readdirSync(collectionDir)
    .filter(file => file.endsWith(".json"))
    .map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(collectionDir, file), "utf8"));
      return typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : file.replace(/\.json$/i, "");
    });
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const rewrites = new Map(vercel.rewrites.map(({ source, destination }) => [source, destination]));
  const removedHandler = fs.readFileSync(path.join(ROOT, "api", "removed-collection.js"), "utf8");

  assert.ok(publicSlugs.includes("northside-gta-under-900k"));
  assert.ok(publicSlugs.includes("detached-homes-georgina"));
  RETIRED_COLLECTION_SLUGS.forEach((slug) => {
    assert.equal(publicSlugs.includes(slug), false);
    assert.equal(sourceSlugs.includes(slug), false);
    assert.equal(rewrites.get(`/collections/${slug}`), "/api/removed-collection");
  });
  assert.match(removedHandler, /status\(410\)/);
  assert.match(removedHandler, /Cache-Control["'],\s*["']no-store/);
});
