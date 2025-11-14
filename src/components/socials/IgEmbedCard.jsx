import React, { useEffect, useRef, useState } from "react";
import useInstagramEmbedFit from "../../hooks/useInstagramEmbedFit";
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

export default function IgEmbedCard({ url, title, captioned = false, showOverlay = true }) {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const cardRef = useRef(null);
  const frameRef = useInstagramEmbedFit(true, [url, hydrated, open]);
  const modalFrameRef = useInstagramEmbedFit(open, [url, hydrated, open]);

  useEffect(() => {
    ensureInstagramScript();
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const io = new IntersectionObserver(
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

    io.observe(el);
    return () => io.disconnect();
  }, [hydrated]);

  useEffect(() => {
    if (open && window.instgrm?.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, [open]);

  return (
    <>
      <article
        ref={cardRef}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10">
          <div
            className="absolute -inset-1 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-2xl"
            style={{
              background: "radial-gradient(60% 60% at 50% 50%, rgba(50,97,14,0.35), transparent)",
            }}
          />
        </div>

        <div className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.01]">
          <div ref={frameRef} className="reel-frame">
            <blockquote
              className="instagram-media reel-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              {...(captioned ? { "data-instgrm-captioned": "" } : {})}
              style={{ background: "#0a0a0a", margin: 0, minHeight: "100%" }}
            />
          </div>
        </div>

        {showOverlay && (
          <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
            {title && (
              <div className="pointer-events-auto inline-block rounded-xl bg-black/50 px-3 py-1 text-white text-xs backdrop-blur">
                {title}
              </div>
            )}
            <button
              onClick={() => setOpen(true)}
              className="pointer-events-auto ml-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-white text-xs hover:bg-white/20"
            >
              Open
            </button>
          </div>
        )}
      </article>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div ref={modalFrameRef} className="reel-frame">
          <blockquote
            className="instagram-media reel-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            {...(captioned ? { "data-instgrm-captioned": "" } : {})}
            style={{ background: "#0a0a0a", margin: 0, minHeight: "100%" }}
          />
        </div>
      </Modal>
    </>
  );
}
