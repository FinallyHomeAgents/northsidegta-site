// src/CuratedPage.js
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LeadForm from "./components/LeadForm";

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

const HERO_BACKGROUND = "/Images/northside-map.svg";
const DEFAULT_SUBHEADLINE =
  "Bigger lots, more value, and less traffic — get the listings now.";

export default function CuratedPage() {
  const { slug } = useParams();
  const { page, err } = useCurated(slug);

  if (err) return <main style={{maxWidth:960,margin:"40px auto"}}>Not found.</main>;
  if (!page) return <main style={{maxWidth:960,margin:"40px auto"}}>Loading…</main>;

  const heroImage = typeof page.heroImage === "string" ? page.heroImage.trim() : page.heroImage;
  const heroImageSrc = heroImage ? heroImage : HERO_BACKGROUND;
  const site = typeof window !== "undefined" ? window.location.origin : "";
  const ogImage = heroImageSrc.startsWith("/") ? `${site}${heroImageSrc}` : heroImageSrc;

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
  const seoDescription =
    (typeof page.seoDescription === "string" && page.seoDescription.trim()) || subheadline;

  const redirectTopic =
    (typeof page.slug === "string" && page.slug.trim()) ||
    (typeof slug === "string" && slug.trim()) ||
    headline;
  const redirectUrl = `/thank-you?topic=${encodeURIComponent(redirectTopic)}`;

  const showWhatsappFooter = Boolean(page.showWhatsappLink && page.whatsappUrl);
  const whatsappHref = typeof page.whatsappUrl === "string" ? page.whatsappUrl.trim() : "";

  return (
    <>
      <Helmet>
        <title>{headline} • NorthSide GTA</title>
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div style={layout.page}>
        <main style={layout.main}>
          <div style={layout.headingGroup}>
            <h1 style={layout.headline}>{headline}</h1>
            {subheadline && <p style={layout.subheadline}>{subheadline}</p>}
          </div>
          <div style={layout.formWrap}>
            <LeadForm
              slug={(typeof page.slug === "string" && page.slug.trim()) || slug}
              title={headline}
              realmLink={page.realmLink}
              ctaText={ctaText}
              onSuccessRedirect={redirectUrl}
            />
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "min(12vh, 120px) 20px 60px",
  },
  headingGroup: {
    textAlign: "center",
    maxWidth: 720,
    marginBottom: 32,
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
    layout.headingGroup.marginBottom = 28;
    layout.headline.fontSize = 30;
    layout.subheadline.fontSize = 16;
  }
}