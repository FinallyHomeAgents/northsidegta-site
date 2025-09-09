// src/CuratedPage.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function useCurated(slug) {
  const [page, setPage] = React.useState(null);
  const [err, setErr] = React.useState(null);
  React.useEffect(() => {
    let ignore = false;
    fetch(`/data/collections/${slug}.json`, { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error(`Missing JSON for ${slug}`);
        return r.json();
      })
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

  const site = window.location.origin; // e.g. https://northsidegta.ca
  const ogImage = page.heroImage?.startsWith("/")
    ? `${site}${page.heroImage}`
    : page.heroImage || "";

  return (
    <>
      <Helmet>
        <title>{page.title} • NorthSide GTA</title>
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="description" content={page.intro || page.title} />
      </Helmet>

      <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 20px" }}>
        <h1 style={{ marginBottom: 12 }}>{page.title}</h1>
        {page.intro && <p style={{ fontSize: 18 }}>{page.intro}</p>}

        {page.heroImage && (
          <div style={{ margin: "24px 0" }}>
            <img
              src={page.heroImage}
              alt={page.title}
              style={{ width: "100%", borderRadius: 12 }}
            />
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Link to={`/lead/${page.slug}`}>
            <button style={{ padding: "12px 18px", fontWeight: 600 }}>
              Show me the listings
            </button>
          </Link>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            You’ll enter your info and we’ll email you the listings link.
          </p>
        </div>
      </main>
    </>
  );
}