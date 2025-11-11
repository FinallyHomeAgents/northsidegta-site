import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { marked } from "marked";
import { DateTime } from "luxon";
import Navigation from "../Navigation";
import Footer from "../Footer";
import SmartContactForm from "../components/contact/SmartContactForm";
import {
  useContactChannels,
  useContactConfig,
} from "../components/contact/contactConfig";
import { trackEvent } from "../utils/analytics";
import { getSiteOrigin, toAbsoluteUrl } from "../community/shareUtils";
import { getSocialLinks } from "../utils/socialLinks";
import DynamicMetaTags from "../components/seo/DynamicMetaTags";
import {
  Facebook,
  Instagram,
  Linkedin,
  Music,
  Youtube,
} from "lucide-react";
import { HTMLElement, TextNode, parse } from "node-html-parser";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const INSIGHT_UPLOAD_WEB_PATH = "/uploads/insights/";
const INSIGHT_UPLOAD_INTERNAL_PREFIX = "uploads/insights/";
const HERO_PLACEHOLDER_IMAGE = "/images/placeholder-insight-hero.svg";
const OG_FALLBACK_IMAGE = "/Images/og-home.jpg";
const INLINE_MEDIA_PLACEMENTS = new Set(["after-h1", "after-p2", "after-p4", "end"]);
const DEFAULT_INLINE_PLACEMENT = "after-p2";
const ALLOWED_ASPECT_RATIOS = new Set(["16:9", "4:3", "3:2", "1:1", "9:16"]);
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_VIDEO_TITLE = "Insight video";

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

function ensureInsightUploadPath(value) {
  if (value == null) return "";
  const raw = typeof value === "string" ? value.trim() : String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith(INSIGHT_UPLOAD_WEB_PATH)) return raw;

  const normalized = raw
    .replace(/^(\.\/|\.\.\/)+/, "")
    .replace(/^\/+/, "");

  if (!normalized) return "";

  const uploadsIndex = normalized.indexOf(INSIGHT_UPLOAD_INTERNAL_PREFIX);
  if (uploadsIndex !== -1) {
    const remainder = normalized.slice(uploadsIndex + INSIGHT_UPLOAD_INTERNAL_PREFIX.length);
    if (!remainder) return "";
    const { path: uploadPath, suffix } = splitPathAndSuffix(remainder);
    if (!uploadPath) return "";
    return `${INSIGHT_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
  }

  const { path: uploadPath, suffix } = splitPathAndSuffix(normalized);
  if (!uploadPath) return "";
  return `${INSIGHT_UPLOAD_WEB_PATH}${uploadPath}${suffix}`;
}

const markdownRenderer = new marked.Renderer();
markdownRenderer.image = (href, title, text) => {
  const caption = title ? `<figcaption class="insight-figure__caption">${title}</figcaption>` : "";
  const safeSrc = ensureInsightUploadPath(href || "");
  const safeAlt = text || "";
  return `
    <figure class="insight-figure">
      <img src="${safeSrc}" alt="${safeAlt}" loading="lazy" decoding="async" />
      ${caption}
    </figure>
  `;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  smartypants: true,
  renderer: markdownRenderer,
});

function normalizeGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item) return null;
      const imageValue = typeof item === "string" ? item : item.image;
      const image = ensureInsightUploadPath(imageValue);
      if (!image) return null;
      return {
        image,
        alt: (item.alt || "").toString(),
        caption: (item.caption || "").toString(),
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
    .map((item) => {
      if (!item) return null;
      const imageValue = typeof item === "string" ? item : item.image;
      const image = ensureInsightUploadPath(imageValue);
      if (!image) return null;
      return {
        image,
        alt: safeString(item.alt),
        caption: safeString(item.caption),
        placement: normalizePlacement(item.placement),
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
    portrait: ensureInsightUploadPath(raw.portrait || raw.image),
  };
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

function sanitizeExternalVideoUrl(rawUrl) {
  const candidate = safeString(rawUrl);
  if (!candidate) return "";
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch (error) {
    return "";
  }

  const hostname = parsed.hostname.toLowerCase();
  const buildYouTubeEmbed = (id) => {
    if (!id) return "";
    const url = new URL(`https://www.youtube.com/embed/${id}`);
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
    url.searchParams.set("playsinline", "1");
    return url.toString();
  };
  if (hostname === "youtu.be") {
    const id = parsed.pathname.replace(/^\/+/, "").split(/[/?#&]/)[0];
    return buildYouTubeEmbed(id);
  }

  if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.split("/")[2];
      return buildYouTubeEmbed(id);
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      const id = parsed.pathname.split("/")[2];
      return buildYouTubeEmbed(id);
    }
    const id = parsed.searchParams.get("v");
    return buildYouTubeEmbed(id);
  }

  if (hostname === "vimeo.com" || hostname === "www.vimeo.com") {
    const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
    return id ? `https://player.vimeo.com/video/${id}` : "";
  }

  if (hostname === "player.vimeo.com") {
    if (!parsed.pathname.startsWith("/video/")) return "";
    return `https://player.vimeo.com${parsed.pathname}${parsed.search || ""}`;
  }

  return "";
}

