const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const http = require("node:http");
const { chromium } = require("@playwright/test");
const { parse } = require("node-html-parser");
const {
  buildHeadFragments,
  injectStaticBody,
  loadCommunityBody,
} = require("../scripts/generate-static-route-html.js");
const { getMetaTagsFromData } = require("../src/components/seo/metaTagUtils.js");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://northsidegta.ca";
const TOWNS = [
  ["georgina", "Georgina"],
  ["east-gwillimbury", "East Gwillimbury"],
  ["newmarket", "Newmarket"],
  ["aurora", "Aurora"],
  ["stouffville", "Stouffville"],
  ["uxbridge", "Uxbridge"],
  ["scugog", "Scugog"],
];

async function renderInitialHtml(slug) {
  const { DEFAULT_GLOBAL_META_CONFIG, getStaticRouteMeta } = await import("../src/components/seo/staticRouteMetaConfigs.mjs");
  const template = fs.readFileSync(path.join(ROOT, "public/index.html"), "utf8");
  const baseTags = getMetaTagsFromData(DEFAULT_GLOBAL_META_CONFIG).tags;
  const route = `/communities/${slug}`;
  return injectStaticBody(buildHeadFragments(template, "<!DOCTYPE html>", baseTags, getStaticRouteMeta(route)), loadCommunityBody(route));
}

function assertRedirect(redirects, source, destination) {
  assert.deepEqual(
    redirects.find((redirect) => redirect.source === source),
    { source, destination, statusCode: 308 }
  );
}

function resolveRedirect(redirects, requestUrl) {
  const url = new URL(requestUrl, ORIGIN);
  const redirect = redirects.find((entry) => entry.source === url.pathname);
  if (!redirect) return null;
  return {
    statusCode: redirect.statusCode,
    location: `${redirect.destination}${url.search}`,
  };
}

test("legacy town routes use permanent redirects for slash variants and preserve queries", () => {
  const redirects = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")).redirects;
  for (const [slug] of TOWNS) {
    const destination = `/communities/${slug}`;
    assertRedirect(redirects, `/${slug}`, destination);
    assertRedirect(redirects, `/${slug}/`, destination);

    assert.deepEqual(resolveRedirect(redirects, `/${slug}?utm_source=test&x=1`), {
      statusCode: 308,
      location: `${destination}?utm_source=test&x=1`,
    });
    assert.deepEqual(resolveRedirect(redirects, `/${slug}/?utm_source=test&x=1`), {
      statusCode: 308,
      location: `${destination}?utm_source=test&x=1`,
    });
  }
});

test("community initial HTML has unique SEO, canonical, og:url, breadcrumb and town content", async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [slug, town] of TOWNS) {
    const document = parse(await renderInitialHtml(slug));
    const title = document.querySelector("title")?.text.trim();
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content");
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
    const expectedUrl = `${ORIGIN}/communities/${slug}`;

    assert.ok(title, `${slug} has a title`);
    assert.ok(!titles.has(title), `${slug} title is unique`);
    titles.add(title);
    assert.ok(description, `${slug} has a meta description`);
    assert.ok(!descriptions.has(description), `${slug} description is unique`);
    descriptions.add(description);
    assert.equal(canonical, expectedUrl);
    assert.equal(ogUrl, expectedUrl);
    assert.notEqual(canonical, `${ORIGIN}/`);
    assert.equal(document.querySelector("h1")?.text.trim(), `Living in ${town}`);
    assert.ok(document.querySelector(".page-grid"), `${slug} includes its main content`);
    assert.equal(document.querySelector("#root")?.getAttribute("data-prerender"), "community");
    assert.equal(document.querySelectorAll("h1").length, 1, `${slug} has one initial H1`);

    const schemas = document.querySelectorAll('script[type="application/ld+json"]').map((node) => JSON.parse(node.text));
    const breadcrumb = schemas.flatMap((schema) => schema["@graph"] || []).find((node) => node["@type"] === "BreadcrumbList");
    assert.deepEqual(
      breadcrumb.itemListElement.map(({ name, item }) => ({ name, item })),
      [
        { name: "Home", item: `${ORIGIN}/` },
        { name: "Communities", item: `${ORIGIN}/communities` },
        { name: town, item: expectedUrl },
      ]
    );
    assert.ok(!document.toString().includes("www.northsidegta.ca"));
  }
});

test("sitemap contains preferred community URLs only once and excludes legacy routes", () => {
  const sitemap = fs.readFileSync(path.join(ROOT, "public/sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const duplicates = locations.filter((url, index) => locations.indexOf(url) !== index);
  assert.deepEqual(duplicates, []);
  for (const [slug] of TOWNS) {
    assert.ok(locations.includes(`${ORIGIN}/communities/${slug}`));
    assert.ok(!locations.includes(`${ORIGIN}/${slug}`));
    assert.ok(!locations.includes(`${ORIGIN}/${slug}/`));
  }
  assert.ok(locations.every((url) => !url.includes("www.northsidegta.ca")));
});

function serveBuild(buildDir) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    let relativePath = decodeURIComponent(requestUrl.pathname.replace(/^\//, ""));
    if (!relativePath || relativePath.endsWith("/")) relativePath += "index.html";
    const filePath = path.join(buildDir, relativePath);
    if (!filePath.startsWith(buildDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    const ext = path.extname(filePath);
    const contentType = ext === ".html" ? "text/html" : ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

test("built community pages return 200-equivalent files and hydrate without replacement symptoms", async (t) => {
  const buildDir = path.join(ROOT, "build");
  const staticJsDir = path.join(buildDir, "static/js");
  const representativeHtmlPath = path.join(buildDir, "communities", "georgina", "index.html");
  const mainScript = fs.existsSync(staticJsDir)
    ? fs.readdirSync(staticJsDir).find((file) => /^main\..*\.js$/.test(file))
    : null;
  const hasCurrentPrerender = fs.existsSync(representativeHtmlPath)
    && fs.readFileSync(representativeHtmlPath, "utf8").includes('data-prerender="community"');
  if (!mainScript || !hasCurrentPrerender) {
    t.skip("current production build output is required for the JavaScript hydration smoke test");
    return;
  }

  const { server, origin } = await serveBuild(buildDir);
  const browser = await chromium.launch();
  try {
    for (const [slug, town] of TOWNS) {
      const filePath = path.join(buildDir, "communities", slug, "index.html");
      assert.ok(fs.existsSync(filePath), `${slug} built HTML exists`);
      const page = await browser.newPage();
      const consoleMessages = [];
      page.on("console", (message) => {
        const text = message.text();
        if (/hydration|did not match|content does not match|replaced server HTML/i.test(text)) {
          consoleMessages.push(text);
        }
      });
      page.on("pageerror", (error) => consoleMessages.push(error.message));
      const response = await page.goto(`${origin}/communities/${slug}/`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, `${slug} community route returns 200`);
      const before = await page.locator("#root").evaluate((node) => node.textContent.length);
      await page.waitForTimeout(250);
      const after = await page.locator("#root").evaluate((node) => node.textContent.length);
      assert.equal(await page.locator("h1").count(), 1, `${slug} has one H1 after JS`);
      assert.equal((await page.locator("h1").textContent()).trim(), `Living in ${town}`);
      assert.equal(await page.locator(".page-grid").count(), 1, `${slug} has one main content grid after JS`);
      assert.ok(Math.abs(after - before) < 25, `${slug} avoids gross content replacement after mount`);
      assert.deepEqual(consoleMessages, [], `${slug} has no hydration warnings or page errors`);
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
