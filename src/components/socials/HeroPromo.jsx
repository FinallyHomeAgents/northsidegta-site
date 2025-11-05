import { useEffect, useRef, useState } from "react";

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

export default function HeroPromo({ pinned }) {
  const src = pinned?.source_url?.trim() || "";
  const useLocalVideo = isVideoFile(src);
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const [muted, setMuted] = useState(true);

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

  const captioned = Boolean(pinned?.captioned);

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
    <div className="relative">
      <span className="absolute z-10 -top-3 left-4 bg-[#32610E]/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
        FEATURED
      </span>

      <div className="relative p-[3px] rounded-3xl bg-[linear-gradient(90deg,#32610E,rgba(99,166,20,0.9),#32610E)] ns-animate-pulse-slow transition-transform duration-300 ease-out hover:scale-[1.01]">
        <div
          className="absolute -inset-4 -z-10 rounded-[28px] blur-2xl"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(50,97,14,0.35), transparent)" }}
        />

        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        >
          {useLocalVideo ? (
            <>
              <video
                ref={videoRef}
                src={src}
                poster={pinned?.poster_url || undefined}
                autoPlay
                muted={muted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setMuted((prev) => !prev)}
                className="absolute bottom-3 right-3 z-10 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-pressed={!muted}
                aria-label={muted ? "Unmute featured video" : "Mute featured video"}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            </>
          ) : (
            <blockquote
              className="instagram-media w-full"
              data-instgrm-permalink={src}
              data-instgrm-version="14"
              {...(captioned ? { "data-instgrm-captioned": "" } : {})}
              style={{ background: "#0a0a0a", margin: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
