import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import Footer from "./Footer";
import HeroPromo from "./components/socials/HeroPromo";
import IgEmbedCard from "./components/socials/IgEmbedCard";

function normalize(items = []) {
  const filtered = items.filter((item) => item && item.published !== false && item.url);
  return filtered.sort((a, b) => {
    const pinDelta = (b?.pin ? 1 : 0) - (a?.pin ? 1 : 0);
    if (pinDelta !== 0) return pinDelta;

    const aDate = a?.date ? new Date(a.date).getTime() : 0;
    const bDate = b?.date ? new Date(b.date).getTime() : 0;
    return bDate - aDate;
  });
}

export default function MediaPage() {
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [settingsRes, itemsRes] = await Promise.all([
          fetch("/content/socials-settings.json", { cache: "no-store" }),
          fetch("/content/socials.json", { cache: "no-store" }),
        ]);

        if (!settingsRes.ok) throw new Error(`Settings request failed (HTTP ${settingsRes.status})`);
        if (!itemsRes.ok) throw new Error(`Media list request failed (HTTP ${itemsRes.status})`);

        const [settingsJson, listJson] = await Promise.all([settingsRes.json(), itemsRes.json()]);

        if (!isMounted) return;
        setSettings(settingsJson);
        setItems(normalize(listJson?.items || []));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroEnabled = settings?.pinned?.enabled !== false;

  return (
    <>
      <Helmet>
        <title>Videos + Reels — NorthSide GTA &amp; Finally Home Agents</title>
        <meta
          name="description"
          content="Watch our latest NorthSide GTA and Finally Home Agents videos and Instagram Reels — listings, community, and brand stories."
        />
        <meta property="og:title" content="Videos + Reels — NorthSide GTA &amp; Finally Home Agents" />
        <meta
          property="og:description"
          content="Watch our latest NorthSide GTA and Finally Home Agents videos and Instagram Reels — listings, community, and brand stories."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/uploads/hero-poster.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.northsidegta.ca/media" />
      </Helmet>
      <Navigation />
      <main className="relative min-h-screen bg-neutral-950 text-white">
        {heroEnabled && <HeroPromo pinned={settings?.pinned} />}

        <div className="mx-auto max-w-6xl px-6">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 text-neutral-300">
              No items yet — paste Instagram links in CMS → Socials → Media Links.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <IgEmbedCard
                  key={`${item.url}-${index}`}
                  url={item.url}
                  title={item.title}
                  captioned={Boolean(item.captioned)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
