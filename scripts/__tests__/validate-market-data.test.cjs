"use strict";

const assert = require("node:assert/strict");
const {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { dirname, join } = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const REPO_ROOT = join(__dirname, "..", "..");
const VALIDATOR = join(REPO_ROOT, "scripts", "validate-market-data.js");
const DATA_FILE = join(REPO_ROOT, "src", "data", "marketData.v2.json");
const BASE_DOCUMENT = JSON.parse(readFileSync(DATA_FILE, "utf8"));
const TARGET_WHERE = Object.values(BASE_DOCUMENT.municipalities)[0].name;
const NAN_SENTINEL = "__VALIDATE_MARKET_DATA_TEST_NAN__";

function periodMonthsAgo(monthsAgo) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - monthsAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function periodMonthsFromNow(monthsAhead) {
  return periodMonthsAgo(-monthsAhead);
}

function cloneBaseDocument() {
  return JSON.parse(JSON.stringify(BASE_DOCUMENT));
}

function firstPopulatedMetric(doc) {
  return Object.values(doc.municipalities)[0].byType.all;
}

function runValidator(t, mutate = () => {}, { useCurrentPeriod = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "validate-market-data-"));
  const validator = join(root, "scripts", "validate-market-data.js");
  const fixture = join(root, "src", "data", "marketData.v2.json");
  const nanHook = join(root, "revive-nan.cjs");
  const doc = cloneBaseDocument();

  if (useCurrentPeriod) {
    doc.monthly.period = periodMonthsAgo(0);
    doc.monthly.periodLabel = "Current month";
  }
  mutate(doc);

  mkdirSync(dirname(validator), { recursive: true });
  mkdirSync(dirname(fixture), { recursive: true });
  copyFileSync(VALIDATOR, validator);
  writeFileSync(
    fixture,
    JSON.stringify(
      doc,
      (_key, value) => typeof value === "number" && Number.isNaN(value) ? NAN_SENTINEL : value,
      2,
    ),
  );
  writeFileSync(
    nanHook,
    `const originalParse = JSON.parse.bind(JSON);\n` +
      `JSON.parse = (text, reviver) => originalParse(text, function (key, value) {\n` +
      `  const revived = value === ${JSON.stringify(NAN_SENTINEL)} ? Number.NaN : value;\n` +
      `  return typeof reviver === "function" ? reviver.call(this, key, revived) : revived;\n` +
      `});\n`,
  );

  t.after(() => rmSync(root, { recursive: true, force: true }));
  return spawnSync(process.execPath, ["--require", nanHook, validator], {
    encoding: "utf8",
  });
}

function assertPasses(result) {
  assert.equal(result.signal, null);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /OK — \d+ warnings?, nothing blocking\./);
  assert.doesNotMatch(result.stdout, /  ERROR  /);
}

function assertFieldError(result, field, displayedValue) {
  assert.equal(result.signal, null);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.equal(result.stderr, "");
  assert.ok(
    result.stdout.includes(
      `${TARGET_WHERE} · all: ${field} must be a finite number, got ${displayedValue}`,
    ),
    result.stdout,
  );
  assert.match(result.stdout, /FAILED — \d+ errors?, \d+ warnings?\./);
}

const invalidPeriods = [
  ["2026-13", '"2026-13"'],
  ["2026-00", '"2026-00"'],
  ["2026-6", '"2026-6"'],
  ["June 2026", '"June 2026"'],
  ["", '""'],
  [null, "null"],
];

for (const [period, displayed] of invalidPeriods) {
  test(`rejects invalid monthly period ${displayed}`, (t) => {
    const result = runValidator(t, (doc) => {
      doc.monthly.period = period;
    });

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.equal(result.stderr, "");
    assert.ok(result.stdout.includes(`monthly.period must look like "2026-06" (got ${displayed})`));
    assert.match(result.stdout, /  ERROR  /);
  });
}

const futurePeriod = periodMonthsFromNow(1);

test(`rejects future monthly period ${futurePeriod}`, (t) => {
  const result = runValidator(t, (doc) => {
    doc.monthly.period = futurePeriod;
  });

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.equal(result.stderr, "");
  assert.ok(result.stdout.includes(`monthly.period cannot be in the future (got "${futurePeriod}")`));
  assert.match(result.stdout, /  ERROR  /);
});

test("accepts the real document's current monthly period", (t) => {
  assertPasses(runValidator(t, undefined, { useCurrentPeriod: false }));
});

for (const monthsAgo of [0, 1, 2]) {
  test(`accepts a monthly period ${monthsAgo} months old`, (t) => {
    const result = runValidator(t, (doc) => {
      doc.monthly.period = periodMonthsAgo(monthsAgo);
    });

    assertPasses(result);
  });
}

const optionalMetricFields = ["median", "sales", "ldom", "yoy", "newListings"];
const invalidMetricValues = [
  ["n/a", '"n/a"'],
  ["--", '"--"'],
  ["-", '"-"'],
  ["unknown", '"unknown"'],
  ["", '""'],
  ["1,018,511", '"1,018,511"'],
  [Number.NaN, "NaN"],
  [true, "true"],
  [[], "[]"],
  [{}, "{}"],
];

for (const field of optionalMetricFields) {
  for (const [value, displayed] of invalidMetricValues) {
    test(`rejects ${field} value ${displayed}`, (t) => {
      const result = runValidator(t, (doc) => {
        firstPopulatedMetric(doc)[field] = value;
      });

      assertFieldError(result, field, displayed);
    });
  }
}

const validMetricValues = {
  median: 780_000,
  sales: 85,
  ldom: 52,
  yoy: -7.2,
  newListings: 110,
};

for (const [field, value] of Object.entries(validMetricValues)) {
  test(`accepts numeric ${field}`, (t) => {
    const result = runValidator(t, (doc) => {
      firstPopulatedMetric(doc)[field] = value;
    });

    assertPasses(result);
  });

  test(`accepts null ${field}`, (t) => {
    const result = runValidator(t, (doc) => {
      firstPopulatedMetric(doc)[field] = null;
    });

    assertPasses(result);
  });

  test(`accepts omitted ${field}`, (t) => {
    const result = runValidator(t, (doc) => {
      delete firstPopulatedMetric(doc)[field];
    });

    assertPasses(result);
  });
}

test("rejects an implausible Toronto city-wide type ratio", (t) => {
  const result = runValidator(t, (doc) => {
    doc.toronto.cityWide.all.avg = 1_100_000;
    doc.toronto.cityWide.detached.avg = 2_900_000;
  });

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.equal(result.stderr, "");
  assert.ok(
    result.stdout.includes(
      "Toronto (city-wide) · detached: avg $2,900,000 is 2.64x this area's all-types average of $1,100,000",
    ),
    result.stdout,
  );
  assert.match(result.stdout, /  ERROR  /);
});

test("accepts the current empty Toronto city-wide object", (t) => {
  assertPasses(runValidator(t));
});
