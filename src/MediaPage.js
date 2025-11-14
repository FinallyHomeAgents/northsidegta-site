import React, { useEffect, useRef, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import HeroPromo from "./components/socials/HeroPromo";
import IgEmbedCard from "./components/socials/IgEmbedCard";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import useInstagramEmbedFit from "./hooks/useInstagramEmbedFit";

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

function ensureInstagramScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ig-embed")) return;
  const s = document.createElement("script");
  s.id = "ig-embed";
  s.async = true;
  s.src = "https://www.instagram.com/embed.js";
  s.onload = () => {
    window.instgrm?.Embeds?.process?.();
  };
  document.body.appendChild(s);
}

function isVideoFile(url = "") {
  return /\.(mp4|webm)(\?|#|$)/i.test(url);
}

function FeaturedHeroCard({ item }) {
  const src =
    typeof item?.source_url === "string"
      ? item.source_url
      : typeof item?.url === "string"
        ? item.url
        : "";
  const title = item?.title?.trim?.() || "Featured NorthSide GTA reel";
  const captioned = Boolean(item?.captioned);
  const useLocalVideo = isVideoFile(src);
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const [muted, setMuted] = useState(true);
  const frameRef = useInstagramEmbedFit(!useLocalVideo, [src, hydrated]);

  useEffect(() => {
    if (!src || useLocalVideo) return;
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    ensureInstagramScript();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && window.instgrm?.Embeds && !hydrated) {
            window.instgrm.Embeds.process();
            setHydrated(true);
          }
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated, src, useLocalVideo]);

  useEffect(() => {
    if (!src || useLocalVideo) return;
    setHydrated(false);
  }, [src, useLocalVideo]);

  useEffect(() => {
    if (!useLocalVideo) return;
    setMuted(true);
  }, [src, useLocalVideo]);

  useEffect(() => {
    if (!useLocalVideo) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = muted;
    if (!muted) {
      const playPromise = videoEl.play();
      if (playPromise instanceof Promise) {
        playPromise.catch(() => {});
      }
    }
  }, [muted, useLocalVideo]);

  if (!src) return null;

  return (
    <div className="relative" role="group" aria-label={title}>
      <span className="mb-3 inline-flex items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-900">
        Featured reel
      </span>
      <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/80 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div ref={cardRef} className="relative">
          <div ref={frameRef} className="reel-frame">
            {useLocalVideo ? (
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  src={src}
                  poster={item?.poster_url || undefined}
                  autoPlay
                  muted={muted}
                  loop
                  playsInline
                  className="reel-media"
                  title={title}
                />
                <button
                  type="button"
                  onClick={() => setMuted((prev) => !prev)}
                  className="absolute bottom-4 right-4 z-10 rounded-full border border-white/30 bg-black/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-pressed={!muted}
                  aria-label={muted ? "Unmute featured reel" : "Mute featured reel"}
                >
                  {muted ? "Unmute" : "Mute"}
                </button>
              </div>
            ) : (
              <blockquote
                className="instagram-media reel-media"
                data-instgrm-permalink={src}
                data-instgrm-version="14"
                {...(captioned ? { "data-instgrm-captioned": "" } : {})}
                style={{ background: "#0a0a0a", margin: 0, minHeight: "100%" }}
              />
            )}
          </div>
        </div>
      </div>
      {item?.title && (
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
          {item.title}
        </p>
      )}
    </div>
  );
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
  const showHeroCard = heroEnabled && Boolean(settings?.pinned?.source_url);
  const hasItems = items.length > 0;
  const fallbackFeatured = heroEnabled && !showHeroCard && hasItems ? { ...items[0], source_url: items[0]?.url } : null;
  const heroFeatured = showHeroCard ? settings?.pinned : fallbackFeatured;
  const heroTitle = settings?.pinned?.title || "NorthSide GTA Videos + Reels";
  const heroTagline =
    settings?.pinned?.tagline ||
    "Quick looks at communities, listings, and life on the NorthSide GTA — in short videos and reels.";

  return (
    <>
      <DynamicMetaTags {...MEDIA_ROUTE_META} />
      <HeaderShell />
      <main className="relative min-h-screen bg-neutral-950 text-white">
        <section
          aria-label="Hero section showing a smartphone with Videos Reels on screen, representing NorthSide GTA real estate media content."
          className="relative"
        >
          <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 sm:pb-20 lg:pb-24 lg:pt-24">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/80">Media</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{heroTitle}</h1>
              {heroTagline && <p className="text-base text-neutral-200 sm:text-lg">{heroTagline}</p>}
            </div>

            {heroFeatured && (
              <div className="media-hero-visual relative mt-10">
                <figure className="mx-auto w-[88%] max-w-[40rem] overflow-hidden rounded-[2.25rem] border border-white/10 shadow-[0_40px_120px_rgba(7,15,20,0.55)] sm:w-[82%] lg:mx-0 lg:w-[68%] lg:max-w-[38rem]">
                  <img
                    className="h-auto w-full"
                    src="/uploads/videos-reels-hero-finally-home-agents-side2.jpg"
                    alt="Hand holding a smartphone showing the words Videos Reels with NorthSide GTA styling, against a blurred city background."
                  />
                </figure>
                <div className="mt-6 flex w-full items-center justify-center lg:absolute lg:right-10 lg:top-1/2 lg:mt-0 lg:w-[min(48%,24rem)] lg:-translate-y-1/2">
                  <FeaturedHeroCard item={heroFeatured} />
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.35em] text-white/60">All videos & reels</h2>
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
