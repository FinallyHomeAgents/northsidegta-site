#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");
const imageSizeModule = require("image-size");
const imageSize =
  typeof imageSizeModule === "function"
    ? imageSizeModule
    : imageSizeModule.imageSize || imageSizeModule.default;

const DEFAULT_SUBHEADLINE =
  "Bigger lots, more value, and less traffic — get the listings now.";
const DEFAULT_ORIGIN = process.env.SITE_ORIGIN || "https://northsidegta.ca";
const DEFAULT_HERO = "/Images/northside-map.svg";
const MIME_TYPE_LOOKUP = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(publicDir, "data", "collections");
const buildDir = path.join(rootDir, "build");
const hasBuildTemplate = fs.existsSync(path.join(buildDir, "index.html"));
const templatePath = hasBuildTemplate
  ? path.join(buildDir, "index.html")
  : path.join(publicDir, "index.html");
const outputRoot = hasBuildTemplate
  ? path.join(buildDir, "collections")
  : path.join(publicDir, "collections");

if (!fs.existsSync(dataDir)) {
  console.warn(
    `[generate-curated-html] Skipping — collections directory not found at ${path.relative(
      rootDir,
      dataDir
    )}`
  );
  process.exit(0);
}

if (!fs.existsSync(templatePath)) {
  console.warn(
    `[generate-curated-html] Skipping — template not found at ${path.relative(
      rootDir,
      templatePath
    )}`
  );
  process.exit(0);
}

const baseHtml = fs.readFileSync(templatePath, "utf8");
const doctypeMatch = baseHtml.match(/<!DOCTYPE html[^>]*>/i);
const doctype = doctypeMatch ? doctypeMatch[0] : "<!DOCTYPE html>";
const templateOrigin = deriveOrigin(baseHtml) || DEFAULT_ORIGIN;
const siteOrigin = templateOrigin || DEFAULT_ORIGIN;

if (fs.existsSync(outputRoot)) {
  fs.rmSync(outputRoot, { recursive: true, force: true });
}
fs.mkdirSync(outputRoot, { recursive: true });

const files = fs
  .readdirSync(dataDir)
  .filter(name => name.toLowerCase().endsWith(".json"))
  .sort();

let created = 0;
const failures = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push({ file, reason: `Invalid JSON (${error.message})` });
    continue;
  }

  const fallbackSlug = file.replace(/\.json$/i, "");
  const slug = sanitizeSlug(fallbackSlug, fallbackSlug);

  if (!slug) {
    failures.push({ file, reason: "Missing slug" });
    continue;
  }

  const meta = computeMeta(raw, slug, siteOrigin);
  const html = buildHtml(baseHtml, doctype, meta);

  const targetDir = path.join(outputRoot, slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
  created += 1;
}

if (created) {
  console.log(
    `[generate-curated-html] Created ${created} curated page${
      created === 1 ? "" : "s"
    } using ${path.relative(rootDir, templatePath)} → ${path.relative(
      rootDir,
      outputRoot
    )}`
  );
}

if (failures.length) {
  failures.forEach(failure => {
    console.warn(
      `[generate-curated-html] Skipped ${failure.file}: ${failure.reason}`
    );
  });
  process.exitCode = 1;
}

