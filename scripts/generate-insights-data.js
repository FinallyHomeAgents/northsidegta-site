#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "public", "content", "insights");
const outputDir = path.join(rootDir, "public", "data", "insights");
const uploadsDir = path.join(rootDir, "public", "uploads", "insights");

const INSIGHTS_UPLOAD_WEB_PATH = "/uploads/insights/";
const INSIGHTS_UPLOAD_INTERNAL_PREFIX = "uploads/insights/";
const INLINE_MEDIA_PLACEMENTS = new Set(["after-h1", "after-p2", "after-p4", "end"]);
const DEFAULT_INLINE_PLACEMENT = "after-p2";
const ALLOWED_ASPECT_RATIOS = new Set(["16:9", "4:3", "3:2", "1:1", "9:16"]);
const DEFAULT_ASPECT_RATIO = "16:9";
const TASTEHUB_POLLS_MODULE = path.join(rootDir, "lib", "tastehub", "getTasteHubPolls.js");

function createMarkdownRenderer() {
  const renderer = new marked.Renderer();
  renderer.image = (token) => {
    const href = token && typeof token === "object" ? token.href : "";
    const title = token && typeof token === "object" ? token.title : "";
    const text = token && typeof token === "object" ? token.text : "";
    const src = normalizeAssetPath(href || "");
    const alt = text || "";
    const titleAttr = title ? ` title="${title}"` : "";
    return `<img src="${src}" alt="${alt}"${titleAttr}>`;
  };
  renderer.html = (token) => {
    if (token && typeof token === "object" && typeof token.text === "string") {
      return token.text;
    }
    return "";
  };
  return renderer;
}

function renderMarkdownToHtml(markdown) {
  if (!markdown) return "";
  return marked.parse(markdown, {
    gfm: true,
    breaks: true,
    smartypants: true,
    headerIds: false,
    mangle: false,
    renderer: createMarkdownRenderer(),
  });
}

function copyFilesRecursively(sourceDir, collisions) {
  let copiedCount = 0;
  let entries = [];
  try {
    entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  } catch (error) {
    console.warn(
      `[generate-insights-data] Unable to read ${path.relative(rootDir, sourceDir)}: ${error.message}`,
    );
    return movedCount;
  }

  entries.forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      copiedCount += copyFilesRecursively(sourcePath, collisions);
      return;
    }

    if (!entry.isFile()) return;

    const targetPath = path.join(uploadsDir, entry.name);
    if (fs.existsSync(targetPath)) {
      const sourceBuffer = fs.readFileSync(sourcePath);
      const targetBuffer = fs.readFileSync(targetPath);
      if (sourceBuffer.equals(targetBuffer)) {
        return;
      }
      collisions.push({
        source: path.relative(rootDir, sourcePath),
        target: path.relative(rootDir, targetPath),
      });
      return;
    }

    fs.copyFileSync(sourcePath, targetPath);
    copiedCount += 1;
  });

  return copiedCount;
}

function copyNestedInsightAssets() {
  if (!fs.existsSync(contentDir)) return;

  fs.mkdirSync(uploadsDir, { recursive: true });

  let copiedCount = 0;
  const collisions = [];

  const entries = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  entries.forEach((entry) => {
    const baseDir = path.join(contentDir, entry.name);
    const nestedUploadsDir = path.join(baseDir, "public", "uploads", "insights");
    if (!fs.existsSync(nestedUploadsDir)) return;

    copiedCount += copyFilesRecursively(nestedUploadsDir, collisions);
  });

  if (copiedCount > 0) {
    console.log(
      `[generate-insights-data] Copied ${copiedCount} nested asset${copiedCount === 1 ? "" : "s"} into ${path.relative(
        rootDir,
        uploadsDir,
      )}`,
    );
  }

  collisions.forEach(({ source, target }) => {
    console.warn(
      `[generate-insights-data] Skipped copying ${source} — a different file already exists at ${target}. Delete or rename the nested file if it is outdated.`,
    );
  });
}

