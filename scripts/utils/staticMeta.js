const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const DEFAULT_ORIGIN = process.env.SITE_ORIGIN || "https://northsidegta.ca";

function loadTemplate() {
  const rootDir = path.resolve(__dirname, "../..");
  const publicDir = path.join(rootDir, "public");
  const buildDir = path.join(rootDir, "build");
  const buildIndexPath = path.join(buildDir, "index.html");
  const hasBuildTemplate = fs.existsSync(buildIndexPath);
  const templatePath = hasBuildTemplate ? buildIndexPath : path.join(publicDir, "index.html");

  if (!fs.existsSync(templatePath)) {
    return null;
  }

  const baseHtml = fs.readFileSync(templatePath, "utf8");
  const doctypeMatch = baseHtml.match(/<!DOCTYPE html[^>]*>/i);
  const doctype = doctypeMatch ? doctypeMatch[0] : "<!DOCTYPE html>";
  const siteOrigin = deriveOrigin(baseHtml) || DEFAULT_ORIGIN;

  return {
    rootDir,
    publicDir,
    buildDir,
    hasBuildTemplate,
    templatePath,
    baseHtml,
    doctype,
    siteOrigin,
  };
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

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function collapseWhitespace(value) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value, maxLength) {
  const text = collapseWhitespace(value);
  if (!text) return "";
  if (!Number.isFinite(maxLength) || maxLength <= 0 || text.length <= maxLength) {
    return text;
  }
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > 40) {
    return `${slice.slice(0, lastSpace)}…`;
  }
  return `${slice.slice(0, maxLength - 1)}…`;
}

function buildUrl(origin, targetPath) {
  if (!origin) {
    return targetPath;
  }
  const normalizedOrigin = origin.endsWith("/") ? origin : `${origin}/`;
  const normalizedPath = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
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

function stripSeoTags(head) {
  head.querySelectorAll("title").forEach((node) => node.remove());
  head.querySelectorAll("meta").forEach((node) => {
    const name = (node.getAttribute("name") || "").toLowerCase();
    const property = (node.getAttribute("property") || "").toLowerCase();
    if (
      name === "description" ||
      name === "keywords" ||
      name === "robots" ||
      name.startsWith("twitter:")
    ) {
      node.remove();
      return;
    }
    if (
      property.startsWith("og:") ||
      property.startsWith("twitter:") ||
      property.startsWith("article:") ||
      property.startsWith("event:")
    ) {
      node.remove();
    }
  });
  head
    .querySelectorAll('link[rel="canonical"]')
    .forEach((node) => node.remove());
}

function appendHeadTag(head, html) {
  if (!html) return;
  head.insertAdjacentHTML("beforeend", `\n    ${html}`);
}

function finalizeHtml(doc, doctype) {
  let html = doc.toString();
  if (!/^<!DOCTYPE html/i.test(html)) {
    html = `${doctype}\n${html}`;
  }
  return html;
}

module.exports = {
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
};