function normalizeAspectRatio(value) {
  const raw = safeString(value);
  if (ALLOWED_ASPECT_RATIOS.has(raw)) return raw;
  return DEFAULT_ASPECT_RATIO;
}

function normalizeVideos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const external = sanitizeExternalVideoUrl(item.externalUrl || item.url || item.href);
      const file = ensureInsightUploadPath(item.file || item.src || item.video);
      if (!external && !file) return null;
      return {
        placement: normalizePlacement(item.placement),
        aspectRatio: normalizeAspectRatio(item.aspectRatio),
        external,
        file,
        poster: ensureInsightUploadPath(item.poster),
        captions: ensureInsightUploadPath(item.captions || item.captionsFile),
        title: safeString(item.title) || DEFAULT_VIDEO_TITLE,
        playerOptions: normalizePlayerOptions(item.playerOptions),
      };
    })
    .filter(Boolean);
}

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

function normalizeInsight(data, sourcePath = "") {
  if (!data || typeof data !== "object") {
    const error = new Error("Invalid insight payload.");
    error.type = "content";
    error.path = sourcePath;
    throw error;
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => safeString(tag)).filter(Boolean)
    : [];

  return {
    slug: safeString(data.slug),
    title: safeString(data.title),
    author: safeString(data.author),
    excerpt: safeString(data.excerpt),
    publishDate: safeString(data.publishDate),
    tags,
    featureImage: ensureInsightUploadPath(data.featureImage),
    featureImageAlt: safeString(data.featureImageAlt),
    body: typeof data.body === "string" ? data.body : "",
    sourcePath: safeString(data.sourcePath) || sourcePath,
    seo: {
      title: safeString(data?.seo?.title),
      description: safeString(data?.seo?.description),
      ogImage: ensureInsightUploadPath(data?.seo?.ogImage),
    },
    gallery: normalizeGallery(data.gallery),
    inlineImages: normalizeInlineImages(data.inlineImages),
    pullQuote: normalizePullQuote(data.pullQuote),
    videos: normalizeVideos(data.videos),
  };
}

function decodeSlug(rawSlug) {
  if (!rawSlug) return "";
  try {
    return decodeURIComponent(rawSlug);
  } catch (error) {
    return rawSlug;
  }
}