function splitPathAndSuffix(value) {
  const suffixIndex = value.search(/[?#]/);
  if (suffixIndex === -1) {
    return { path: value, suffix: "" };
  }
  return {
    path: value.slice(0, suffixIndex),
    suffix: value.slice(suffixIndex),
  };
}

function safeString(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return fallback;
}

function normalizeAssetPath(value) {
  const raw = safeString(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith(INSIGHTS_UPLOAD_WEB_PATH)) return raw;

  const normalized = raw
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^\/+/, "");

  if (!normalized) return "";

  const uploadsIndex = normalized.indexOf(INSIGHTS_UPLOAD_INTERNAL_PREFIX);
  if (uploadsIndex !== -1) {
    const remainder = normalized.slice(uploadsIndex + INSIGHTS_UPLOAD_INTERNAL_PREFIX.length);
    if (!remainder) return "";
    const { path: uploadPath, suffix } = splitPathAndSuffix(remainder);
    if (!uploadPath) return "";
    return `${INSIGHTS_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
  }

  const { path: uploadPath, suffix } = splitPathAndSuffix(normalized);
  if (!uploadPath) return "";
  return `${INSIGHTS_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
}

function normalizeEmbeddedPollSlugs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry === "string") return normalizeSlug(entry);
      if (entry && typeof entry === "object") return normalizeSlug(entry.pollSlug || entry.slug || entry.value);
      if (entry == null) return "";
      return normalizeSlug(entry);
    })
    .filter(Boolean);
}

function normalizeEmbeddedPoll(poll) {
  if (!poll || typeof poll !== "object") return null;
  const slug = normalizeSlug(poll.slug || poll.id);
  if (!slug) return null;

  const ballotItems = Array.isArray(poll.ballotItems)
    ? poll.ballotItems
        .map((item) => {
          if (!item) return null;
          const name = safeString(item.name);
          if (!name) return null;
          const id = normalizeSlug(item.id || name) || name;
          return { id, name, address: safeString(item.address), link: safeString(item.link) };
        })
        .filter(Boolean)
    : [];

  return {
    slug,
    title: safeString(poll.title) || "Untitled Poll",
    description: safeString(poll.description),
    town: safeString(poll.town),
    category: safeString(poll.category),
    customCategory: safeString(poll.customCategory || poll.custom_category),
    displayCategory: safeString(poll.displayCategory || poll.customCategory || poll.custom_category || poll.category),
    status: safeString(poll.status || "draft").toLowerCase(),
    rankingKey: safeString(poll.rankingKey || poll.ranking_key || slug),
    featured: Boolean(poll.featured),
    ballotItems,
    image: safeString(poll.image),
    createdAt: safeString(poll.createdAt || poll.updatedAt),
    updatedAt: safeString(poll.updatedAt || poll.createdAt),
  };
}

function normalizeGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === "string") {
        const image = normalizeAssetPath(entry);
        if (!image) return null;
        return { image, alt: "", caption: "" };
      }
      const image = normalizeAssetPath(entry.image);
      if (!image) return null;
      return {
        image,
        alt: safeString(entry.alt),
        caption: safeString(entry.caption),
      };
    })
    .filter(Boolean);
}

function normalizePlacement(value, fallback = DEFAULT_INLINE_PLACEMENT) {
  const raw = safeString(value).toLowerCase();
  if (INLINE_MEDIA_PLACEMENTS.has(raw)) return raw;
  return fallback;
}

function normalizeInlineImages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      const image = normalizeAssetPath(entry.image || entry.src || entry.path || entry);
      if (!image) return null;
      return {
        image,
        alt: safeString(entry.alt),
        caption: safeString(entry.caption),
        placement: normalizePlacement(entry.placement, DEFAULT_INLINE_PLACEMENT),
      };
    })
    .filter(Boolean);
}

