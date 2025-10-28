import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DateTime } from "luxon";
import Navigation from "../Navigation";
import Footer from "../Footer";
import SocialFollowStrip from "../components/SocialFollowStrip";
import WhatsAppButton from "../components/contact/WhatsAppButton";
import SmartContactForm from "../components/contact/SmartContactForm";
import {
  useContactChannels,
  useContactConfig,
} from "../components/contact/contactConfig";
import { trackEvent } from "../utils/analytics";
import { parseFrontMatter } from "../utils/frontmatter";

const DEFAULT_ORIGIN = "https://northsidegta.ca";
const WATERMARK_SRC = "/Images/northsidegta-logo.svg";

const markdownComponents = {
  h2: ({ node, ...props }) => (
    <h2
      {...props}
      className="mt-12 text-3xl font-semibold tracking-tight text-slate-900 first:mt-0"
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      {...props}
      className="mt-8 text-2xl font-semibold tracking-tight text-slate-900"
    />
  ),
  p: ({ node, ...props }) => (
    <p
      {...props}
      className="mt-6 text-[17px] leading-8 text-slate-700 first:mt-0"
    />
  ),
  ul: ({ node, ordered, ...props }) => (
    <ul
      {...props}
      className="mt-6 list-disc space-y-2 pl-6 text-[17px] leading-8 text-slate-700"
    />
  ),
  ol: ({ node, ordered, ...props }) => (
    <ol
      {...props}
      className="mt-6 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-slate-700"
    />
  ),
  li: ({ node, ...props }) => <li {...props} className="text-[17px] leading-7 text-slate-700" />, 
  blockquote: ({ node, ...props }) => (
    <blockquote
      {...props}
      className="mt-8 border-l-4 border-emerald-200 pl-6 text-lg italic text-slate-700"
    />
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      className="font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
    />
  ),
  strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-slate-900" />, 
  img: ({ node, ...props }) => {
    const caption = node?.title || "";
    return (
      <figure className="my-10">
        <img
          {...props}
          loading="lazy"
          decoding="async"
          className="w-full rounded-3xl shadow-xl shadow-emerald-900/10"
        />
        {caption ? (
          <figcaption className="mt-3 text-sm text-slate-500">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  },
};

function ensureAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : DEFAULT_ORIGIN;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

function normalizeFrontMatter(data = {}, content = "", slug = "") {
  const publishDateRaw = data.publishDate || data.date || "";
  const publishDate = DateTime.fromISO(publishDateRaw, { zone: "local" });
  const formattedDate = publishDate.isValid
    ? publishDate.toLocaleString(DateTime.DATE_FULL)
    : "";

  const tags = Array.isArray(data.tags)
    ? data.tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
    : [];

  const gallery = Array.isArray(data.gallery)
    ? data.gallery
        .map((item) => ({
          image: typeof item?.image === "string" ? item.image.trim() : "",
          alt: typeof item?.alt === "string" ? item.alt.trim() : "",
          caption:
            typeof item?.caption === "string" ? item.caption.trim() : "",
        }))
        .filter((item) => item.image)
    : [];

  return {
    slug,
    title: typeof data.title === "string" ? data.title.trim() : "",
    author: typeof data.author === "string" ? data.author.trim() : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : "",
    featureImage:
      typeof data.featureImage === "string" ? data.featureImage.trim() : "",
    featureImageAlt:
      typeof data.featureImageAlt === "string"
        ? data.featureImageAlt.trim()
        : "",
    featureImageCredit:
      typeof data.featureImageCredit === "string"
        ? data.featureImageCredit.trim()
        : "",
    body: content,
    publishDate: publishDateRaw,
    formattedDate,
    tags,
    seo: typeof data.seo === "object" && data.seo !== null ? data.seo : {},
    gallery,
  };
}

function useInsight(slug) {
  const [state, setState] = React.useState({
    loading: true,
    entry: null,
    error: null,
  });

  React.useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setState({ loading: true, entry: null, error: null });
      try {
        const response = await fetch(`/content/insights/${slug}/index.md`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("not_found");
        }
        const text = await response.text();
        if (cancelled) return;
        const { data, content } = parseFrontMatter(text);
        const normalized = normalizeFrontMatter(data, content, slug);
        setState({ loading: false, entry: normalized, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({ loading: false, entry: null, error });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

export default function InsightPage() {
  const { slug = "" } = useParams();
  const { loading, entry, error } = useInsight(slug);
  const config = useContactConfig();
  const channels = useContactChannels(config);
  const whatsappChannel = React.useMemo(
    () => channels.find((item) => item.key === "whatsapp"),
    [channels]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <Navigation />
        <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center text-base">
          Loading insight…
        </main>
        <Footer />
      </div>
    );
  }

  if (!entry || error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <Navigation />
        <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center text-base">
          This insight is not available.
        </main>
        <Footer />
      </div>
    );
  }

  const {
    title,
    author,
    excerpt,
    featureImage,
    featureImageAlt,
    featureImageCredit,
    formattedDate,
    publishDate,
    tags,
    seo,
    gallery,
  } = entry;

  const canonicalUrl = ensureAbsoluteUrl(`/insights/${slug}`);
  const featureImageUrl = ensureAbsoluteUrl(featureImage);
  const seoTitle =
    typeof seo?.title === "string" && seo.title.trim().length > 0
      ? seo.title.trim()
      : `NorthSide GTA Insights: ${title}`;
  const seoDescription =
    typeof seo?.description === "string" && seo.description.trim().length > 0
      ? seo.description.trim()
      : excerpt;
  const ogImage =
    typeof seo?.ogImage === "string" && seo.ogImage.trim().length > 0
      ? ensureAbsoluteUrl(seo.ogImage.trim())
      : featureImageUrl;

  const publishedDateTime = DateTime.fromISO(publishDate);
  const publishDateIso = publishedDateTime.isValid
    ? publishedDateTime.toISO()
    : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription && <meta name="description" content={seoDescription} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        {seoDescription && (
          <meta property="og:description" content={seoDescription} />
        )}
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {featureImageAlt && (
          <meta property="og:image:alt" content={featureImageAlt} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        {seoDescription && (
          <meta name="twitter:description" content={seoDescription} />
        )}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {featureImageAlt && (
          <meta name="twitter:image:alt" content={featureImageAlt} />
        )}
        {publishDateIso && (
          <meta property="article:published_time" content={publishDateIso} />
        )}
        {author && <meta name="author" content={author} />}
        {tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>

      <Navigation />

      <main>
        <HeroSection
          title={title}
          excerpt={excerpt}
          author={author}
          formattedDate={formattedDate}
          publishDateIso={publishDateIso}
          featureImage={featureImage}
          featureImageAlt={featureImageAlt}
          featureImageCredit={featureImageCredit}
          tags={tags}
        />

        <article className="mx-auto max-w-4xl px-4 py-14">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {entry.body}
          </ReactMarkdown>
        </article>

        {gallery.length > 0 && <GallerySection items={gallery} />}

        <InsightCtaSection
          config={config}
          whatsappChannel={whatsappChannel}
          slug={slug}
        />

        <SocialFollowStrip alignment="start" />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection({
  title,
  excerpt,
  author,
  formattedDate,
  publishDateIso,
  featureImage,
  featureImageAlt,
  featureImageCredit,
  tags,
}) {
  return (
    <section className="relative isolate flex min-h-[45vh] items-end overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#08130a]" aria-hidden />
      {featureImage ? (
        <img
          src={featureImage}
          alt={featureImageAlt || title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-700" aria-hidden />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#08130a]/10 via-[#32610E]/75 to-[#041006]/95"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_62%)]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -top-48 right-[-15%] h-[32rem] w-[32rem] rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />
      <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-10" aria-hidden>
        <img src={WATERMARK_SRC} alt="" className="h-14 w-auto" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-20 sm:py-28">
        <span className="text-xs font-semibold uppercase tracking-[0.48em] text-emerald-100/90">
          NorthSide GTA Insights
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {excerpt && (
          <p className="mt-4 max-w-2xl text-lg text-emerald-50/95 sm:text-xl">
            {excerpt}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-emerald-100/90">
          {author && <span>By {author}</span>}
          {author && formattedDate && <span className="text-emerald-100/50">•</span>}
          {formattedDate && (
            <time dateTime={publishDateIso || entryDateTimeValue(formattedDate)}>{formattedDate}</time>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-emerald-200/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {featureImageCredit && (
          <p className="mt-10 text-xs uppercase tracking-[0.3em] text-emerald-100/70">
            {featureImageCredit}
          </p>
        )}
      </div>
    </section>
  );
}

function entryDateTimeValue(formattedDate) {
  const parsed = DateTime.fromFormat(formattedDate, "MMMM d, yyyy");
  if (parsed.isValid) {
    return parsed.toISODate();
  }
  return formattedDate;
}

function GallerySection({ items }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <div className="my-12 border-t border-emerald-100" aria-hidden />
      <h2 className="text-2xl font-semibold text-slate-900">Gallery</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <figure
            key={item.image}
            className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-emerald-900/10"
          >
            <img
              src={item.image}
              alt={item.alt || "Insight gallery image"}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            {(item.caption || item.alt) && (
              <figcaption className="px-4 py-3 text-sm text-slate-600">
                {item.caption || item.alt}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

function InsightCtaSection({ config, whatsappChannel, slug }) {
  const formRef = React.useRef(null);
  const whatsappHref = whatsappChannel?.href || "";
  const whatsappSubtitle =
    whatsappChannel?.badge || config.whatsappConciergeLabel || "Priority replies";

  const handleWhatsappClick = React.useCallback(() => {
    trackEvent("click_whatsapp", {
      route: `/insights/${slug}`,
      source: "insight_cta",
    });
  }, [slug]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#32610E] via-emerald-700 to-[#163d07]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_55%)]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 right-[-15%] h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
          Discover the NorthSide GTA with Finally Home Agents
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-50 ring-1 ring-slate-100">
            <SmartContactForm
              config={config}
              formRef={formRef}
              whatsappChannel={whatsappChannel}
            />
          </div>
          <div className="flex flex-col gap-4">
            <a
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-lg font-semibold text-emerald-800 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Explore NorthSideGTA.ca
            </a>
            <WhatsAppButton
              href={whatsappHref}
              onClick={handleWhatsappClick}
              label="Chat with Us on WhatsApp"
              subtitle={whatsappSubtitle}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
