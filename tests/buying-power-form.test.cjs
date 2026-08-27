const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/BuyingPowerPage.js"),
  "utf8",
);

test("buying-power form has a production Formspree fallback", () => {
  assert.match(source, /const DEFAULT_FORMSPREE_ID = "xblkwrzj";/);
  assert.match(
    source,
    /process\.env\.REACT_APP_FORMSPREE_ID \|\| DEFAULT_FORMSPREE_ID/,
  );
  assert.match(source, /fetch\(`https:\/\/formspree\.io\/f\/\$\{formspreeId\}`/);
});