function normalizePullQuote(raw) {
  if (!raw || typeof raw !== "object") return null;
  const text = safeString(raw.text);
  if (!text) return null;
  return {
    text,
    attribution: safeString(raw.attribution),
    portrait: normalizeAssetPath(raw.portrait || raw.image),
  };
}

function normalizeAspectRatio(value) {
  const raw = safeString(value);
  if (ALLOWED_ASPECT_RATIOS.has(raw)) return raw;
  return DEFAULT_ASPECT_RATIO;
}

function normalizePlayerOptions(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      autoplay: false,
      loop: false,
      showControls: true,
      startAt: 0,
    };
  }
  const startAtNumber = Number(raw.startAt);
  return {
    autoplay: Boolean(raw.autoplay),
    loop: Boolean(raw.loop),
    showControls: raw.showControls !== false,
    startAt: Number.isFinite(startAtNumber) && startAtNumber >= 0 ? Math.floor(startAtNumber) : 0,
  };
}

function normalizeVideos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const externalUrl = safeString(entry.externalUrl || entry.url || entry.href);
      const file = normalizeAssetPath(entry.file || entry.src || entry.video);
      if (!externalUrl && !file) return null;
      return {
        placement: normalizePlacement(entry.placement, DEFAULT_INLINE_PLACEMENT),
        aspectRatio: normalizeAspectRatio(entry.aspectRatio),
        externalUrl,
        file,
        poster: normalizeAssetPath(entry.poster),
        captions: normalizeAssetPath(entry.captions || entry.captionsFile),
        title: safeString(entry.title),
        playerOptions: normalizePlayerOptions(entry.playerOptions),
      };
    })
    .filter(Boolean);
}

function normalizeSlug(value) {
  const raw = safeString(value);
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collapseWhitespace(value) {
  return safeString(value)
    .replace(/\s+/g, " ")
    .trim();
}

function buildSeoDescription(excerpt, body) {
  const source = collapseWhitespace(excerpt) || collapseWhitespace(body);
  if (!source) return "";
  if (source.length <= 150) return source;
  return `${source.slice(0, 149).trimEnd()}…`;
}

function loadInsightMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return matter(raw);
  } catch (error) {
    const relativePath = path.relative(rootDir, filePath);
    throw new Error(`Failed to parse front matter in ${relativePath}: ${error.message}`);
  }
}

function normalizeTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => safeString(item))
    .filter(Boolean);
}

async function loadTasteHubPolls() {
  try {
    const module = await import(TASTEHUB_POLLS_MODULE);
    const loader = module.getTasteHubPolls || module.default;
    if (typeof loader !== "function") return [];
    const polls = await loader();
    return Array.isArray(polls) ? polls : [];
  } catch (error) {
    console.warn(`[generate-insights-data] Unable to load TasteHub polls: ${error.message}`);
    return [];
  }
}

async function mapPollsBySlug() {
  const polls = await loadTasteHubPolls();
  const map = new Map();
  polls.forEach((poll) => {
    const slug = normalizeSlug(poll?.slug);
    if (!slug) return;
    const normalized = normalizeEmbeddedPoll(poll);
    if (normalized) {
      map.set(slug, normalized);
    }
  });
  return map;
}

function writeJson(targetPath, data) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, json, "utf8");
}