function normalizeSlug(rawSlug) {
  const decoded = decodeSlug(rawSlug);
  if (!decoded) return "";

  return decoded
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCamelCaseProperty(property) {
  return property
    .trim()
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function parseStyleAttribute(value) {
  if (!value) return undefined;
  return value
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .reduce((acc, rule) => {
      const [property, rawVal] = rule.split(":");
      if (!property || !rawVal) return acc;
      const key = toCamelCaseProperty(property);
      acc[key] = rawVal.trim();
      return acc;
    }, {});
}

function convertNodeToReact(node, key) {
  if (node instanceof TextNode) {
    const text = node.rawText;
    if (!text) return null;
    return <React.Fragment key={key}>{text}</React.Fragment>;
  }

  if (!(node instanceof HTMLElement)) {
    return null;
  }

  const tagName = node.tagName.toLowerCase();
  const props = { key };

  Object.entries(node.attributes || {}).forEach(([attrName, attrValue]) => {
    if (attrName === "class") {
      props.className = attrValue;
    } else if (attrName === "for") {
      props.htmlFor = attrValue;
    } else if (attrName === "style") {
      const styleObject = parseStyleAttribute(attrValue);
      if (styleObject && Object.keys(styleObject).length > 0) {
        props.style = styleObject;
      }
    } else {
      props[attrName] = attrValue;
    }
  });

  const children = node.childNodes
    .map((child, index) => convertNodeToReact(child, `${key}-${index}`))
    .filter((child) => child !== null && child !== undefined);

  if (children.length === 0) {
    return React.createElement(tagName, props);
  }

  return React.createElement(tagName, props, ...children);
}

function parseBodyHtmlToBlocks(html) {
  if (!html) return [];
  const root = parse(`<div>${html}</div>`, {
    blockTextElements: {
      script: true,
      noscript: true,
      style: true,
      pre: true,
    },
  });

  return root.childNodes
    .filter((node) => !(node instanceof TextNode && !node.rawText.trim()) && node.nodeType !== 8)
    .map((node, index) => ({
      element: convertNodeToReact(node, `body-${index}`),
      tagName: node instanceof HTMLElement ? node.tagName.toLowerCase() : null,
    }))
    .filter((entry) => entry.element != null);
}

function findAfterNthTag(blocks, tagName, occurrence) {
  let count = 0;
  for (let index = 0; index < blocks.length; index += 1) {
    if (blocks[index].tagName === tagName) {
      count += 1;
      if (count === occurrence) {
        return index;
      }
    }
  }
  return -1;
}

function findInsertionSlotIndex(blocks, placement) {
  if (!Array.isArray(blocks) || blocks.length === 0) return -1;
  switch (placement) {
    case "after-h1":
      return findAfterNthTag(blocks, "h1", 1);
    case "after-p2":
      return findAfterNthTag(blocks, "p", 2);
    case "after-p4":
      return findAfterNthTag(blocks, "p", 4);
    case "end":
      return blocks.length - 1;
    default:
      return blocks.length - 1;
  }
}

function getAspectRatioStyle(aspectRatio) {
  const [width, height] = String(aspectRatio)
    .split(":")
    .map((part) => Number(part));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { aspectRatio: DEFAULT_ASPECT_RATIO.replace(":", " / ") };
  }
  return { aspectRatio: `${width} / ${height}` };
}

function useLazyVisibility(rootMargin = "200px") {
  const [isVisible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isVisible];
}

function getVideoMimeType(src) {
  const safeSrc = safeString(src).toLowerCase();
  if (safeSrc.endsWith(".webm")) return "video/webm";
  if (safeSrc.endsWith(".ogv") || safeSrc.endsWith(".ogg")) return "video/ogg";
  return "video/mp4";
}

function extractPlainText(html) {
  if (!html) return "";
  try {
    const root = parse(`<div>${html}</div>`);
    return root.textContent.replace(/\s+/g, " ").trim();
  } catch (error) {
    return "";
  }
}

function getInsightDataPaths(slug) {
  if (!slug) return [];
  const safeSlug = encodeURIComponent(slug);
  return [`/data/insights/${safeSlug}.json`];
}

function useInsight(slugCandidates) {
  const [state, setState] = useState({ loading: true, insight: null, error: null });

  const slugKey = useMemo(() => {
    if (Array.isArray(slugCandidates)) {
      return slugCandidates.filter(Boolean).join("|");
    }
    return slugCandidates ? [slugCandidates].join("|") : "";
  }, [slugCandidates]);

  useEffect(() => {
    const slugs = slugKey ? slugKey.split("|").filter(Boolean) : [];
    if (slugs.length === 0) {
      setState({ loading: false, insight: null, error: null });
      return;
    }

    let cancelled = false;
    async function load() {
      setState({ loading: true, insight: null, error: null });
      const attemptedPaths = [];
      let lastError = null;
      let sawNotFound = false;

      for (const candidateSlug of slugs) {
        for (const path of getInsightDataPaths(candidateSlug)) {
          attemptedPaths.push(path);
          try {
            const res = await fetch(path, { cache: "no-store" });
            if (cancelled) return;

            if (res.ok) {
              let data;
              try {
                data = await res.json();
              } catch (error) {
                if (cancelled) return;
                const parseError = new Error(`Failed to parse insight JSON: ${error.message}`);
                parseError.type = "content";
                parseError.path = path;
                parseError.attemptedPaths = attemptedPaths.slice();
                setState({ loading: false, insight: null, error: parseError });
                return;
              }

              try {
                const parsed = normalizeInsight(data, path);
                const enriched = {
                  ...parsed,
                  slug: parsed.slug || candidateSlug,
                  sourceSlug: candidateSlug,
                };
                setState({ loading: false, insight: enriched, error: null });
                return;
              } catch (error) {
                if (cancelled) return;
                const normalizedError = error instanceof Error ? error : new Error(String(error));
                normalizedError.type = normalizedError.type || "content";
                normalizedError.path = normalizedError.path || path;
                normalizedError.attemptedPaths = attemptedPaths.slice();
                setState({ loading: false, insight: null, error: normalizedError });
                return;
              }
            }

            if (res.status === 404) {
              sawNotFound = true;
              continue;
            }

            const error = new Error(`Request failed: ${res.status}`);
            error.status = res.status;
            error.path = path;
            lastError = error;
            break;
          } catch (error) {
            if (cancelled) return;
            lastError = error instanceof Error ? error : new Error(String(error));
            break;
          }
        }
        if (lastError) break;
      }

      if (cancelled) return;

      if (lastError) {
        if (lastError.status && lastError.status !== 404) {
          lastError.type = lastError.type || "http";
        } else if (!lastError.status) {
          lastError.type = lastError.type || "network";
        }
        lastError.attemptedPaths = attemptedPaths;
        setState({ loading: false, insight: null, error: lastError });
        return;
      }

      if (sawNotFound || attemptedPaths.length > 0) {
        const missingError = new Error("missing_content");
        missingError.type = "missing";
        missingError.attemptedPaths = attemptedPaths;
        setState({ loading: false, insight: null, error: missingError });
        return;
      }

      setState({ loading: false, insight: null, error: null });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slugKey]);

  return state;
}

function formatPublishDate(value) {
  if (!value) return "";
  const dt = DateTime.fromISO(value, { zone: "local" });
  if (!dt.isValid) return "";
  return dt.toFormat("LLLL d, yyyy");
}

function truncate(value, length = 160) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.length <= length) return trimmed;
  return `${trimmed.slice(0, length - 1).trimEnd()}…`;
}

