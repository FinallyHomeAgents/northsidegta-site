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

export default function CuratedPage() {
  const { slug } = useParams();
  const { page, err } = useCurated(slug);

  if (err) return <main style={{maxWidth:960,margin:"40px auto"}}>Not found.</main>;
  if (!page) return <main style={{maxWidth:960,margin:"40px auto"}}>Loading…</main>;

  const site = typeof window !== "undefined" ? window.location.origin : "";
  const ogImage = page.heroImage?.startsWith("/") ? `${site}${page.heroImage}` : page.heroImage || "";

  const hasHighlights = Array.isArray(page.highlights) && page.highlights.length > 0;

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
        <div style={hero.media}>
          <img
            src={page.heroImage || "/og-home.jpg"}
            alt="Curated collection hero"
            style={hero.image}
          />
        </div>
        <div style={hero.overlay} />
        <div style={hero.inner}>
          <h1 style={hero.title}>{page.title}</h1>
          {page.intro && <p style={hero.sub}>{page.intro}</p>}
          <p style={hero.trust}>🔒 We’ll email you the private link. No spam.</p>
        </div>
      </section>

      {/* CONTENT */}
      <main style={content.wrap}>
        <div style={content.left}>
          {hasHighlights && (
            <section style={highlights.section} aria-label="Highlights">
              <div style={highlights.inner}>
                <h2 style={highlights.heading}>Highlights</h2>
                <div style={highlights.list}>
                  {page.highlights.map((item, idx) => {
                    const icon =
                      typeof item?.icon === "string" && item.icon.trim() ? item.icon.trim() : "✨";
                    const title =
                      typeof item?.headline === "string" && item.headline.trim()
                        ? item.headline.trim()
                        : `Highlight ${idx + 1}`;
                    const copy =
                      typeof item?.supporting === "string" && item.supporting.trim()
                        ? item.supporting.trim()
                        : "";
                    const divider = idx !== page.highlights.length - 1 ? highlights.divider : null;
                    return (
                      <div key={`${title}-${idx}`} style={{ ...highlights.item, ...divider }}>
                        <div aria-hidden="true" style={highlights.icon}>{icon}</div>
                        <div style={highlights.textWrap}>
                          <p style={highlights.title}>{title}</p>
                          {copy && <p style={highlights.copy}>{copy}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
        <div style={content.right}>
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
  },
  media: { position: "absolute", inset: 0, overflow: "hidden" },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    filter: "saturate(.95)",
  },
  overlay: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55))" },
  inner: { position: "relative", maxWidth: 1080, margin: "0 auto", padding: "60px 20px" },
  title: { color: "#fff", fontSize: 36, lineHeight: 1.1, margin: 0 },
  sub: { color: "rgba(255,255,255,.92)", fontSize: 18, marginTop: 8, maxWidth: 720 },
  trust: { color: "rgba(255,255,255,.85)", fontSize: 13, marginTop: 14 },
};

const content = {
  wrap: {
    maxWidth: 1080,
    margin: "32px auto 64px",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 420px",
    gap: 32,
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  right: { position: "relative" },
};

const highlights = {
  section: {
    position: "relative",
    borderRadius: 28,
    background: "linear-gradient(145deg, rgba(252,252,253,0.96), rgba(239,243,249,0.94))",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    overflow: "hidden",
  },
  inner: {
    padding: "32px 32px 20px",
  },
  heading: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "#0f172a",
  },
  list: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "40px 1fr",
    alignItems: "start",
    gap: 18,
    padding: "18px 0",
  },
  divider: {
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },
  icon: {
    fontSize: 28,
    lineHeight: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "-0.01em",
  },
  copy: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: "#475569",
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

// Mobile stack
if (typeof window !== "undefined") {
  const mq = window.matchMedia("(max-width: 860px)");
  if (mq.matches) {
    content.wrap.gridTemplateColumns = "1fr";
    content.wrap.gap = 28;
    content.left.gap = 24;
    highlights.inner.padding = "28px 24px 18px";
    highlights.item.gridTemplateColumns = "32px 1fr";
  }
}