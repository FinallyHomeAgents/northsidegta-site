#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { COMMUNITY_STATIC_CONTENT } = require("../src/components/seo/communityStaticContent.cjs");

const BUILD_DIR = path.resolve(__dirname, "../build");
const SITE_URL = "https://northsidegta.ca";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderStaticContent(route, page) {
  const canonical = `${SITE_URL}${route}`;
  const paragraphs = page.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

  return `<main data-community-static-content="${escapeHtml(route)}" aria-label="${escapeHtml(page.town)} community guide">
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/communities">Communities</a> &rsaquo; <span>${escapeHtml(page.town)}</span></nav>
    <article>
      <h1>${escapeHtml(page.h1)}</h1>
      ${paragraphs}
      <p><a href="${escapeHtml(canonical)}">Explore the complete ${escapeHtml(page.town)} community guide</a></p>
    </article>
  </main><script>document.querySelector('[data-community-static-content]')?.remove();</script>`;
}

function injectIntoRoot(html, content) {
  const emptyRoot = /<div\s+id=["']root["']\s*><\/div>/i;
  if (!emptyRoot.test(html)) {
    throw new Error("Unable to find an empty #root element in generated HTML");
  }
  return html.replace(emptyRoot, `<div id="root">${content}</div>`);
}

function main() {
  let updated = 0;

  for (const [route, page] of Object.entries(COMMUNITY_STATIC_CONTENT)) {
    const filePath = path.join(BUILD_DIR, route.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing generated community page: ${filePath}`);
    }

    const html = fs.readFileSync(filePath, "utf8");
    const nextHtml = injectIntoRoot(html, renderStaticContent(route, page));
    fs.writeFileSync(filePath, nextHtml, "utf8");
    updated += 1;
  }

  console.log(`[inject-community-static-html] Injected initial HTML content into ${updated} community pages`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[inject-community-static-html] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { escapeHtml, renderStaticContent, injectIntoRoot };
