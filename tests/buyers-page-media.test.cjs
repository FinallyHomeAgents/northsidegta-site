const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

test("buyers community video defers its source and respects reduced motion", async () => {
  const source = await readFile(path.join(__dirname, "../src/BuyersPage.js"), "utf8");

  assert.match(source, /function VisibilityVideo/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /isVisible && !prefersReducedMotion/);
  assert.match(source, /preload="none"/);
  assert.match(source, /\{shouldPlay && <source src=\{src\} type="video\/mp4" \/>\}/);
  assert.doesNotMatch(source, /<video[^>]*\bautoPlay\b/);
});
