import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";

function ensureInstagramScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ig-embed")) return;
  const s = document.createElement("script");
  s.id = "ig-embed";
  s.async = true;
  s.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(s);
}

function isVideoFile(url = "") {
  return /\.(mp4|webm)(\?|#|$)/i.test(url);
}

export default function HeroPromo({ pinned }) {
  const [open, setOpen] = useState(false);
  const src = pinned?.source_url || "";
  const useLocalVideo = isVideoFile(src);

  useEffect(() => {
    ensureInstagramScript();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (open && !useLocalVideo && window.instgrm?.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, [open, useLocalVideo]);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(1200px 600px at 50% -10%, rgba(50,97,14,0.35), transparent)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {pinned?.title || "Videos + Reels"}
            </h1>
            {pinned?.tagline && <p className="mt-3 max-w-xl text-neutral-300">{pinned.tagline}</p>}
            {!useLocalVideo && src && (
              <button
                onClick={() => setOpen(true)}
                className="mt-6 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
              >
                Play promo
              </button>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            {useLocalVideo ? (
              <video
                src={src}
                poster={pinned?.poster_url || undefined}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative aspect-video bg-black">
                {pinned?.poster_url && (
                  <img src={pinned.poster_url} alt="Promo" className="h-full w-full object-cover opacity-90" />
                )}
                <button
                  onClick={() => setOpen(true)}
                  className="absolute inset-0 m-auto h-14 w-36 rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Play promo"
                >
                  ▶ Play
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        {src ? (
          isVideoFile(src) ? (
            <video src={src} controls playsInline className="h-full w-full object-contain" />
          ) : (
            <blockquote
              className="instagram-media w-full"
              data-instgrm-permalink={src}
              data-instgrm-version="14"
              {...(pinned?.captioned ? { "data-instgrm-captioned": "" } : {})}
              style={{ background: "#0a0a0a", margin: 0 }}
            />
          )
        ) : (
          <div className="p-6 text-white">No pinned source provided.</div>
        )}
      </Modal>
    </section>
  );
}
