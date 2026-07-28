#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const insightDataDir = path.join(rootDir, "public", "data", "insights");

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  }[extension] || "application/octet-stream";
}

function safeBuildPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(buildDir, relative);
  return candidate === buildDir || candidate.startsWith(`${buildDir}${path.sep}`)
    ? candidate
    : null;
}

function resolveRequest(urlPath) {
  const candidate = safeBuildPath(urlPath);
  if (!candidate) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const indexPath = path.join(candidate, "index.html");
    if (fs.existsSync(indexPath)) return indexPath;
  }
  return path.join(buildDir, "index.html");
}

async function loadRoutes() {
  const { STATIC_ROUTE_META_CONFIGS } = await import(
    "../src/components/seo/staticRouteMetaConfigs.mjs"
  );
  const routes = new Set(
    STATIC_ROUTE_META_CONFIGS
      .filter((entry) => entry?.route && entry?.meta)
      .map((entry) => entry.route)
  );

  if (fs.existsSync(insightDataDir)) {
    fs.readdirSync(insightDataDir)
      .filter((name) => name.endsWith(".json") && name !== "index.json")
      .forEach((name) => {
        const data = JSON.parse(
          fs.readFileSync(path.join(insightDataDir, name), "utf8")
        );
        const slug = data.slug || name.replace(/\.json$/i, "");
        if (slug) routes.add(`/insights/${slug}`);
      });
  }

  return [...routes].filter((route) => route !== "/");
}

async function main() {
  if (!fs.existsSync(path.join(buildDir, "index.html"))) {
    throw new Error("build/index.html does not exist; run this after react-scripts build");
  }

  const routes = await loadRoutes();
  const server = http.createServer((request, response) => {
    const filePath = resolveRequest(request.url || "/");
    if (!filePath || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures = [];

  try {
    for (const route of routes) {
      try {
        await page.goto(`http://127.0.0.1:${port}${route}`, {
          waitUntil: "networkidle",
          timeout: 60_000,
        });
        await page.waitForSelector("#root main, #root [role=main]", {
          timeout: 15_000,
        }).catch(() => page.waitForSelector("#root > *", { timeout: 5_000 }));

        const html = await page.content();
        const outputPath = path.join(
          buildDir,
          route.replace(/^\/+/, ""),
          "index.html"
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, `<!DOCTYPE html>\n${html}`, "utf8");
      } catch (error) {
        failures.push(`${route}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  if (failures.length) {
    failures.forEach((failure) =>
      console.error(`[prerender-routes] ${failure}`)
    );
    throw new Error(`Failed to prerender ${failures.length} route(s)`);
  }

  console.log(
    `[prerender-routes] Rendered full crawlable HTML for ${routes.length} routes`
  );
}

main().catch((error) => {
  console.error(`[prerender-routes] ${error.message}`);
  process.exit(1);
});
