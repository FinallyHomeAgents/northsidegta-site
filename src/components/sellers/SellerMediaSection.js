import React from "react";
import Card from "../ui/Card";

const videos = [
  {
    title: "Queensville Showcase: 472 Seaview Heights",
    embed: "https://listings.wylieford.com/videos/01922f3a-c66a-7001-83e7-0e7fb17543bb",
  },
  {
    title: "Golf Course Estate in Uxbridge – 42 Wyndance Way",
    embed: "https://player.vimeo.com/video/832255969",
  },
];

export default function SellerMediaSection({ heading = "Our Listings in Action" }) {
  if (!videos.length) return null;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,118,110,0.14)] backdrop-blur md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-emerald-100/60"
        aria-hidden
      />
      <div className="relative z-10 space-y-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-slate-900">{heading}</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            See examples of the media and marketing approach we bring to homes across the NorthSide GTA.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {videos.map((v, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border border-emerald-200/70 bg-white/90 p-0 shadow-lg backdrop-blur transition hover:border-emerald-300"
            >
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={v.embed}
                  title={v.title}
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="px-5 py-5 text-lg font-semibold text-slate-900">{v.title}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
