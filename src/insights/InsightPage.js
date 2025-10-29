import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import matter from "gray-matter";
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
import {
  Facebook,
  Instagram,
  Linkedin,
  Music,
  Youtube,
} from "lucide-react";

const markdownRenderer = new marked.Renderer();
markdownRenderer.image = (href, title, text) => {
  const caption = title ? `<figcaption class="insight-figure__caption">${title}</figcaption>` : "";
  const safeSrc = href || "";
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
      const image = typeof item === "string" ? item : item.image;
      if (!image) return null;
      return {
        image,
        alt: (item.alt || "").toString(),
        caption: (item.caption || "").toString(),
      };
    })
    .filter(Boolean);
}

function normalizeInsight(content) {
  const { data, content: body = "" } = matter(content || "");
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => (tag || "").toString().trim()).filter(Boolean)
    : [];
  const publishDate =
    data.publishDate || data.publish_date || data.date || data.published || null;

  return {
    title: (data.title || "").toString().trim(),
    author: (data.author || "").toString().trim(),
    excerpt: (data.excerpt || "").toString().trim(),
    publishDate,
    tags,
    featureImage: (data.featureImage || data.feature_image || "").toString().trim(),
    featureImageAlt: (data.featureImageAlt || data.feature_image_alt || "").toString().trim(),
    body,
    seo: {
      title: data?.seo?.title ? data.seo.title.toString() : "",
      description: data?.seo?.description ? data.seo.description.toString() : "",
      ogImage: data?.seo?.ogImage ? data.seo.ogImage.toString() : "",
    },
    gallery: normalizeGallery(data.gallery),
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

function getInsightPath(slug) {
  const safeSlug = encodeURIComponent(slug);
  return `/content/insights/${safeSlug}/index.md`;
}

function useInsight(slug) {
  const [state, setState] = useState({ loading: true, insight: null, error: null });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setState({ loading: true, insight: null, error: null });
      try {
        const res = await fetch(getInsightPath(slug), { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("not_found");
          }
          throw new Error(`Request failed: ${res.status}`);
        }
        const text = await res.text();
        if (cancelled) return;
        const parsed = normalizeInsight(text);
        setState({ loading: false, insight: parsed, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({ loading: false, insight: null, error });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
  const shouldRedirect = slug && normalizedSlug && slug !== normalizedSlug;
  const { loading, insight, error } = useInsight(normalizedSlug);
  const contactConfig = useContactConfig();
  const channels = useContactChannels(contactConfig);
  const whatsappChannel = useMemo(
    () => channels.find((item) => item.key === "whatsapp"),
    [channels],
  );
  const formRef = useRef(null);

  const origin = getSiteOrigin();
  const canonicalUrl = useMemo(() => {
    if (!normalizedSlug) return "";
    const safeSlug = encodeURIComponent(normalizedSlug);
    return `https://northsidegta.ca/insights/${safeSlug}`;
  }, [normalizedSlug]);

  if (!normalizedSlug) {
    return <Navigate to="/insights" replace />;
  }

  if (shouldRedirect) {
    return <Navigate to={`/insights/${normalizedSlug}`} replace />;
  }

  const bodyHtml = useMemo(() => {
    if (!insight?.body) return "";
    return marked.parse(insight.body);
  }, [insight?.body]);

  const formattedDate = useMemo(() => formatPublishDate(insight?.publishDate), [insight?.publishDate]);

  const seoTitle = insight?.seo?.title
    ? insight.seo.title
    : insight?.title
      ? `NorthSide GTA Insights: ${insight.title}`
      : "NorthSide GTA Insights";
  const metaDescription = truncate(insight?.seo?.description || insight?.excerpt || "");
  const featureImage = insight?.featureImage || "";
  const featureImageAlt = insight?.featureImageAlt || insight?.title || "NorthSide GTA";
  const ogImage = insight?.seo?.ogImage || featureImage;
  const ogImageAbsolute = toAbsoluteUrl(ogImage, origin);

  const publishedIso = useMemo(() => {
    if (!insight?.publishDate) return "";
    const dt = DateTime.fromISO(insight.publishDate);
    return dt.isValid ? dt.toISO() : "";
  }, [insight?.publishDate]);

  const socialLinks = useMemo(() => getSocialLinks(), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Helmet>
        <title>{seoTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:type" content="article" />
        {seoTitle && <meta property="og:title" content={seoTitle} />}
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {ogImageAbsolute && <meta property="og:image" content={ogImageAbsolute} />}
        {featureImageAlt && <meta property="og:image:alt" content={featureImageAlt} />}
        <meta name="twitter:card" content="summary_large_image" />
        {seoTitle && <meta name="twitter:title" content={seoTitle} />}
        {metaDescription && <meta name="twitter:description" content={metaDescription} />}
        {ogImageAbsolute && <meta name="twitter:image" content={ogImageAbsolute} />}
        {featureImageAlt && <meta name="twitter:image:alt" content={featureImageAlt} />}
        {publishedIso && <meta property="article:published_time" content={publishedIso} />}
        {insight?.author && <meta property="article:author" content={insight.author} />}
        {Array.isArray(insight?.tags) &&
          insight.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
      </Helmet>

      <Navigation />

      <main>
        <Hero insight={insight} loading={loading} featureImageAlt={featureImageAlt} />

        <article className="mx-auto w-full max-w-[880px] px-4 pb-12 pt-10 sm:px-6 lg:px-0">
          {loading && (
            <div className="rounded-3xl border border-emerald-100 bg-white/70 px-6 py-12 text-center text-sm text-slate-500 shadow-lg shadow-emerald-50">
              Loading insight…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-rose-100 bg-white px-6 py-12 text-center text-sm text-rose-600 shadow-lg shadow-rose-50">
              We couldn’t find that insight. Check the URL or return to the homepage.
            </div>
          )}

          {!loading && !error && insight && (
            <div className="space-y-8">
              <header className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-500">
                  {formattedDate}
                  {insight.author ? ` • ${insight.author}` : ""}
                </div>
                {insight.excerpt && (
                  <p className="text-lg text-slate-600">{insight.excerpt}</p>
                )}
                {insight.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {insight.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {bodyHtml && (
                <div className="insight-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              )}

              {insight.gallery?.length > 0 && (
                <section className="space-y-6 border-t border-slate-200 pt-8">
                  <h2 className="text-xl font-semibold text-slate-800">Gallery</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {insight.gallery.map((item) => (
                      <figure
                        key={item.image}
                        className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-emerald-50 ring-1 ring-emerald-100/60"
                      >
                        <img
                          src={item.image}
                          alt={item.alt || ""}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
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

function Hero({ insight, loading, featureImageAlt }) {
  const featureImage = insight?.featureImage;
  const publishDate = formatPublishDate(insight?.publishDate);
  return (
    <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
      <div className="absolute inset-0 bg-[#04110c]" aria-hidden />
      {featureImage && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featureImage})` }}
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-900/75 to-emerald-950/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-6 right-6 h-48 w-48 bg-contain bg-no-repeat opacity-10"
        style={{ backgroundImage: "url('/Images/northsidegta-logo.svg')" }}
        role="presentation"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[40vh] w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.45em] text-emerald-200">
          NorthSide GTA Insights
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
          {loading ? "Loading insight…" : insight?.title}
        </h1>
        <p className="mt-4 text-sm font-medium text-emerald-100 sm:text-base">
          {insight?.author && publishDate
            ? `${insight.author} • ${publishDate}`
            : insight?.author || publishDate}
        </p>
      </div>
      {featureImageAlt && <span className="sr-only">{featureImageAlt}</span>}
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
