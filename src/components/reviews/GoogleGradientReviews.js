import React, { useEffect, useState } from "react";

const REVIEWS = [
  {
    name: "Susan Booth",
    quote:
      "“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”",
  },
  {
    name: "Logan Abernethy",
    quote:
      "“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”",
  },
  {
    name: "Jessica Le",
    quote:
      "“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”",
  },
  {
    name: "Tessa Conway",
    quote:
      "“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”",
  },
  {
    name: "Olivia Oprea",
    quote:
      "“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”",
  },
  {
    name: "Arron Breen",
    quote:
      "“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”",
  },
];

export default function GoogleGradientReviews({ className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((x) => (x + 1) % REVIEWS.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative mx-auto max-w-2xl ${className}`}>
      <div
        className="pointer-events-none absolute -left-16 top-[-30%] h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl sm:-left-24 sm:h-56 sm:w-56"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-[-45%] h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl sm:-right-16 sm:h-64 sm:w-64"
        aria-hidden
      />

      <div className="relative rounded-[36px] bg-gradient-to-br from-emerald-300/70 via-emerald-400/50 to-emerald-600/60 p-[1.5px] shadow-[0_45px_120px_rgba(4,47,35,0.55)]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]"
            aria-hidden
          />

          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px]">
                ★★★★★ Google Reviews
              </span>
              <span className="hidden text-[11px] text-emerald-100/70 sm:inline">NorthSide GTA Buyers</span>
            </div>

            <div className="relative h-40 sm:h-36">
              {REVIEWS.map((review, i) => (
                <div
                  key={review.name}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-2 transition-opacity duration-700 ease-out ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/80">
                    <img src="/Images/google-logo.png" alt="Google" className="h-5 w-5" />
                    <span>Finally Home Agents</span>
                  </div>
                  <p className="max-w-xl text-sm text-emerald-100/90 sm:text-base">{review.quote}</p>
                  <p className="text-sm font-semibold text-white/90">— {review.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-100/60">Verified Client Review</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {REVIEWS.map((review, i) => (
                <span
                  key={review.name}
                  className={`h-1.5 w-6 rounded-full transition ${
                    i === index ? "bg-emerald-300" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
