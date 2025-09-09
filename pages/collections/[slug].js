// pages/collections/[slug].js
import Head from "next/head";
import Link from "next/link";
import { getAllSlugs, getPageBySlug } from "../../lib/collections";

export default function Curated({ page }) {
  if (!page) return <div>Not found</div>;

  const ogBase = process.env.NEXT_PUBLIC_SITE_URL || "";
  const ogImage =
    page.heroImage?.startsWith("/") ? `${ogBase}${page.heroImage}` : page.heroImage || "";

  return (
    <>
      <Head>
        <title>{page.title} • NorthSide GTA</title>
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="description" content={page.intro || page.title} />
      </Head>

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
          <Link href={`/lead/${page.slug}`}>
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

export async function getStaticPaths() {
  const slugs = getAllSlugs();
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const page = getPageBySlug(params.slug);
  return { props: { page } };
}