#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..");
const insightsDir = path.join(rootDir, "public", "content", "insights");
const insightDataDir = path.join(rootDir, "public", "data", "insights");
const INSIGHTS_UPLOAD_WEB_PATH = "/uploads/insights/";
const requireGeneratedData = process.argv.includes("--require-generated-data");
const movingGuides = [
  require("../src/content/movingFromToronto/georgina").georginaMovingGuide,
  require("../src/content/movingFromToronto/eastGwillimbury").eastGwillimburyMovingGuide,
  require("../src/content/movingFromToronto/newmarket").newmarketMovingGuide,
  require("../src/content/movingFromToronto/aurora").auroraMovingGuide,
  require("../src/content/movingFromToronto/stouffville").stouffvilleMovingGuide,
  require("../src/content/movingFromToronto/uxbridge").uxbridgeMovingGuide,
  require("../src/content/movingFromToronto/scugog").scugogMovingGuide,
];

function parseImageDestination(destination) {
  if (!destination) return null;
  const trimmed = destination.trim();
  if (!trimmed) return null;

  let body = trimmed;
  if (body.startsWith("<") && body.endsWith(">")) {
    body = body.slice(1, -1).trim();
  }

  const match = body.match(/^([^\s]+)(?:\s+(['"])(.*)\2)?$/);
  if (!match) return null;
  return match[1];
}

function isExternal(url) {
  return /^https?:\/\//i.test(url) || url.startsWith("data:");
}

function extractMarkdownImagePaths(markdown) {
  if (!markdown) return [];
  const results = [];
  const pattern = /!\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const destination = match[1];
    const url = parseImageDestination(destination);
    if (url) {
      results.push(url);
    }
  }
  return results;
}

function extractHtmlImagePaths(html) {
  if (!html) return [];
  return [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function resolvePublicAsset(url) {
  if (!url || isExternal(url)) return null;
  const pathname = url.split(/[?#]/, 1)[0].replace(/^\/+/, "");
  if (!pathname) return null;
  return path.join(rootDir, "public", pathname);
}

function collectGeneratedInsightImages(insight) {
  return [
    insight.featureImage,
    insight.seo?.ogImage,
    ...(insight.gallery || []).map((item) => item.image),
    ...(insight.inlineImages || []).map((item) => item.image),
    insight.pullQuote?.portrait,
    ...(insight.videos || []).flatMap((video) => [
      video.file,
      video.poster,
      video.captions,
    ]),
    ...extractHtmlImagePaths(insight.bodyHtml),
  ].filter(Boolean);
}

function findInsightMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name, "index.md"))
    .filter((filePath) => fs.existsSync(filePath));
}

function main() {
  const files = findInsightMarkdownFiles(insightsDir);
  if (!files.length) {
    console.log("[check-insight-images] No insight markdown files found.");
    return;
  }

  const missing = [];
  const unprefixed = [];

  files.forEach((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const imagePaths = [
      ...extractMarkdownImagePaths(parsed.content),
      ...extractHtmlImagePaths(parsed.content),
    ];
    const relativeMarkdownPath = path.relative(rootDir, filePath);

    imagePaths.forEach((url) => {
      if (isExternal(url)) {
        return;
      }

      if (url.startsWith(INSIGHTS_UPLOAD_WEB_PATH)) {
        const diskPath = path.join(rootDir, "public", url);
        if (!fs.existsSync(diskPath)) {
          missing.push(`${relativeMarkdownPath} -> ${url}`);
        }
        return;
      }

      unprefixed.push(`${relativeMarkdownPath} -> ${url}`);
    });

    const folderName = path.basename(path.dirname(filePath));
    const dataPath = path.join(insightDataDir, `${folderName}.json`);
    if (!fs.existsSync(dataPath)) {
      if (requireGeneratedData) {
        missing.push(`${relativeMarkdownPath} -> missing generated data ${path.relative(rootDir, dataPath)}`);
      }
      return;
    }

    const insight = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    collectGeneratedInsightImages(insight).forEach((url) => {
      const diskPath = resolvePublicAsset(url);
      if (diskPath && !fs.existsSync(diskPath)) {
        missing.push(`${path.relative(rootDir, dataPath)} -> ${url}`);
      }
    });
  });

  movingGuides.forEach((guide) => {
    [guide.heroImage, guide.badgeImage, guide.communityImage].filter(Boolean).forEach((url) => {
      const diskPath = resolvePublicAsset(url);
      if (diskPath && !fs.existsSync(diskPath)) {
        missing.push(`${guide.route} -> ${url}`);
      }
    });
  });

  if (missing.length) {
    console.warn("[check-insight-images] Missing insight image files:");
    missing.forEach((entry) => console.warn(`  - ${entry}`));
  }

  if (unprefixed.length) {
    console.warn("[check-insight-images] Insight markdown images missing /uploads/insights/ prefix:");
    unprefixed.forEach((entry) => console.warn(`  - ${entry}`));
  }

  if (missing.length || unprefixed.length) {
    process.exitCode = 1;
  }

  if (!missing.length && !unprefixed.length) {
    console.log("[check-insight-images] All insight and moving-guide images resolved successfully.");
  }
}

main();
