import { useEffect } from "react";
import IgEmbedCard from "./IgEmbedCard";

function ensureInstagramScript() {
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
  useEffect(() => { ensureInstagramScript(); }, []);
  const src = pinned?.source_url || "";
  const useLocalVideo = isVideoFile(src);

  return (
    <section className="relative overflow-hidden">
      {/* Subtle brand glow behind hero section */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(1200px 600px at 50% -10%, rgba(50,97,14,0.35), transparent)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Text side */}
          <div className="pt-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {pinned?.title || "Videos + Reels"}
            </h1>
            {pinned?.tagline && (
              <p className="mt-3 max-w-xl text-neutral-300">{pinned.tagline}</p>
            )}
          </div>

          {/* Featured card side */}
          <div className="relative">
            {/* FEATURED pill */}
            <span
              className="absolute z-10 -top-3 left-4 bg-[#32610E]/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            >
              FEATURED
            </span>

            {/* Gradient frame + soft pulse glow + hover scale */}
            <div
              className="relative p-[3px] rounded-3xl bg-[linear-gradient(90deg,#32610E,rgba(99,166,20,0.9),#32610E)] ns-animate-pulse-slow transition-transform duration-300 ease-out hover:scale-[1.01]"
            >
              <div
                className="absolute -inset-4 -z-10 rounded-[28px] blur-2xl"
                style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(50,97,14,0.35), transparent)" }}
              />
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                {useLocalVideo ? (
                  <video
                    src={src}
                    poster={pinned?.poster_url || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IgEmbedCard
                    url={src}
                    captioned={!!pinned?.captioned}
                    showOverlay={false}  /* same player as grid, cleaner look for hero */
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
