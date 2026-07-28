#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { parse } = require("node-html-parser");

const {
  DEFAULT_ORIGIN,
  loadTemplate,
  sanitizeSlug,
  cleanString,
  collapseWhitespace,
  truncate,
  buildUrl,
  absoluteUrl,
  ensureSecureUrl,
  stripSeoTags,
  appendHeadTag,
  finalizeHtml,
} = require("./utils/staticMeta");
const { getMetaTagHtmlList } = require("../src/components/seo/metaTagUtils.js");

const OG_FALLBACK_IMAGE = "/Images/og-home.jpg";
const DESCRIPTION_LENGTH = 160;

function isDraftInsight(slug, template) {
  if (!slug) return false;

  const candidates = [
    template?.publicDir ? path.join(template.publicDir, "content", "insights", slug, "index.md") : null,
    template?.rootDir ? path.join(template.rootDir, "public", "content", "insights", slug, "index.md") : null,
  ].filter(Boolean);

  const visited = new Set();

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (visited.has(resolved)) continue;
    visited.add(resolved);

    if (!fs.existsSync(resolved)) continue;

    try {
      const { data } = matter(fs.readFileSync(resolved, "utf8"));
      if (data?.draft === true) return true;
    } catch (error) {
      const relativePath = template?.rootDir ? path.relative(template.rootDir, resolved) : resolved;
      console.warn(`[generate-insight-html] Unable to read ${relativePath}: ${error.message}`);
    }
  }

  return false;
}

function main() {
  const template = loadTemplate();
  if (!template) {
    console.warn("[generate-insight-html] Skipping — unable to locate HTML template");
    process.exit(0);
  }

  const dataDir = path.join(template.publicDir, "data", "insights");
  if (!fs.existsSync(dataDir)) {
    console.warn(
      `[generate-insight-html] Skipping — insights directory not found at ${path.relative(
        template.rootDir,
        dataDir,
      )}`,
    );
    process.exit(0);
  }

  const outputRoot = template.hasBuildTemplate
    ? path.join(template.buildDir, "insights")
    : path.join(template.publicDir, "insights");

  if (fs.existsSync(outputRoot)) {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(outputRoot, { recursive: true });

  const files = fs
    .readdirSync(dataDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.log("[generate-insight-html] No insights to process.");
    return;
  }

  const failures = [];
  let created = 0;

  files.forEach((fileName) => {
    const filePath = path.join(dataDir, fileName);
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      failures.push({ file: fileName, reason: `Invalid JSON (${error.message})` });
      return;
    }

    const fallbackSlug = fileName.replace(/\.json$/i, "");
    const slug = sanitizeSlug(payload.slug, fallbackSlug);
    if (!slug) {
      failures.push({ file: fileName, reason: "Missing slug" });
      return;
    }

    if (isDraftInsight(slug, template)) {
      console.log(`[generate-insight-html] Skipping draft insight HTML for slug: ${slug}`);
      return;
    }

    try {
      const metaConfig = computeInsightMeta(payload, slug, template.siteOrigin || DEFAULT_ORIGIN);
      const headFragments = getMetaTagHtmlList(metaConfig);

      const doc = parse(template.baseHtml, { comment: true });
      const head = doc.querySelector("head");
      if (!head) {
        throw new Error("Template is missing <head> element");
      }

      stripSeoTags(head);
      headFragments.forEach((fragment) => appendHeadTag(head, fragment));

      const articleSchema = buildArticleSchema(payload, metaConfig);
      appendHeadTag(
        head,
        `<script type="application/ld+json">${JSON.stringify(articleSchema).replace(/</g, "\\u003c")}</script>`,
      );

      const root = doc.querySelector("#root");
      if (!root) {
        throw new Error("Template is missing #root element");
      }
      root.set_content(buildStaticArticleMarkup(payload));

      const html = finalizeHtml(doc, template.doctype);
      const targetDir = path.join(outputRoot, slug);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
      created += 1;
    } catch (error) {
      failures.push({ file: fileName, reason: error.message });
    }
  });

  if (created > 0) {
    console.log(
      `[generate-insight-html] Created ${created} insight page${created === 1 ? "" : "s"} → ${path.relative(
        template.rootDir,
        outputRoot,
      )}`,
    );
  }

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.warn(`[generate-insight-html] Skipped ${failure.file}: ${failure.reason}`);
    });
    process.exitCode = 1;
  }
}

