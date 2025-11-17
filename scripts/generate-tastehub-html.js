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
  buildUrl,
  absoluteUrl,
  ensureSecureUrl,
  stripSeoTags,
  appendHeadTag,
  finalizeHtml,
} = require("./utils/staticMeta");
const { getMetaTagHtmlList } = require("../src/components/seo/metaTagUtils.js");

const REGION_NAME = "NorthSide GTA";
const SITE_NAME = "TasteHub | NorthSide GTA";
const DEFAULT_IMAGE = "/seo/tastehub-default-poll-share.jpg";

async function main() {
  const template = loadTemplate();
  if (!template) {
    console.warn("[generate-tastehub-html] Skipping — unable to locate HTML template");
    process.exit(0);
  }

  const outputRoot = template.hasBuildTemplate
    ? path.join(template.buildDir, "tastehub")
    : path.join(template.publicDir, "tastehub");

  let polls = [];
  try {
    const module = await import("../lib/tastehub/getTasteHubPolls.js");
    const loader = module.getTasteHubPolls || module.default;
    polls = (await loader()) || [];
  } catch (error) {
    console.warn("[generate-tastehub-html] Unable to load TasteHub polls", error);
    process.exit(1);
  }

  if (!Array.isArray(polls) || polls.length === 0) {
    console.log("[generate-tastehub-html] No TasteHub polls found. Skipping.");
    return;
  }

  if (fs.existsSync(outputRoot)) {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(outputRoot, { recursive: true });

  let created = 0;
  const failures = [];

  polls.forEach((poll) => {
    const slug = sanitizeSlug(poll.slug, poll.rankingKey || poll.title);
    if (!slug) {
      failures.push({ file: poll.title || poll.rankingKey || "<unknown>", reason: "Missing slug" });
      return;
    }

    try {
      const metaConfig = buildMetaConfig(poll, slug, template.siteOrigin || DEFAULT_ORIGIN);
      const headFragments = getMetaTagHtmlList(metaConfig.meta);
      const schemaScript = metaConfig.schema
        ? `<script type="application/ld+json">${metaConfig.schema}</script>`
        : "";

      const doc = parse(template.baseHtml, { comment: true });
      const head = doc.querySelector("head");
      if (!head) {
        throw new Error("Template is missing <head> element");
      }

      stripSeoTags(head);
      headFragments.forEach((fragment) => appendHeadTag(head, fragment));
      if (schemaScript) {
        appendHeadTag(head, schemaScript);
      }

      const html = finalizeHtml(doc, template.doctype);
      const targetDir = path.join(outputRoot, slug);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
      created += 1;
    } catch (error) {
      failures.push({ file: slug, reason: error.message });
    }
  });

  if (created > 0) {
    console.log(
      `[generate-tastehub-html] Created ${created} TasteHub poll page${created === 1 ? "" : "s"} → ${path.relative(
        template.rootDir,
        outputRoot,
      )}`,
    );
  }

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.warn(`[generate-tastehub-html] Skipped ${failure.file}: ${failure.reason}`);
    });
    process.exitCode = 1;
  }
}

function buildMetaConfig(poll, slug, origin) {
  const safeOrigin = typeof origin === "string" && origin ? origin : DEFAULT_ORIGIN;
  const pollTitle = cleanString(poll.title) || "TasteHub Poll";
  const documentTitle = `${pollTitle} | TasteHub | ${REGION_NAME}`;
  const shareTitle = `${pollTitle} – TasteHub Community Rankings`;
  const description = collapseWhitespace(generatePollDescription(poll));
  const canonicalUrl = buildUrl(safeOrigin, `/tastehub/${encodeSlug(slug)}`);
  const ogImage = resolveImage(poll.image, safeOrigin);
  const imageAlt = `${pollTitle} feature image`;
  const category = cleanString(poll.displayCategory || poll.category) || "TasteHub poll";
  const town = cleanString(poll.town);
  const hamlet = cleanString(poll.townArea || poll.hamlet);

  const schema = buildSchema({
    pollTitle,
    description,
    canonicalUrl,
    ogImage,
    category,
    town,
    hamlet,
    slug,
  });

  return {
    meta: {
      documentTitle,
      title: documentTitle,
      ogTitle: shareTitle,
      twitterTitle: shareTitle,
      description,
      ogDescription: description,
      twitterDescription: description,
      canonicalUrl,
      ogType: "website",
      ogImage,
      ogImageAlt: imageAlt,
      siteName: SITE_NAME,
      twitterCard: "summary_large_image",
      twitterImage: ogImage,
      twitterImageAlt: imageAlt,
    },
    schema,
  };
}

function generatePollDescription(poll) {
  const title = cleanString(poll?.title);
  const town = cleanString(poll?.town);
  const category = cleanString(poll?.displayCategory || poll?.category);
  const baseDescription = collapseWhitespace(cleanString(poll?.description));

  if (baseDescription) return baseDescription;

  const locationSnippet = [category, town].filter(Boolean).join(" in ");
  const focus = locationSnippet || title || "this TasteHub poll";

  return `Help crown ${focus}! Vote now and see live TasteHub community rankings across the ${REGION_NAME}.`;
}

function resolveImage(imagePath, origin) {
  const rawImage = cleanString(imagePath) || DEFAULT_IMAGE;
  const absolute = absoluteUrl(origin, rawImage);
  const secure = ensureSecureUrl(absolute);
  if (secure) return secure;
  if (absolute) return absolute;
  return absoluteUrl(origin, DEFAULT_IMAGE);
}

function buildSchema({ pollTitle, description, canonicalUrl, ogImage, category, town, hamlet, slug }) {
  const keywords = [category, town, hamlet, "TasteHub", REGION_NAME].filter(Boolean).join(", ");
  const areaServed = [
    town ? { "@type": "AdministrativeArea", name: town } : null,
    hamlet ? { "@type": "AdministrativeArea", name: hamlet } : null,
    { "@type": "AdministrativeArea", name: REGION_NAME },
  ].filter(Boolean);

  const spatialCoverage = town || hamlet
    ? {
        "@type": "Place",
        name: hamlet ? `${hamlet}${town ? `, ${town}` : ""}` : town,
        address: {
          "@type": "PostalAddress",
          addressLocality: hamlet || town || REGION_NAME,
          addressRegion: REGION_NAME,
        },
      }
    : undefined;

  const schemaObject = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pollTitle,
    description,
    url: canonicalUrl,
    image: ogImage,
    identifier: slug,
    genre: category,
    about: category ? { "@type": "Thing", name: category } : undefined,
    inLanguage: "en-CA",
    isPartOf: "TasteHub Community Rankings",
    keywords,
    areaServed,
    spatialCoverage,
    audience: { "@type": "Audience", audienceType: `${REGION_NAME} food fans` },
    creator: { "@type": "Organization", name: "TasteHub by NorthSide GTA" },
  };

  return JSON.stringify(schemaObject, null, 2);
}

function encodeSlug(slug) {
  return slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

main().catch((error) => {
  console.error("[generate-tastehub-html] Failed:", error);
  process.exitCode = 1;
});
