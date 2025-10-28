import yaml from "js-yaml";

const FRONTMATTER_PATTERN = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]*/;

export function parseFrontMatter(raw) {
  if (typeof raw !== "string") {
    return { data: {}, content: "" };
  }

  const normalized = raw.startsWith("\uFEFF") ? raw.slice(1) : raw;
  const match = normalized.match(FRONTMATTER_PATTERN);

  if (!match) {
    return { data: {}, content: normalized.trimStart() };
  }

  let data = {};
  try {
    data = yaml.load(match[1]) || {};
  } catch (error) {
    console.error("Failed to parse insight front matter", error);
    data = {};
  }

  const content = normalized.slice(match[0].length).trimStart();

  return { data, content };
}