function buildStaticArticleMarkup(data) {
  const title = cleanString(data.title) || "NorthSide GTA Insight";
  const bodyHtml = typeof data.bodyHtml === "string" ? data.bodyHtml : "";
  const excerpt = cleanString(data.excerpt);
  const byline = cleanString(data.author) || "Matthew Mulhall";
  return [
    '<main id="main-content">',
    '<article class="insight-article">',
    `<h1>${escapeHtml(title)}</h1>`,
    `<p>By ${escapeHtml(byline)}</p>`,
    excerpt ? `<p>${escapeHtml(excerpt)}</p>` : "",
    `<div>${bodyHtml}</div>`,
    "</article>",
    "</main>",
  ].join("");
}

function buildArticleSchema(data, meta) {
  const title = cleanString(data.title) || cleanString(meta.title);
  const published = parseIsoDate(data.publishDate);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: cleanString(meta.description),
    url: cleanString(meta.canonicalUrl),
    mainEntityOfPage: cleanString(meta.canonicalUrl),
    author: {
      "@type": "Person",
      name: cleanString(data.author) || "Matthew Mulhall",
    },
    publisher: {
      "@type": "Organization",
      name: "Finally Home Agents",
      url: "https://northsidegta.ca",
    },
    ...(published ? { datePublished: published } : {}),
    ...(meta.ogImage ? { image: meta.ogImage } : {}),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function computeInsightMeta(data, slug, origin) {
  const safeOrigin = typeof origin === "string" && origin ? origin : DEFAULT_ORIGIN;
  const title = cleanString(data.title);
  const seoTitle = cleanString(data.seo?.title) || (title ? `NorthSide GTA Insights: ${title}` : "NorthSide GTA Insights");
  const excerpt = cleanString(data.excerpt);
  const bodyText = stripMarkdown(data.body || "");
  const descriptionSource =
    cleanString(data.seo?.description) || excerpt || bodyText || "NorthSide GTA insights.";
  const description = truncate(descriptionSource, DESCRIPTION_LENGTH);

  const featureImage = cleanString(data.seo?.ogImage) || cleanString(data.featureImage) || OG_FALLBACK_IMAGE;
  const ogImageAbsolute = absoluteUrl(safeOrigin, featureImage);
  const secureImage = ensureSecureUrl(ogImageAbsolute);
  const ogImage = secureImage || ogImageAbsolute;
  const canonicalSlug = encodeSlug(slug);
  const canonicalUrl = buildUrl(safeOrigin, `/insights/${canonicalSlug}`);
  const ogImageAlt = cleanString(data.featureImageAlt) || title || "NorthSide GTA";
  const publishedTime = parseIsoDate(data.publishDate);
  const articleAuthor = cleanString(data.author);

  const tagsMeta = Array.isArray(data.tags)
    ? data.tags
        .map((tag, index) => {
          const content = cleanString(tag);
          if (!content) return null;
          return { property: "article:tag", content, key: `article-tag-${index}` };
        })
        .filter(Boolean)
    : [];

  const additionalMeta = [...tagsMeta];

  if (secureImage) {
    additionalMeta.push({ property: "og:image:secure_url", content: secureImage });
  }
  if (canonicalUrl) {
    additionalMeta.push({ name: "twitter:url", content: canonicalUrl });
  }

  return {
    documentTitle: seoTitle,
    title: seoTitle,
    description,
    canonicalUrl,
    ogType: "article",
    ogImage,
    ogImageAlt,
    siteName: "NorthSide GTA",
    twitterCard: "summary_large_image",
    twitterImage: ogImage,
    articleAuthor,
    articlePublishedTime: publishedTime,
    additionalMeta,
  };
}

function encodeSlug(slug) {
  return slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function stripMarkdown(value) {
  if (!value) return "";
  return collapseWhitespace(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[#>*_~`-]+/g, " ")
      .replace(/<[^>]*>/g, " "),
  );
}

function parseIsoDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

main();
