// src/CuratedPage.js
import React from "react";
import { useParams } from "react-router-dom";
import LeadForm from "./components/LeadForm";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";

function useCurated(slug) {
  const [page, setPage] = React.useState(null);
  const [err, setErr] = React.useState(null);
  React.useEffect(() => {
    let ignore = false;
    fetch(`/data/collections/${slug}.json`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Missing JSON"); return r.json(); })
      .then(d => { if (!ignore) setPage(d); })
      .catch(e => { if (!ignore) setErr(e); });
    return () => { ignore = true; };
  }, [slug]);
  return { page, err };
}

const HERO_BACKGROUND = "/Images/hero2000x1500.svg";
const DEFAULT_SUBHEADLINE =
  "Bigger lots, more value, and less traffic — get the listings now.";

const MIME_LOOKUP = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

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

function guessImageMimeType(value) {
  if (!value) return "";
  const match = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(value);
  if (!match) return "";
  const ext = match[1].toLowerCase();
  if (MIME_LOOKUP[ext]) return MIME_LOOKUP[ext];
  return `image/${ext}`;
}

export default function CuratedPage() {
  const { slug } = useParams();
  const { page, err } = useCurated(slug);

  if (err) return <main style={{maxWidth:960,margin:"40px auto"}}>Not found.</main>;
  if (!page) return <main style={{maxWidth:960,margin:"40px auto"}}>Loading…</main>;

  const heroImage = typeof page.heroImage === "string" ? page.heroImage.trim() : page.heroImage;
  const heroImageSrc = heroImage ? heroImage : HERO_BACKGROUND;
  const defaultOrigin = "https://northsidegta.ca";
  const site =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : defaultOrigin;
  const absoluteUrl = path => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${site.replace(/\/$/, "")}${normalized}`;
  };
  const ogImageRaw = absoluteUrl(heroImageSrc);
  const ogImageSecure = ensureSecureUrl(ogImageRaw);
  const ogImage = ogImageSecure || ogImageRaw;
  const ogImageType = guessImageMimeType(heroImageSrc || ogImageRaw);

  const legacyTitle =
    (typeof page.title === "string" && page.title.trim()) ||
    (typeof page.legacyTitle === "string" && page.legacyTitle.trim()) ||
    "";
  const headline =
    (typeof page.headline === "string" && page.headline.trim()) ||
    legacyTitle ||
    "Curated Listings";
  const subheadline =
    (typeof page.subheadline === "string" && page.subheadline.trim()) || DEFAULT_SUBHEADLINE;
  const ctaText =
    (typeof page.ctaText === "string" && page.ctaText.trim()) || "Send Me the Listings";
  const eyebrow =
    (typeof page.eyebrow === "string" && page.eyebrow.trim()) || "";
  const formHeader =
    (typeof page.formHeader === "string" && page.formHeader.trim()) || "";
  const formSubheader =
    (typeof page.formSubheader === "string" && page.formSubheader.trim()) || "";
  const trustLine =
    (typeof page.trustLine === "string" && page.trustLine.trim()) || "";
  const seoDescription =
    (typeof page.seoDescription === "string" && page.seoDescription.trim()) || subheadline;

  const redirectTopic =
    (typeof page.slug === "string" && page.slug.trim()) ||
    (typeof slug === "string" && slug.trim()) ||
    headline;
  const redirectUrl = `/thank-you?topic=${encodeURIComponent(redirectTopic)}`;

  const showWhatsappFooter = Boolean(page.showWhatsappLink && page.whatsappUrl);
  const whatsappHref = typeof page.whatsappUrl === "string" ? page.whatsappUrl.trim() : "";

  const slugValue = typeof slug === "string" ? slug.trim() : "";
  const canonicalSlug = slugValue;
  const slugText = slugValue ? slugValue.replace(/[-_]+/g, " ").trim() : "";
  const heroAltText = `${headline || slugText || "NorthSide GTA"} hero image`;
  const canonicalUrl = absoluteUrl(`/collections/${encodeURIComponent(canonicalSlug)}`);
  const pageTitle = `${headline} • NorthSide GTA`;

  const metaConfig = {
    documentTitle: pageTitle,
    title: pageTitle,
    description: seoDescription,
    canonicalUrl,
    ogType: "website",
    ogImage,
    ogImageAlt: heroAltText,
    siteName: "NorthSide GTA",
    twitterCard: "summary_large_image",
    twitterImage: ogImage,
    additionalMeta: [
      { name: "robots", content: "noindex,nofollow" },
      ogImageSecure && { property: "og:image:secure_url", content: ogImageSecure || ogImage },
      ogImageType && { property: "og:image:type", content: ogImageType },
      canonicalUrl && { name: "twitter:url", content: canonicalUrl },
      ogImageType && { name: "twitter:image:type", content: ogImageType },
    ].filter(Boolean),
  };

  return (
    <>
      <DynamicMetaTags {...metaConfig} />

      <div style={layout.page}>
        <main style={layout.main}>
          <div style={layout.mainInner}>
            <div style={layout.heroMediaWrap}>
              <img src={heroImageSrc} alt={heroAltText} style={layout.heroImage} />
            </div>
            <div style={layout.contentColumn}>
              <div style={layout.headingGroup}>
                {eyebrow && <p style={layout.eyebrow}>{eyebrow}</p>}
                <h1 style={layout.headline}>{headline}</h1>
                {subheadline && <p style={layout.subheadline}>{subheadline}</p>}
              </div>
              <div style={layout.formWrap}>
                <LeadForm
                  slug={(typeof page.slug === "string" && page.slug.trim()) || slug}
                  title={headline}
                  realmLink={page.realmLink}
                  ctaText={ctaText}
                  formHeader={formHeader}
                  formSubheader={formSubheader}
                  trustLine={trustLine}
                  onSuccessRedirect={redirectUrl}
                />
              </div>
            </div>
          </div>
        </main>

        {showWhatsappFooter && whatsappHref && (
          <footer style={layout.footer}>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={layout.whatsappLink}
            >
              Prefer WhatsApp? Message us ↗
            </a>
          </footer>
        )}
      </div>
    </>
  );
}

const layout = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  main: {
    flex: "1 1 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "min(12vh, 120px) 20px 60px",
  },
  mainInner: {
    width: "100%",
    maxWidth: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 56,
  },
  heroMediaWrap: {
    flex: "0 1 420px",
    width: "100%",
    maxWidth: 480,
    borderRadius: 32,
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
    backgroundColor: "#fff",
  },
  heroImage: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "cover",
  },
  contentColumn: {
    flex: "1 1 460px",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headingGroup: {
    textAlign: "center",
    maxWidth: 720,
    marginBottom: 32,
  },
  eyebrow: {
    margin: "0 0 12px",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: "#64748b",
  },
  headline: {
    margin: 0,
    fontSize: "clamp(32px, 4vw, 46px)",
    lineHeight: 1.05,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  subheadline: {
    marginTop: 18,
    marginBottom: 0,
    fontSize: 18,
    lineHeight: 1.6,
    color: "#475569",
  },
  formWrap: {
    width: "100%",
    maxWidth: 420,
  },
  footer: {
    padding: "24px 20px",
    display: "flex",
    justifyContent: "center",
  },
  whatsappLink: {
    fontSize: 12,
    color: "#0f172a",
    opacity: 0.65,
    textDecoration: "none",
  },
};

if (typeof window !== "undefined") {
  const mq = window.matchMedia("(max-width: 640px)");
  if (mq.matches) {
    layout.main.padding = "80px 18px 48px";
    layout.mainInner.flexDirection = "column";
    layout.mainInner.maxWidth = "100%";
    layout.mainInner.gap = 32;
    layout.heroMediaWrap.maxWidth = 360;
    layout.heroMediaWrap.borderRadius = 24;
    layout.contentColumn.alignItems = "center";
    layout.contentColumn.maxWidth = "100%";
    layout.headingGroup.marginBottom = 28;
    layout.headline.fontSize = 30;
    layout.subheadline.fontSize = 16;
  }
}
