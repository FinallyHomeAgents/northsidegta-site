#!/usr/bin/env node
/**
 * validate-market-data.js
 *
 * Guards src/data/marketData.v2.json before it can reach a build.
 *
 * Why this exists: TRREB publishes Market Watch as a PDF. Extracting tables from
 * it — by hand or by script — produces silent, plausible-looking garbage. A real
 * extraction attempt returned three different municipalities at an identical
 * average to the dollar, and a town's detached average at 2.5x its true value.
 * Numbers like that are indistinguishable from real ones on a rendered page.
 *
 * Exits non-zero on ERROR so it can sit in prebuild. WARNs do not block.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "marketData.v2.json");
const errors = [];
const warns = [];
const notes = [];

const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// --- bounds. Deliberately wide: we're catching parse failures, not opinions. ---
const LIMITS = {
  avgMin: 250_000, avgMax: 6_000_000,
  ldomMin: 1, ldomMax: 250,
  yoyMin: -45, yoyMax: 45,
  lowSampleSales: 8,       // TRREB town-level counts below this swing wildly
  maxMonthsStale: 2,
};

let doc;
try {
  doc = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (e) {
  console.error(`FATAL  cannot read or parse ${FILE}\n       ${e.message}`);
  process.exit(1);
}

// ---------- freshness ----------
function monthsSince(period) {
  const m = /^(\d{4})-(\d{2})$/.exec(period || "");
  if (!m) return null;
  const then = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

const age = monthsSince(doc?.monthly?.period);
if (age === null) {
  err(`monthly.period must look like "2026-06" (got ${JSON.stringify(doc?.monthly?.period)})`);
} else if (age > LIMITS.maxMonthsStale) {
  err(`monthly data is ${age} months old (${doc.monthly.periodLabel}). ` +
      `The page states a date publicly — stale figures are a misleading representation, not just a stale page.`);
} else if (age === LIMITS.maxMonthsStale) {
  warn(`monthly data is ${age} months old — next Market Watch release should be pulled.`);
}

if (!doc?.monthly?.verifiedBy || !doc?.monthly?.verifiedOn) {
  warn("monthly.verifiedBy / verifiedOn are empty. A human must confirm the figures against the source PDF and sign here.");
}

// ---------- per-metric checks ----------
function checkMetric(where, type, m) {
  if (!m || m.avg == null) return false;           // unpopulated slot, fine
  const { avg, median, sales, ldom, yoy } = m;

  if (typeof avg !== "number" || !Number.isFinite(avg)) {
    err(`${where} · ${type}: avg must be a number, got ${JSON.stringify(avg)}`);
    return true;
  }
  if (avg < LIMITS.avgMin || avg > LIMITS.avgMax)
    err(`${where} · ${type}: avg ${avg.toLocaleString()} is outside ${LIMITS.avgMin.toLocaleString()}–${LIMITS.avgMax.toLocaleString()}. Almost always a column misread.`);

  if (median != null) {
    if (median < avg * 0.45 || median > avg * 1.6)
      err(`${where} · ${type}: median ${median.toLocaleString()} vs avg ${avg.toLocaleString()} — implausible gap, check the row alignment.`);
  }
  if (sales != null) {
    if (sales < 1) err(`${where} · ${type}: sales must be at least 1, got ${sales}`);
    else if (sales < LIMITS.lowSampleSales)
      warn(`${where} · ${type}: only ${sales} sales. Real, but too thin to quote as "the average" without a caveat on the page.`);
  }
  if (ldom != null && (ldom < LIMITS.ldomMin || ldom > LIMITS.ldomMax))
    err(`${where} · ${type}: days on market ${ldom} outside ${LIMITS.ldomMin}–${LIMITS.ldomMax}`);

  if (yoy != null && (yoy < LIMITS.yoyMin || yoy > LIMITS.yoyMax))
    err(`${where} · ${type}: year-over-year ${yoy}% outside ±${LIMITS.yoyMax}%. Verify before publishing.`);

  return true;
}

// ---------- walk ----------
const seen = [];   // {where, type, avg} for duplicate detection
let populated = 0, total = 0;

function walkByType(where, byType) {
  for (const [type, m] of Object.entries(byType || {})) {
    total++;
    if (checkMetric(where, type, m)) {
      populated++;
      seen.push({ where, type, avg: m.avg });
    }
  }
}

const munis = doc.municipalities || {};
if (Object.keys(munis).length !== 7)
  err(`expected 7 municipalities, found ${Object.keys(munis).length}`);

for (const [slug, mu] of Object.entries(munis)) {
  if (!mu.name) err(`municipalities.${slug}: missing name`);
  walkByType(mu.name || slug, mu.byType);
  for (const [ckey, c] of Object.entries(mu.communities || {}))
    walkByType(`${mu.name || slug} › ${c.name || ckey}`, c.byType);
}
walkByType("Toronto (city-wide)", doc?.toronto?.cityWide);
for (const [code, d] of Object.entries(doc?.toronto?.districts || {}))
  walkByType(`Toronto ${code} (${d.name || "?"})`, d.byType);

// ---------- internal consistency: a type vs its own area's all-types ----------
// A detached average 2.5x the town's own all-types average is not a market
// signal, it's a misread row. This is what catches the plausible-looking ones.
function crossCheck(where, byType) {
  const all = byType?.all?.avg;
  if (all == null) return;
  for (const [type, m] of Object.entries(byType)) {
    if (type === "all" || m?.avg == null) continue;
    const ratio = m.avg / all;
    if (ratio > 2.0 || ratio < 0.35)
      err(`${where} · ${type}: avg $${m.avg.toLocaleString()} is ${ratio.toFixed(2)}x this area's ` +
          `all-types average of $${all.toLocaleString()}. Detached runs above all-types and condos below, ` +
          `but not by this much — check the row.`);
  }
}
for (const [slug, mu] of Object.entries(munis)) {
  crossCheck(mu.name || slug, mu.byType);
  for (const [ckey, c] of Object.entries(mu.communities || {}))
    crossCheck(`${mu.name || slug} \u203a ${c.name || ckey}`, c.byType);
}
for (const [code, d] of Object.entries(doc?.toronto?.districts || {}))
  crossCheck(`Toronto ${code}`, d.byType);

// ---------- THE important check: identical averages ----------
const byTypeGroups = {};
for (const s of seen) (byTypeGroups[s.type] ||= []).push(s);

for (const [type, rows] of Object.entries(byTypeGroups)) {
  const buckets = {};
  for (const r of rows) (buckets[r.avg] ||= []).push(r.where);
  for (const [avg, wheres] of Object.entries(buckets)) {
    if (wheres.length > 1)
      err(`${wheres.length} places share an identical ${type} average of $${Number(avg).toLocaleString()} ` +
          `(${wheres.join(", ")}). Two areas do not land on the same dollar by chance — this is a PDF parsing artifact.`);
  }
}

notes.push(`${populated} of ${total} figure slots populated (${Math.round((populated / total) * 100)}%).`);
const emptyTypes = Object.entries(doc.homeTypes || {})
  .filter(([k]) => k !== "all" && !seen.some((s) => s.type === k))
  .map(([, label]) => label);
if (emptyTypes.length)
  notes.push(`No data yet for: ${emptyTypes.join(", ")}. Those UI controls stay disabled until filled.`);
if (!Object.values(doc?.toronto?.districts || {}).some((d) => Object.values(d.byType || {}).some((m) => m.avg != null)))
  notes.push("No Toronto district figures yet — the page falls back to a generic comparison until these land.");

// ---------- report ----------
const pad = (s) => s.replace(/\n/g, "\n         ");
console.log("\nmarketData.v2.json\n" + "─".repeat(64));
notes.forEach((n) => console.log(`  note   ${pad(n)}`));
warns.forEach((w) => console.log(`  WARN   ${pad(w)}`));
errors.forEach((e) => console.log(`  ERROR  ${pad(e)}`));
console.log("─".repeat(64));

if (errors.length) {
  console.log(`FAILED — ${errors.length} error${errors.length > 1 ? "s" : ""}, ${warns.length} warning${warns.length === 1 ? "" : "s"}.\n`);
  process.exit(1);
}
console.log(`OK — ${warns.length} warning${warns.length === 1 ? "" : "s"}, nothing blocking.\n`);
