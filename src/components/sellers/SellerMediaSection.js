import React from "react";
import Card from "../ui/Card";

const videos = [
  {
    title: "Queensville Showcase: 472 Seaview Heights",
    community: "Queensville · East Gwillimbury",
    strategy: "Family-home positioning with a polished walkthrough designed to make scale, flow, and neighbourhood feel easy to understand.",
    embed: "https://listings.wylieford.com/videos/01922f3a-c66a-7001-83e7-0e7fb17543bb",
  },
  {
    title: "Golf Course Estate: 42 Wyndance Way",
    community: "Uxbridge · Estate property",
    strategy: "Land and lifestyle emphasis for a property where setting, privacy, and destination value are central to the story.",
    embed: "https://player.vimeo.com/video/832255969",
  },
];

export default function SellerMediaSection({ heading = "How We Present Homes to the Market" }) {
  if (!videos.length) return null;
  const [featured, ...supporting] = videos;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,118,110,0.14)] backdrop-blur md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-emerald-100/60"
        aria-hidden
      />
      <div className="relative z-10 space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Our Listing Work</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{heading}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            Strong marketing does more than make a home look attractive. It helps buyers understand the property,
            feel its scale and setting, and remember it clearly when they’re comparing options. Every property has a
            different story — and the presentation should reflect that.
          </p>
        </div>

        <Card className="overflow-hidden border border-emerald-200/70 bg-white p-0 shadow-lg backdrop-blur">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={featured.embed}
              title={featured.title}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">{featured.community}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{featured.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{featured.strategy}</p>
          </div>
        </Card>

        {supporting.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {supporting.map((v) => (
              <Card
                key={v.title}
                className="overflow-hidden border border-emerald-200/70 bg-white/90 p-0 shadow-sm backdrop-blur transition hover:border-emerald-300"
              >
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={v.embed}
                    title={v.title}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">{v.community}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{v.strategy}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