function deriveOrigin(html) {
  try {
    const doc = parse(html);
    const canonical = doc.querySelector('link[rel="canonical"]');
    if (canonical) {
      const href = canonical.getAttribute("href");
      if (href) {
        return new URL(href).origin;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

function sanitizeSlug(value, fallback) {
  const raw = cleanString(value) || cleanString(fallback);
  if (!raw) return "";
  return raw.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9/_-]/g, "-");
}

function computeMeta(data, slug, origin) {
  const legacyTitle = cleanString(data.title) || cleanString(data.legacyTitle);
  const headline = cleanString(data.headline) || legacyTitle || "Curated Listings";
  const subheadline = cleanString(data.subheadline) || DEFAULT_SUBHEADLINE;
  const seoDescription = collapseWhitespace(
    cleanString(data.seoDescription) || subheadline
  );
  const heroImageValue = cleanString(data.heroImage) || DEFAULT_HERO;
  const heroImageDetails = resolveImageDetails(heroImageValue);
  const slugTextSource = cleanString(data.slug) || slug;
  const heroAltBase =
    headline || slugTextSource.replace(/[-_]+/g, " ").trim() || "NorthSide GTA";

  const canonicalUrl = buildUrl(origin, `/collections/${encodeSlug(slug)}`);
  const ogImageRaw = absoluteUrl(origin, heroImageValue);
  const ogImageSecure = ensureSecureUrl(ogImageRaw);
  const ogImage = ogImageSecure || ogImageRaw;
  const pageTitle = `${headline} • NorthSide GTA`;
  const heroAltText = `${heroAltBase} hero image`;
  const twitterCard = "summary_large_image";

  return {
    slug,
    headline,
    pageTitle,
    seoDescription,
    canonicalUrl,
    ogImage,
    ogImageOriginal: ogImageRaw,
    ogImageSecureUrl: ogImageSecure,
    ogImageType: heroImageDetails.mimeType,
    ogImageWidth: heroImageDetails.width,
    ogImageHeight: heroImageDetails.height,
    heroAltText,
    twitterCard,
  };
}

function buildHtml(template, doctypeValue, meta) {
  const doc = parse(template, { comment: true });
  const head = doc.querySelector("head");
  if (!head) {
    throw new Error("Template is missing <head>");
  }

  head.querySelectorAll("title").forEach(node => node.remove());
  head
    .querySelectorAll("meta")
    .forEach(node => {
      const name = (node.getAttribute("name") || "").toLowerCase();
      const property = (node.getAttribute("property") || "").toLowerCase();
      if (
        name === "description" ||
        name === "keywords" ||
        name === "robots" ||
        name.startsWith("twitter:") ||
        property.startsWith("og:")
      ) {
        node.remove();
      }
    });
  head
    .querySelectorAll('link[rel="canonical"]')
    .forEach(node => node.remove());

  append(head, `<title>${escapeHtml(meta.pageTitle)}</title>`);
  append(
    head,
    `<meta name="description" content="${escapeAttribute(meta.seoDescription)}" />`
  );
  append(head, `<meta name="robots" content="noindex,nofollow" />`);
  append(
    head,
    `<link rel="canonical" href="${escapeAttribute(meta.canonicalUrl)}" />`
  );
  append(
    head,
    `<meta property="og:title" content="${escapeAttribute(meta.pageTitle)}" />`
  );
  append(
    head,
    `<meta property="og:description" content="${escapeAttribute(meta.seoDescription)}" />`
  );
  append(
    head,
    `<meta property="og:url" content="${escapeAttribute(meta.canonicalUrl)}" />`
  );
  append(head, `<meta property="og:type" content="website" />`);
  if (meta.ogImage) {
    append(
      head,
      `<meta property="og:image" content="${escapeAttribute(meta.ogImage)}" />`
    );
    const secureContent = meta.ogImageSecureUrl || meta.ogImage;
    if (secureContent) {
      append(
        head,
        `<meta property="og:image:secure_url" content="${escapeAttribute(secureContent)}" />`
      );
    }
    if (meta.ogImageType) {
      append(
        head,
        `<meta property="og:image:type" content="${escapeAttribute(meta.ogImageType)}" />`
      );
    }
    if (meta.ogImageWidth > 0) {
      append(
        head,
        `<meta property="og:image:width" content="${escapeAttribute(String(meta.ogImageWidth))}" />`
      );
    }
    if (meta.ogImageHeight > 0) {
      append(
        head,
        `<meta property="og:image:height" content="${escapeAttribute(String(meta.ogImageHeight))}" />`
      );
    }
    append(
      head,
      `<meta property="og:image:alt" content="${escapeAttribute(meta.heroAltText)}" />`
    );
  }
  append(
    head,
    `<meta name="twitter:card" content="${escapeAttribute(meta.twitterCard)}" />`
  );
  append(
    head,
    `<meta name="twitter:title" content="${escapeAttribute(meta.pageTitle)}" />`
  );
  append(
    head,
    `<meta name="twitter:description" content="${escapeAttribute(meta.seoDescription)}" />`
  );
  append(
    head,
    `<meta name="twitter:url" content="${escapeAttribute(meta.canonicalUrl)}" />`
  );
  if (meta.ogImage) {
    append(
      head,
      `<meta name="twitter:image" content="${escapeAttribute(meta.ogImage)}" />`
    );
    if (meta.ogImageType) {
      append(
        head,
        `<meta name="twitter:image:type" content="${escapeAttribute(meta.ogImageType)}" />`
      );
    }
    if (meta.ogImageWidth > 0) {
      append(
        head,
        `<meta name="twitter:image:width" content="${escapeAttribute(String(meta.ogImageWidth))}" />`
      );
    }
    if (meta.ogImageHeight > 0) {
      append(
        head,
        `<meta name="twitter:image:height" content="${escapeAttribute(String(meta.ogImageHeight))}" />`
      );
    }
    append(
      head,
      `<meta name="twitter:image:alt" content="${escapeAttribute(meta.heroAltText)}" />`
    );
  }

  let html = doc.toString();
  if (!/^<!DOCTYPE html/i.test(html)) {
    html = `${doctypeValue}\n${html}`;
  }
  return html;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function encodeSlug(slug) {
  return slug
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
}

function buildUrl(origin, targetPath) {
  if (!origin) {
    return targetPath;
  }
  const normalizedOrigin = origin.endsWith("/") ? origin : `${origin}/`;
  const normalizedPath = targetPath.startsWith("/")
    ? targetPath.slice(1)
    : targetPath;
  try {
    return new URL(normalizedPath, normalizedOrigin).toString();
  } catch (error) {
    return `${normalizedOrigin}${normalizedPath}`;
  }
}

function absoluteUrl(origin, value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return buildUrl(origin, normalized);
}

function ensureSecureUrl(url) {
  if (!url) return "";
  if (!/^https?:/i.test(url) && url.startsWith("//")) {
    return `https:${url}`;
  }
  if (/^http:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      parsed.protocol = "https:";
      return parsed.toString();
    } catch (error) {
      return url.replace(/^http:/i, "https:");
    }
  }
  return url.startsWith("https://") ? url : "";
}

function resolveImageDetails(value) {
  const details = { mimeType: "", width: 0, height: 0 };
  if (!value) {
    return details;
  }

  const localPath = value.startsWith("/") ? value.slice(1) : value;
  const candidate = path.join(publicDir, localPath);

  if (fs.existsSync(candidate) && typeof imageSize === "function") {
    try {
      const fileBuffer = fs.readFileSync(candidate);
      const typedArray =
        fileBuffer instanceof Uint8Array ? fileBuffer : new Uint8Array(fileBuffer);
      const size = imageSize(typedArray);
      if (size && typeof size.width === "number") {
        details.width = size.width;
      }
      if (size && typeof size.height === "number") {
        details.height = size.height;
      }
      if (size && typeof size.type === "string" && size.type.trim()) {
        details.mimeType = normalizeMimeType(size.type);
      }
    } catch (error) {
      // Ignore failures and fall back to extension-based detection below.
    }
  }

  if (!details.mimeType) {
    details.mimeType = inferMimeTypeFromPath(value);
  }

  return details;
}

function normalizeMimeType(rawType) {
  if (!rawType) return "";
  const lower = rawType.trim().toLowerCase();
  if (MIME_TYPE_LOOKUP[lower]) {
    return MIME_TYPE_LOOKUP[lower];
  }
  if (lower.startsWith("image/")) {
    return lower;
  }
  return `image/${lower}`;
}

function inferMimeTypeFromPath(value) {
  if (!value) return "";
  const match = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(value);
  if (!match) return "";
  const extension = match[1].toLowerCase();
  return MIME_TYPE_LOOKUP[extension] || `image/${extension}`;
}

function append(node, html) {
  node.insertAdjacentHTML("beforeend", `\n    ${html}`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
