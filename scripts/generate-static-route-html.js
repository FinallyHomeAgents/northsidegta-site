#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const {
  loadTemplate,
  stripSeoTags,
  appendHeadTag,
  finalizeHtml,
} = require("./utils/staticMeta");
const { getMetaTagsFromData } = require("../src/components/seo/metaTagUtils.js");
async function main() {
  const {
    DEFAULT_GLOBAL_META_CONFIG,
    STATIC_ROUTE_META_CONFIGS,
  } = await import("../src/components/seo/staticRouteMetaConfigs.mjs");

  const template = loadTemplate();
  if (!template) {
    console.warn("[generate-static-route-html] Skipping — unable to locate HTML template");
    process.exit(0);
  }

  const routes = Array.isArray(STATIC_ROUTE_META_CONFIGS)
    ? STATIC_ROUTE_META_CONFIGS.filter((entry) => entry && entry.route && entry.meta)
    : [];

  if (routes.length === 0) {
    console.warn("[generate-static-route-html] No static routes configured. Skipping.");
    return;
  }

  const baseDoc = template.baseHtml;
  const outputRoot = template.hasBuildTemplate ? template.buildDir : template.publicDir;

  const baseMeta = getMetaTagsFromData(DEFAULT_GLOBAL_META_CONFIG);
  const baseTags = baseMeta && Array.isArray(baseMeta.tags) ? baseMeta.tags : [];

  let created = 0;
  const failures = [];

  routes.forEach((entry) => {
    const { route, meta } = entry;
    try {
      const headFragments = buildHeadFragments(baseDoc, template.doctype, baseTags, meta);
      const targetPath = getOutputPath(outputRoot, route);
      const targetDir = path.dirname(targetPath);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, headFragments, "utf8");
      created += 1;
    } catch (error) {
      failures.push({ route, reason: error.message });
    }
  });

  if (created > 0) {
    console.log(
      `[generate-static-route-html] Created ${created} static route page${created === 1 ? "" : "s"}`
    );
  }

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.warn(
        `[generate-static-route-html] Failed to generate ${failure.route || "<unknown>"}: ${failure.reason}`
      );
    });
    process.exitCode = 1;
  }
}

function buildHeadFragments(baseHtml, doctype, baseTags, routeMeta) {
  if (!routeMeta || typeof routeMeta !== "object") {
    throw new Error("Missing route meta configuration");
  }

  const doc = parse(baseHtml, { comment: true });
  const head = doc.querySelector("head");
  if (!head) {
    throw new Error("Template is missing <head> element");
  }

  stripSeoTags(head);

  const combinedTags = mergeMetaTags(baseTags, routeMeta);
  const fragments = combinedTags.map(stringifyTag).filter(Boolean);
  fragments.forEach((fragment) => appendHeadTag(head, fragment));

  return finalizeHtml(doc, doctype);
}

function mergeMetaTags(baseTags, routeMetaConfig) {
  const routeMeta = getMetaTagsFromData(routeMetaConfig);
  const routeTags = routeMeta && Array.isArray(routeMeta.tags) ? routeMeta.tags : [];

  const result = [];
  const keyIndex = new Map();

  [baseTags, routeTags].forEach((tagList) => {
    tagList.forEach((tag) => {
      if (!tag) return;
      const key = resolveTagKey(tag);
      if (key && keyIndex.has(key)) {
        const index = keyIndex.get(key);
        result[index] = tag;
      } else {
        result.push(tag);
        if (key) {
          keyIndex.set(key, result.length - 1);
        }
      }
    });
  });

  return result.filter(Boolean);
}

function resolveTagKey(tag) {
  if (!tag || typeof tag !== "object") return "";
  if (tag.key) return tag.key;
  if (tag.type === "meta") {
    const attrs = tag.attributes || {};
    if (attrs.name) return `meta:name:${attrs.name}`;
    if (attrs.property) return `meta:property:${attrs.property}`;
  }
  if (tag.type === "link") {
    const attrs = tag.attributes || {};
    if (attrs.rel) return `link:rel:${attrs.rel}`;
  }
  if (tag.type === "title") {
    return "document-title";
  }
  return "";
}

function stringifyTag(tag) {
  if (!tag) return "";
  if (tag.type === "title") {
    return `<title>${escapeHtml(tag.content || "")}</title>`;
  }
  if (tag.type === "meta") {
    const attrs = tag.attributes || {};
    const attrText = Object.entries(attrs)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
      .join(" ");
    return attrText ? `<meta ${attrText} />` : "";
  }
  if (tag.type === "link") {
    const attrs = tag.attributes || {};
    const attrText = Object.entries(attrs)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
      .join(" ");
    return attrText ? `<link ${attrText} />` : "";
  }
  return "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function getOutputPath(root, route) {
  if (!route || route === "/") {
    return path.join(root, "index.html");
  }
  const normalized = route.replace(/^\//, "");
  return path.join(root, normalized, "index.html");
}

main().catch((error) => {
  console.error("[generate-static-route-html] Failed:", error);
  process.exitCode = 1;
});