const SOCIAL_ICON_MAP = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music,
  linkedin: Linkedin,
};

export default function InsightPage() {
  const { slug } = useParams();
  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug]);
  const decodedSlug = useMemo(() => decodeSlug(slug), [slug]);
  const slugCandidates = useMemo(() => {
    const candidates = [];
    if (normalizedSlug) {
      candidates.push(normalizedSlug);
    }
    const decodedNormalized = normalizeSlug(decodedSlug);
    if (decodedNormalized && decodedNormalized !== normalizedSlug) {
      candidates.push(decodedNormalized);
    } else if (decodedSlug && !normalizedSlug) {
      candidates.push(decodedSlug.trim());
    }
    return Array.from(new Set(candidates.filter(Boolean)));
  }, [normalizedSlug, decodedSlug]);
  const shouldRedirect = slug && normalizedSlug && slug !== normalizedSlug;
  const { loading, insight, error } = useInsight(slugCandidates);
  const contactConfig = useContactConfig();
  const channels = useContactChannels(contactConfig);
  const whatsappChannel = useMemo(
    () => channels.find((item) => item.key === "whatsapp"),
    [channels],
  );
  const formRef = useRef(null);

  const origin = getSiteOrigin();
  const insightSlug = useMemo(() => normalizeSlug(insight?.slug), [insight?.slug]);
  const canonicalSlug = insightSlug || normalizedSlug;
  const slugHint = canonicalSlug || decodedSlug || "<slug>";
  const canonicalUrl = useMemo(() => {
    if (!canonicalSlug) return "";
    const safeSlug = encodeURIComponent(canonicalSlug);
    return `https://northsidegta.ca/insights/${safeSlug}`;
  }, [canonicalSlug]);

  if (!normalizedSlug) {
    return <Navigate to="/insights" replace />;
  }

  if (shouldRedirect) {
    return <Navigate to={`/insights/${normalizedSlug}`} replace />;
  }

  if (!loading && !error && insightSlug && normalizedSlug && insightSlug !== normalizedSlug) {
    return <Navigate to={`/insights/${insightSlug}`} replace />;
  }

  const bodyHtml = useMemo(() => {
    if (!insight?.body) return "";
    return marked.parse(insight.body);
  }, [insight?.body]);

  const bodyBlocks = useMemo(() => parseBodyHtmlToBlocks(bodyHtml), [bodyHtml]);
  const plainTextBody = useMemo(() => extractPlainText(bodyHtml), [bodyHtml]);

  const formattedDate = useMemo(() => formatPublishDate(insight?.publishDate), [insight?.publishDate]);

  const seoTitle = insight?.seo?.title
    ? insight.seo.title
    : insight?.title
      ? `NorthSide GTA Insights: ${insight.title}`
      : "NorthSide GTA Insights";
  const excerptOrBody = useMemo(() => {
    if (insight?.excerpt) return insight.excerpt;
    if (plainTextBody) return truncate(plainTextBody, 150);
    return "";
  }, [insight?.excerpt, plainTextBody]);
  const metaDescriptionSource = insight?.seo?.description || excerptOrBody;
  const metaDescription = truncate(metaDescriptionSource, 160);
  const featureImage = insight?.featureImage || "";
  const featureImageAlt = insight?.featureImageAlt || insight?.title || "NorthSide GTA";
  const ogImageSource = insight?.seo?.ogImage || featureImage || OG_FALLBACK_IMAGE;
  const ogImageAbsolute = toAbsoluteUrl(ogImageSource, origin);
  const ogImageAlt = featureImage ? featureImageAlt : "NorthSide GTA";

  const publishedIso = useMemo(() => {
    if (!insight?.publishDate) return "";
    const dt = DateTime.fromISO(insight.publishDate);
    return dt.isValid ? dt.toISO() : "";
  }, [insight?.publishDate]);

  const socialLinks = useMemo(() => getSocialLinks(), []);
  const attemptedPaths = useMemo(
    () => (Array.isArray(error?.attemptedPaths) ? error.attemptedPaths : []),
    [error],
  );
  const authoringContext = !IS_PRODUCTION;

  const contentSequence = useMemo(() => {
    const additions = [];

    if (Array.isArray(insight?.inlineImages)) {
      insight.inlineImages.forEach((image, index) => {
        if (!image?.image) return;
        additions.push({
          placement: image.placement || DEFAULT_INLINE_PLACEMENT,
          element: <InlineImageBlock key={`inline-image-${index}`} image={image} />,
        });
      });
    }

    if (insight?.pullQuote) {
      additions.push({
        placement: DEFAULT_INLINE_PLACEMENT,
        element: <PullQuoteBlock key="pull-quote" quote={insight.pullQuote} />,
      });
    }

    if (Array.isArray(insight?.videos)) {
      insight.videos.forEach((video, index) => {
        if (!video?.external && !video?.file) return;
        additions.push({
          placement: video.placement || DEFAULT_INLINE_PLACEMENT,
          element: <InlineVideoBlock key={`inline-video-${index}`} video={video} />,
        });
      });
    }

    const slotMap = new Map();
    const trailing = [];

    additions.forEach((item) => {
      const slotIndex = findInsertionSlotIndex(bodyBlocks, item.placement || DEFAULT_INLINE_PLACEMENT);
      if (slotIndex === -1) {
        trailing.push(item.element);
      } else {
        if (!slotMap.has(slotIndex)) slotMap.set(slotIndex, []);
        slotMap.get(slotIndex).push(item.element);
      }
    });

    const ordered = [];

    bodyBlocks.forEach((block, index) => {
      if (block.element) {
        ordered.push(block.element);
      }
      const extras = slotMap.get(index);
      if (extras) {
        extras.forEach((extra) => {
          ordered.push(extra);
        });
      }
    });

    return ordered.concat(trailing);
  }, [bodyBlocks, insight?.inlineImages, insight?.pullQuote, insight?.videos]);

  let errorTitle = "We couldn’t find that insight.";
  let errorMessage = "Check the URL or return to the homepage.";
  if (error?.type === "missing") {
    errorTitle = "Insight data is missing.";
    errorMessage = authoringContext
      ? `We couldn’t load the data for this insight. Confirm that public/content/insights/${slugHint}/index.md exists and run npm run generate:insights to create public/data/insights/${slugHint}.json.`
      : "Check the URL or return to the homepage.";
  } else if (error?.type === "content") {
    errorTitle = "Insight data parse error.";
    errorMessage = authoringContext
      ? "We found the insight file but the generated JSON could not be parsed. Fix the markdown front matter and run npm run generate:insights again."
      : "Something went wrong while loading this insight.";
  } else if (error?.type === "network" || error?.type === "http") {
    errorTitle = "Unable to load insight.";
    errorMessage = "Something went wrong while loading this insight. Please try again.";
  }

  const articleTagsMeta = useMemo(() => {
    if (!Array.isArray(insight?.tags)) return [];
    return insight.tags
      .map((tag) => {
        if (!tag) return null;
        const trimmed = typeof tag === "string" ? tag.trim() : String(tag).trim();
        if (!trimmed) return null;
        return { property: "article:tag", content: trimmed, key: `article-tag-${trimmed}` };
      })
      .filter(Boolean);
  }, [insight?.tags]);

  const metaConfig = useMemo(
    () => ({
      documentTitle: seoTitle,
      title: seoTitle,
      description: metaDescription,
      canonicalUrl,
      ogType: "article",
      ogImage: ogImageAbsolute,
      ogImageAlt,
      twitterCard: "summary_large_image",
      articlePublishedTime: publishedIso,
      articleAuthor: insight?.author,
      additionalMeta: articleTagsMeta,
    }),
    [
      seoTitle,
      metaDescription,
      canonicalUrl,
      ogImageAbsolute,
      ogImageAlt,
      publishedIso,
      insight?.author,
      articleTagsMeta,
    ],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DynamicMetaTags {...metaConfig} />

      <Navigation />

      <main>
        <Hero insight={insight} loading={loading} featureImageAlt={featureImageAlt} />

        <article className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <p className="mb-6 text-sm text-emerald-700">
            <Link
              to="/insights"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              <span aria-hidden>←</span>
              <span>Back to Insights</span>
            </Link>
          </p>
          {loading && (
            <div className="rounded-3xl border border-emerald-100 bg-white/70 px-6 py-12 text-center text-sm text-slate-500 shadow-lg shadow-emerald-50">
              Loading insight…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-rose-100 bg-white px-6 py-12 text-center text-sm text-rose-600 shadow-lg shadow-rose-50">
              <p className="font-semibold">{errorTitle}</p>
              <p className="mt-3 text-rose-500">{errorMessage}</p>
              {authoringContext && error?.type === "content" && (
                <div className="mt-4 space-y-2 text-left text-xs text-rose-500">
                  {error?.path && (
                    <p>
                      <strong>File:</strong> <span className="break-all">{error.path}</span>
                    </p>
                  )}
                  {error?.message && (
                    <p>
                      <strong>Details:</strong> {error.message}
                    </p>
                  )}
                </div>
              )}
              {authoringContext && attemptedPaths.length > 0 && (
                <details className="mt-4 text-left text-xs text-rose-500">
                  <summary className="cursor-pointer text-rose-600">Technical details</summary>
                  <div className="mt-2 space-y-1">
                    <p>Checked paths:</p>
                    <ul className="list-disc space-y-1 pl-4">
                      {attemptedPaths.map((path) => (
                        <li key={path} className="break-all">{path}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>
          )}

          {!loading && !error && insight && (
            <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <aside className="space-y-6 lg:order-1 lg:sticky lg:top-32 self-start">
                <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-emerald-500">
                    Published
                  </p>
                  <div className="mt-4 space-y-2 text-base text-slate-600">
                    {formattedDate && (
                      <p className="font-semibold text-slate-900">{formattedDate}</p>
                    )}
                    {insight.author && (
                      <p className="text-sm text-slate-500">By {insight.author}</p>
                    )}
                    {!formattedDate && !insight.author && (
                      <p className="text-sm text-slate-500">Publication details coming soon.</p>
                    )}
                  </div>
                  {insight.tags?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {insight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {insight.excerpt && (
                  <p className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 text-lg font-medium leading-relaxed text-emerald-900 shadow-inner shadow-emerald-100/80">
                    {insight.excerpt}
                  </p>
                )}
              </aside>

              <div className="space-y-12 lg:order-2">
                {contentSequence.length > 0 && (
                  <div className="insight-content">{contentSequence}</div>
                )}

                {insight.gallery?.length > 0 && (
                  <section className="space-y-6 rounded-3xl border border-emerald-100/80 bg-white/80 p-8 shadow-xl shadow-emerald-100/60 backdrop-blur">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">In pictures</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        A closer look at the moments behind this insight.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {insight.gallery.map((item) => (
                        <figure
                          key={item.image}
                          className="group overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/80 shadow-lg shadow-emerald-100/60"
                        >
                          <img
                            src={item.image}
                            alt={item.alt || ""}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
                          />
                          {(item.caption || item.alt) && (
                            <figcaption className="px-4 py-3 text-sm text-slate-500">
                              {item.caption || item.alt}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </article>

        <InsightCta
          contactConfig={contactConfig}
          whatsappChannel={whatsappChannel}
          formRef={formRef}
        />

        <SocialBar links={socialLinks} />
      </main>

      <Footer />
    </div>
  );
}

function InlineImageBlock({ image }) {
  if (!image?.image) return null;
  const caption = image.caption || image.alt;
  return (
    <figure className="insight-inline-media">
      <img
        src={image.image}
        alt={image.alt || ""}
        loading="lazy"
        decoding="async"
      />
      {caption && <figcaption className="insight-inline-media__caption">{caption}</figcaption>}
    </figure>
  );
}

function PullQuoteBlock({ quote }) {
  if (!quote?.text) return null;
  return (
    <figure className="insight-pull-quote">
      {quote.portrait && (
        <div className="insight-pull-quote__portrait">
          <img
            src={quote.portrait}
            alt={quote.attribution ? `${quote.attribution} portrait` : "Portrait"}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <blockquote>{quote.text}</blockquote>
      {quote.attribution && <figcaption>— {quote.attribution}</figcaption>}
    </figure>
  );
}

function InlineVideoBlock({ video }) {
  if (!video) return null;
  const [containerRef, isVisible] = useLazyVisibility();
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible]);

  const shouldLoad = hasBeenVisible || isVisible;
  const frameStyle = useMemo(() => getAspectRatioStyle(video.aspectRatio), [video.aspectRatio]);
  const caption = safeString(video.title);

  return (
    <figure className="insight-inline-video" ref={containerRef}>
      <div className="insight-inline-video__frame" style={frameStyle}>
        {video.external ? (
          <ExternalVideoEmbed video={video} shouldLoad={shouldLoad} />
        ) : (
          <UploadedVideoPlayer video={video} shouldLoad={shouldLoad} />
        )}
      </div>
      {caption && <figcaption className="insight-inline-video__caption">{caption}</figcaption>}
    </figure>
  );
}

function ExternalVideoEmbed({ video, shouldLoad }) {
  if (!video?.external) return null;
  const src = shouldLoad ? video.external : undefined;
  return (
    <iframe
      className="insight-inline-video__iframe"
      src={src}
      title={video.title || "Embedded video"}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

function UploadedVideoPlayer({ video, shouldLoad }) {
  if (!video?.file) return null;
  const videoRef = useRef(null);

  useEffect(() => {
    if (!shouldLoad) return undefined;
    const node = videoRef.current;
    if (!node || !video.playerOptions?.startAt) return undefined;

    const handleLoadedMetadata = () => {
      try {
        node.currentTime = video.playerOptions.startAt;
      } catch (error) {
        // ignore seek errors
      }
    };

    node.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    return () => {
      node.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [shouldLoad, video.playerOptions?.startAt]);

  const autoPlay = Boolean(shouldLoad && video.playerOptions?.autoplay);
  const controls = video.playerOptions?.showControls !== false;
  const loop = Boolean(video.playerOptions?.loop);
  const preload = shouldLoad ? "metadata" : "none";

  return (
    <video
      ref={videoRef}
      className="insight-inline-video__video"
      controls={controls}
      autoPlay={autoPlay}
      muted={autoPlay || undefined}
      loop={loop}
      playsInline
      poster={video.poster || undefined}
      preload={preload}
      title={video.title || "Insight video"}
      aria-label={video.title || "Insight video"}
    >
      {shouldLoad && (
        <>
          <source src={video.file} type={getVideoMimeType(video.file)} />
          {video.captions && (
            <track kind="captions" src={video.captions} label="Captions" default />
          )}
        </>
      )}
      Your browser does not support the video tag.
    </video>
  );
}

function Hero({ insight, loading, featureImageAlt }) {
  const featureImage = insight?.featureImage || HERO_PLACEHOLDER_IMAGE;
  const publishDate = formatPublishDate(insight?.publishDate);
  const heroAlt = featureImageAlt || insight?.title || "NorthSide GTA";
  return (
    <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
      <div className="absolute inset-0">
        <img
          src={featureImage}
          alt={heroAlt}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-emerald-950/65 mix-blend-multiply" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-950/90 via-emerald-900/70 to-transparent"
          aria-hidden
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.22),_transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 right-8 hidden h-48 w-48 bg-contain bg-no-repeat opacity-15 sm:block"
        style={{ backgroundImage: "url('/Images/northsidegta-logo.svg')" }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[48vh] w-full max-w-5xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="inline-flex w-max items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.42em] text-emerald-100 backdrop-blur">
          NorthSide GTA Insights
        </div>
        <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
          {loading ? "Loading insight…" : insight?.title}
        </h1>
        <p className="mt-6 text-sm font-medium text-emerald-100/90 sm:text-base">
          {insight?.author && publishDate
            ? `${insight.author} • ${publishDate}`
            : insight?.author || publishDate}
        </p>
      </div>
    </section>
  );
}

function InsightCta({ contactConfig, whatsappChannel, formRef }) {
  const whatsappHref = whatsappChannel?.href;

  const handleExploreClick = () => {
    const route = typeof window !== "undefined" && window.location?.pathname
      ? window.location.pathname
      : "/insights";
    trackEvent("insight_cta_click", { route });
  };

  const handleWhatsAppClick = (event) => {
    trackEvent("hero_cta_click", { route: "/contact", cta: "chat_whatsapp" });
    trackEvent("click_whatsapp", { route: "/contact", source: "hero" });
    if (!whatsappHref) {
      event.preventDefault();
    }
  };

  return (
    <section className="relative isolate mt-12 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#174a0a] via-[#1f6b14] to-[#32610E]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.25),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-emerald-100">
            Always-on concierge
          </p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-[2.25rem]">
            Discover the NorthSide GTA with Finally Home Agents
          </h2>
          <p className="max-w-2xl text-base text-emerald-100/90">
            Meet our team in the same space where your buyers and sellers win. Share your move details and we’ll reply within the hour, 9am–9pm.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-emerald-900/30 ring-1 ring-emerald-100">
            <SmartContactForm
              config={contactConfig}
              formRef={formRef}
              whatsappChannel={whatsappChannel}
            />
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/30 bg-white/10 p-6 text-emerald-50 shadow-xl shadow-emerald-900/30 backdrop-blur">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Let’s plan your next move</h3>
              <p className="text-sm text-emerald-100/90">
                Start with a concierge conversation or explore the full NorthSide GTA hub for market intel, events, and curated listings.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/"
                onClick={handleExploreClick}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-50 sm:w-auto"
              >
                Explore NorthSideGTA.ca
              </a>
              {whatsappHref && (
                <a
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:border-white/70 hover:bg-white/20"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-inner shadow-black/30 transition group-hover:scale-105">
                    <WhatsAppGlyph className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-base">Chat with Us on WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialBar({ links }) {
  if (!Array.isArray(links) || links.length === 0) return null;
  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-slate-600 sm:flex-row sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
          Follow us
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
          {links.map((link) => {
            const Icon = SOCIAL_ICON_MAP[link.key] || null;
            return (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900"
                aria-label={`Follow us on ${link.label}`}
              >
                {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : <span className="text-sm font-semibold">{link.label.charAt(0)}</span>}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WhatsAppGlyph({ className = "h-4 w-4 text-[#25D366]" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 2.25c-5.37 0-9.75 4.38-9.75 9.75 0 1.72.45 3.39 1.31 4.88L2 22l5.29-1.51A9.7 9.7 0 0 0 12 21.75c5.37 0 9.75-4.38 9.75-9.75S17.37 2.25 12 2.25Zm0 17.5c-1.55 0-3.07-.41-4.42-1.2l-.32-.19-3.13.9.9-3.06-.2-.34A7.32 7.32 0 0 1 4.5 12C4.5 7.87 7.87 4.5 12 4.5s7.5 3.37 7.5 7.5-3.37 7.75-7.5 7.75Zm4.15-5.8c-.23-.12-1.35-.67-1.56-.75-.21-.08-.36-.12-.5.12-.15.23-.58.75-.71.91-.13.16-.26.18-.49.06-.23-.12-.98-.36-1.86-1.11-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.5-1.2-.69-1.64-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.4.06-.61.3-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.12.16 1.6 2.45 3.88 3.33.54.23.97.36 1.3.46.55.18 1.05.16 1.45.1.44-.07 1.35-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.09-.21-.15-.44-.27Z"
      />
    </svg>
  );
}
