#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
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

const FALLBACK_IMAGE = "/Images/hero-desktop.jpg";
const DESCRIPTION_LENGTH = 160;
const DEFAULT_DESCRIPTION = "Explore community events across the NorthSide GTA.";

function main() {
  const template = loadTemplate();
  if (!template) {
    console.warn("[generate-event-html] Skipping — unable to locate HTML template");
    process.exit(0);
  }

  const dataDir = path.join(template.publicDir, "data", "events");
  if (!fs.existsSync(dataDir)) {
    console.warn(
      `[generate-event-html] Skipping — events directory not found at ${path.relative(
        template.rootDir,
        dataDir,
      )}`,
    );
    process.exit(0);
  }

  const outputRoot = template.hasBuildTemplate
    ? path.join(template.buildDir, "events")
    : path.join(template.publicDir, "events");

  if (fs.existsSync(outputRoot)) {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(outputRoot, { recursive: true });

  const files = fs
    .readdirSync(dataDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.log("[generate-event-html] No events to process.");
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

    try {
      const metaConfig = computeEventMeta(payload, slug, template.siteOrigin || DEFAULT_ORIGIN);
      const headFragments = getMetaTagHtmlList(metaConfig);

      const doc = parse(template.baseHtml, { comment: true });
      const head = doc.querySelector("head");
      if (!head) {
        throw new Error("Template is missing <head> element");
      }

      stripSeoTags(head);
      headFragments.forEach((fragment) => appendHeadTag(head, fragment));

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
      `[generate-event-html] Created ${created} event page${created === 1 ? "" : "s"} → ${path.relative(
        template.rootDir,
        outputRoot,
      )}`,
    );
  }

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.warn(`[generate-event-html] Skipped ${failure.file}: ${failure.reason}`);
    });
    process.exitCode = 1;
  }
}

function computeEventMeta(data, slug, origin) {
  const safeOrigin = typeof origin === "string" && origin ? origin : DEFAULT_ORIGIN;
  const title = cleanString(data.title) || "NorthSide GTA Event";
  const pageTitle = `${title} | NorthSide GTA`;
  const descriptionSource = cleanString(data.summary) || cleanString(data.description) || DEFAULT_DESCRIPTION;
  const description = truncate(descriptionSource || DEFAULT_DESCRIPTION, DESCRIPTION_LENGTH) || DEFAULT_DESCRIPTION;

  const canonicalSlug = encodeSlug(slug);
  const canonicalUrl = buildUrl(safeOrigin, `/events/${canonicalSlug}`);

  const imageSource = cleanString(data.image) || FALLBACK_IMAGE;
  const ogImageAbsolute = absoluteUrl(safeOrigin, imageSource);
  const secureImage = ensureSecureUrl(ogImageAbsolute);
  const ogImage = secureImage || ogImageAbsolute;

  const locationParts = [data.locationName, data.address, data.subArea, data.town]
    .map((value) => cleanString(value))
    .filter(Boolean);
  const locationText = collapseWhitespace([...new Set(locationParts)].join(", "));

  const startIso = parseIsoDate(data.startDate);
  const endIso = parseIsoDate(data.endDate);

  const additionalMeta = [];
  if (secureImage) {
    additionalMeta.push({ property: "og:image:secure_url", content: secureImage });
  }
  if (canonicalUrl) {
    additionalMeta.push({ name: "twitter:url", content: canonicalUrl });
  }
  if (startIso) {
    additionalMeta.push({ property: "event:start_time", content: startIso });
  }
  if (endIso) {
    additionalMeta.push({ property: "event:end_time", content: endIso });
  }
  if (locationText) {
    additionalMeta.push({ property: "event:location", content: locationText });
  }
  if (data.hidden) {
    additionalMeta.push({ name: "robots", content: "noindex" });
  }

  return {
    documentTitle: pageTitle,
    title,
    ogTitle: title,
    twitterTitle: title,
    description,
    canonicalUrl,
    ogType: "event",
    ogImage,
    ogImageAlt: title,
    siteName: "NorthSide GTA",
    twitterCard: "summary_large_image",
    twitterImage: ogImage,
    articlePublishedTime: startIso,
    additionalMeta,
  };
}

function encodeSlug(slug) {
  return slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
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
