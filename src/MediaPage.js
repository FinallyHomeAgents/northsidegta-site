import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import HeroPromo from "./components/socials/HeroPromo";
import IgEmbedCard from "./components/socials/IgEmbedCard";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

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

const MEDIA_ROUTE_META = getStaticRouteMeta("/media") || {};

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
  const showHeroCard = heroEnabled && Boolean(settings?.pinned?.source_url);
  const hasItems = items.length > 0;

  return (
    <>
      <DynamicMetaTags {...MEDIA_ROUTE_META} />
      <Navigation />
      <main className="relative min-h-screen bg-neutral-950 text-white">
        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-10">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(1200px 600px at 50% -10%, rgba(50,97,14,0.35), transparent)" }}
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {settings?.pinned?.title || "Videos + Reels"}
            </h1>
            {settings?.pinned?.tagline && (
              <p className="mt-3 text-neutral-300">{settings?.pinned?.tagline}</p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          {showHeroCard || hasItems ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showHeroCard && <HeroPromo pinned={settings?.pinned} />}
              {items.map((item, index) => (
                <IgEmbedCard
                  key={`${item.url}-${index}`}
                  url={item.url}
                  title={item.title}
                  captioned={Boolean(item.captioned)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 text-neutral-300">
              No items yet — paste Instagram links in CMS → Socials → Media Links.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
