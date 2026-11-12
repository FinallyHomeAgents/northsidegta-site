const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const config = require("../vercel.json");

test("retired town overview permanently redirects to the community overview", () => {
  for (const source of ["/towns", "/towns/"]) {
    const redirect = config.redirects.find((entry) => entry.source === source);
    assert.equal(redirect?.destination, "/communities");
    assert.equal(redirect?.statusCode, 308);
  }
});

test("golf URLs redirect to the existing canonical and retain the static destination", () => {
  for (const route of ["/golf-course-living", "/uxbridge-golf-living"]) {
    const redirect = config.redirects.find((entry) => entry.source === route);
    assert.equal(redirect?.destination, `${route}/`);
    assert.equal(redirect?.statusCode, 308);
    assert.equal(config.rewrites.some((entry) => entry.source === route), false);
    assert.equal(config.redirects.some((entry) => entry.source === `${route}/`), false);
    assert.equal(
      config.rewrites.find((entry) => entry.source === `${route}/`)?.destination,
      `${route}/index.html`
    );
  }
  const golfHtml = fs.readFileSync(path.join(root, "public/golf-course-living/index.html"), "utf8");
  assert.match(golfHtml, /rel="canonical" href="https:\/\/northsidegta\.ca\/golf-course-living\/"/);
  assert.match(golfHtml, /name="robots" content="index,follow/);
});

test("relocation metadata stays descriptive and produces the same structured-data URL", () => {
  const modules = [
    ["stouffville", "stouffvilleMovingGuide"],
    ["uxbridge", "uxbridgeMovingGuide"],
    ["eastGwillimbury", "eastGwillimburyMovingGuide"],
    ["scugog", "scugogMovingGuide"],
  ];
  for (const [file, name] of modules) {
    const loaded = require(`../src/content/movingFromToronto/${file}.js`);
    const guide = loaded[name];
    assert.ok(guide.title.length <= 65, `${file}: title too long`);
    assert.ok(guide.description.length <= 165, `${file}: description too long`);
    const schema = loaded.buildMovingGuideSchema(guide);
    assert.ok(JSON.stringify(schema).includes(`https://northsidegta.ca${guide.route}`));
  }
});
