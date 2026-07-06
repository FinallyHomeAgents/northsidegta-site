const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
let fg;
try {
  fg = require("fast-glob");
} catch {
  fg = null;
}

const ROOT = path.resolve(__dirname, "..");
const CANDIDATE_ROOTS = [
  path.join(ROOT, "public", "content", "insights"),
  path.join(ROOT, "public", "content", "insight"),
  path.join(ROOT, "content", "insights"),
];

const OUTPUT = path.join(ROOT, "public", "content", "insights", "index.json");

function findIndexFiles() {
  const files = new Set();
  for (const base of CANDIDATE_ROOTS) {
    if (!fs.existsSync(base)) continue;
    if (fg) {
      for (const f of fg.sync("**/index.md", { cwd: base, dot: false })) {
        files.add(path.join(base, f));
      }
    } else {
      // Fallback walker
      const stack = [base];
      while (stack.length) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) stack.push(full);
          else if (entry === "index.md") files.add(full);
        }
      }
    }
  }
  return Array.from(files);
}

function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  return undefined;
}

function toISO(val) {
  const d = new Date(val);
  return isNaN(d) ? "1970-01-01T00:00:00Z" : d.toISOString();
}

function main() {
  const files = findIndexFiles();
  const items = [];
  const warnings = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const relativePath = path.relative(ROOT, file);

    if (data?.draft === true) {
      warnings.push(`Skipping draft: ${relativePath}`);
      continue;
    }

    const dirName = path.basename(path.dirname(file));
    const title = firstDefined(data.title);
    if (!title) {
      warnings.push(`Skipping (missing title): ${relativePath}`);
      continue;
    }

    const slugFromData = firstDefined(data.slug);
    const slug = firstDefined(slugFromData, dirName);
    if (!slug) {
      warnings.push(`Skipping (missing slug): ${relativePath}`);
      continue;
    }

    const publishDateRaw = firstDefined(data.publishDate, data.date, data.published, data.publish_date);
    const publishDate = publishDateRaw ? toISO(publishDateRaw) : "1970-01-01T00:00:00Z";
    const excerptRaw = firstDefined(data.excerpt);
    const excerpt = excerptRaw ?? "";
    const featureImageRaw = firstDefined(data.featureImage, data.image, data.cover);
    const featureImage = featureImageRaw ?? "";
    const featureImageAltRaw = firstDefined(data.featureImageAlt, data.imageAlt, data.alt);
    const featureImageAlt = featureImageAltRaw ?? "";

    const missingFields = [];
    if (!slugFromData) missingFields.push("slug");
    if (!publishDateRaw) missingFields.push("publishDate");
    if (!excerptRaw) missingFields.push("excerpt");
    if (!featureImageRaw) missingFields.push("featureImage");
    if (!featureImageAltRaw) missingFields.push("featureImageAlt");

    if (missingFields.length) {
      warnings.push(`Missing [${missingFields.join(", ")}] in ${relativePath}`);
    }

    items.push({
      slug,
      title,
      publishDate,
      excerpt,
      featureImage,
      featureImageAlt,
      __source: relativePath,
    });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const payload = JSON.stringify(items.map(({ __source, ...rest }) => rest), null, 2);
  fs.writeFileSync(OUTPUT, `${payload}\n`, "utf8");

  // Logs for debugging in CI/Vercel
  console.log("=== Insights index ===");
  items.forEach(it => console.log(`${it.slug} | ${it.publishDate} | src: ${it.__source}`));
  if (warnings.length) {
    console.warn("Warnings:");
    warnings.forEach(w => console.warn(" -", w));
  }
  console.log(`Total insights indexed: ${items.length}`);
}

if (require.main === module) main();