async function main() {
  if (!fs.existsSync(contentDir)) {
    console.warn(
      `[generate-insights-data] Skipping — content directory not found at ${path.relative(rootDir, contentDir)}`,
    );
    process.exit(0);
  }

  copyNestedInsightAssets();

  if (process.argv.includes("--assets-only")) {
    console.log("[generate-insights-data] Nested insight assets are ready for development.");
    return;
  }

  const pollsBySlug = await mapPollsBySlug();

  const entries = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  if (!entries.length) {
    console.warn("[generate-insights-data] No insight entries found.");
    return;
  }

  const results = [];
  const failures = [];

  for (const folderName of entries) {
    const folderPath = path.join(contentDir, folderName);
    const indexPath = path.join(folderPath, "index.md");
    const relativeIndexPath = path.relative(rootDir, indexPath);

    if (!fs.existsSync(indexPath)) {
      failures.push({ folderName, reason: "Missing index.md" });
      continue;
    }

    let parsed;
    try {
      parsed = loadInsightMarkdown(indexPath);
    } catch (error) {
      failures.push({ folderName, reason: error.message });
      continue;
    }

    const data = parsed.data || {};
    const folderSlug = normalizeSlug(folderName);
    const frontMatterSlug = normalizeSlug(data.slug);
    const slug = frontMatterSlug || folderSlug;
    const outputPath = path.join(outputDir, `${folderSlug}.json`);

    if (data.draft === true) {
      if (fs.existsSync(outputPath)) {
        fs.rmSync(outputPath, { force: true });
      }
      console.log(`[generate-insights-data] Skipping draft insight: ${slug || folderSlug || folderName}`);
      continue;
    }

    if (!slug) {
      failures.push({ folderName, reason: `Unable to derive slug for ${relativeIndexPath}` });
      continue;
    }

    if (slug !== folderSlug) {
      console.warn(
        `[generate-insights-data] Adjusted slug for ${relativeIndexPath} from ${frontMatterSlug || "<missing>"} to ${folderSlug}`,
      );
    }

    const body = parsed.content.replace(/^\uFEFF/, "").replace(/^\n+/, "");
    const bodyHtml = renderMarkdownToHtml(body);
    const excerpt = collapseWhitespace(data.excerpt) || collapseWhitespace(body).slice(0, 150);

    const embeddedPollSlugs = normalizeEmbeddedPollSlugs(data.embeddedPollSlugs);
    const embeddedPolls = embeddedPollSlugs
      .map((slug) => pollsBySlug.get(slug))
      .filter(Boolean);

    const result = {
      slug: folderSlug,
      title: safeString(data.title),
      publishDate: safeString(data.publishDate || data.publish_date),
      author: safeString(data.author),
      excerpt,
      tags: normalizeTags(data.tags),
      featureImage: normalizeAssetPath(data.featureImage || data.feature_image),
      featureImageAlt: safeString(data.featureImageAlt || data.feature_image_alt),
      seo: {
        title: safeString(data?.seo?.title),
        description: safeString(data?.seo?.description),
        ogImage: normalizeAssetPath(data?.seo?.ogImage),
      },
      gallery: normalizeGallery(data.gallery),
      inlineImages: normalizeInlineImages(data.inlineImages),
      pullQuote: normalizePullQuote(data.pullQuote),
      videos: normalizeVideos(data.videos),
      embeddedPollSlugs,
      embeddedPolls,
      body,
      bodyHtml,
      sourcePath: relativeIndexPath,
    };

    if (!result.title) {
      failures.push({ folderName, reason: `Missing title in ${relativeIndexPath}` });
      continue;
    }

    if (!result.publishDate) {
      const stats = fs.statSync(indexPath);
      result.publishDate = new Date(stats.mtime).toISOString();
    }

    if (!result.seo.description) {
      result.seo.description = buildSeoDescription(result.excerpt, body);
    }

    if (!result.seo.title && result.title) {
      result.seo.title = `${result.title} | NorthSide GTA`;
    }

    if (!result.seo.ogImage) {
      result.seo.ogImage = result.featureImage;
    }

    writeJson(outputPath, result);
    results.push(folderSlug);
  }

  if (failures.length) {
    failures.forEach((failure) => {
      console.error(`[generate-insights-data] ${failure.reason}`);
    });
    process.exitCode = 1;
  }

  if (results.length) {
    console.log(
      `[generate-insights-data] Wrote ${results.length} insight data file${results.length === 1 ? "" : "s"} to ${path.relative(
        rootDir,
        outputDir,
      )}`,
    );
  }
}

main().catch((error) => {
  console.error(`[generate-insights-data] Uncaught error: ${error.message}`);
  process.exitCode = 1;
});
