// src/CuratedPage.js
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LeadForm from "./components/LeadForm";

const HERO_BACKGROUND = "/Images/northside-map.svg";
const MEDIA_RATIO = "66.6667%"; // 3:2

function useResponsiveColumns(query = "(max-width: 860px)") {
  const [isSingleColumn, setIsSingleColumn] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia(query);
    const handler = (event) => setIsSingleColumn(event.matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(handler);
    }

    setIsSingleColumn(mq.matches);

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handler);
      } else if (typeof mq.removeListener === "function") {
        mq.removeListener(handler);
      }
    };
  }, [query]);

  return isSingleColumn;
}

function MediaCard({ image, title }) {
  const hasImage = Boolean(image);
  const alt = title ? `Featured listings preview for ${title}` : "Featured listings preview";

  return (
    <div style={mediaCard.frame}>
      <div style={mediaCard.aspectBox}>
        {hasImage ? (
          <img src={image} alt={alt} style={mediaCard.image} />
        ) : (
          <div style={mediaCard.placeholder} aria-hidden="true">
            <span style={mediaCard.placeholderLabel}>Curated homes map</span>
          </div>
        )}
      </div>
    </div>
  );
}

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

export default function CuratedPage() {
  const { slug } = useParams();
  const { page, err } = useCurated(slug);
  const isSingleColumn = useResponsiveColumns();

  if (err) return <main style={{ maxWidth: 960, margin: "40px auto" }}>Not found.</main>;
  if (!page) return <main style={{ maxWidth: 960, margin: "40px auto" }}>Loading…</main>;

  const site = typeof window !== "undefined" ? window.location.origin : "";
  const ogImage = page.heroImage?.startsWith("/") ? `${site}${page.heroImage}` : page.heroImage || "";

  const contentWrapStyle = React.useMemo(
    () => ({
      ...content.wrap,
      gridTemplateColumns: isSingleColumn ? "minmax(0, 1fr)" : content.wrap.gridTemplateColumns,
      gap: isSingleColumn ? 20 : content.wrap.gap,
    }),
    [isSingleColumn]
  );

  return (
    <>
      <Helmet>
        <title>{page.title} • NorthSide GTA</title>
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="description" content={page.intro || page.title} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* HERO */}
      <section style={hero.wrap}>
        <div style={hero.overlay} />
        <div style={hero.inner}>
          <h1 style={hero.title}>{page.title}</h1>
          {page.intro && <p style={hero.sub}>{page.intro}</p>}
          <p style={hero.trust}>🔒 We’ll email you the private link. No spam.</p>
        </div>
      </section>

      {/* CONTENT */}
      <main style={contentWrapStyle}>
        <div style={content.left}>
          {/* empty on purpose—single-focus page; if you want bullets, place them here */}
        </div>
        <div style={content.right}>
          <MediaCard image={page.heroImage} title={page.title} />
          <LeadForm slug={page.slug} title={page.title} realmLink={page.realmLink} />
          <div style={disclosure.box}>
            <strong>Matthew Mulhall</strong> — Real Estate Agent — HomeLife Optimum Realty — Finally Home Agents
          </div>
        </div>
      </main>
    </>
  );
}

const hero = {
  wrap: {
    position: "relative",
    display: "grid",
    alignItems: "end",
    height: "min(65vh, clamp(280px, 55vw, 520px))",
    overflow: "hidden",
    backgroundImage: `url(${HERO_BACKGROUND})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  overlay: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55))" },
  inner: { position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "60px 20px" },
  title: { color: "#fff", fontSize: 36, lineHeight: 1.1, margin: 0 },
  sub: { color: "rgba(255,255,255,.92)", fontSize: 18, marginTop: 8, maxWidth: 720 },
  trust: { color: "rgba(255,255,255,.85)", fontSize: 13, marginTop: 14 },
};

const content = {
  wrap: {
    maxWidth: 1080,
    margin: "24px auto 48px",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 420px",
    gap: 28,
  },
  left: { minHeight: 1 },
  right: { position: "relative" },
};

const mediaCard = {
  frame: {
    marginBottom: 24,
    borderRadius: 16,
    border: "1px solid #e5e5e5",
    overflow: "hidden",
    background: "#f8f8f8",
  },
  aspectBox: {
    position: "relative",
    width: "100%",
    paddingBottom: MEDIA_RATIO,
    background: "#f0f2f5",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  placeholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(229,231,235,0.95))",
  },
  placeholderLabel: {
    padding: "0 12px",
    border: "1px dashed rgba(107,114,128,0.6)",
    borderRadius: 999,
    fontWeight: 600,
    letterSpacing: 1,
  },
};

const disclosure = {
  box: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.8,
    background: "#f7f7f7",
    border: "1px solid #eee",
    padding: "10px 12px",
    borderRadius: 8,
  },
};
