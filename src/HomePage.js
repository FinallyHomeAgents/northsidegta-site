// src/HomePage.js
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import QuickContactCard from "./QuickContactCard";
import Footer from "./Footer";

/* ────────────────────────────────────────────────────────────
   Google-style rotating review slider
   ──────────────────────────────────────────────────────────── */
function ReviewSlider() {
  const reviews = [
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

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-emerald-100/40 ring-1 ring-slate-100 backdrop-blur">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"
        aria-hidden
      />
      <div className="relative px-6 py-10 sm:px-12 sm:py-12 min-h-[220px] sm:min-h-[200px]">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <img
                src="/Images/google-logo.png"
                alt="Google"
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain drop-shadow-sm"
              />
              <span className="font-semibold text-xs sm:text-sm text-slate-700 whitespace-nowrap">
                Finally&nbsp;Home&nbsp;Agents
              </span>
              <div className="flex text-amber-400 text-xs sm:text-sm leading-none drop-shadow">
                {"★★★★★".split("").map((_, s) => (
                  <span key={s}>★</span>
                ))}
              </div>
            </div>
            <p className="max-w-xs text-sm italic text-slate-700 sm:max-w-md sm:text-base">{r.quote}</p>
            <p className="mt-2 text-xs font-semibold text-slate-900 sm:text-sm">— {r.name}</p>
            <p className="text-[10px] text-slate-400 sm:text-xs">
              Verified&nbsp;Client&nbsp;Review
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Helmet>
        <title>NorthSide GTA | Real Estate Agents for Buyers & Sellers</title>
        <meta
          name="description"
          content="Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog."
        />
        <meta
          name="keywords"
          content="NorthSide GTA real estate, homes for sale North GTA, sell my home, Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, Scugog, Finally Home Agents"
        />
        <link rel="canonical" href="https://www.northsidegta.ca/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="NorthSide GTA | Real Estate Agents for Buyers & Sellers"
        />
        <meta
          property="og:description"
          content="Local team helping you buy and sell in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/" />
        <meta
          property="og:image"
          content="https://www.northsidegta.ca/Images/og-home.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog"
        />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="NorthSide GTA | Real Estate Agents for Buyers & Sellers"
        />
        <meta
          name="twitter:description"
          content="Find your perfect home or sell for more in the NorthSide GTA with expert agents."
        />
        <meta
          name="twitter:image"
          content="https://www.northsidegta.ca/Images/og-home.jpg"
        />

        {/* JSON-LD: Organization + Website */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: "Finally Home Agents",
            url: "https://www.northsidegta.ca/",
            areaServed: [
              "Georgina",
              "East Gwillimbury",
              "Newmarket",
              "Aurora",
              "Whitchurch-Stouffville",
              "Uxbridge",
              "Scugog",
            ],
            sameAs: [
              "https://instagram.com/finallyhomeagents",
              "https://facebook.com/finallyhomeagents",
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NorthSide GTA",
            url: "https://www.northsidegta.ca/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.northsidegta.ca/search?q={query}",
              "query-input": "required name=query",
            },
          })}
        </script>
      </Helmet>

      {/* Navigation */}
      <Navigation />

      <main className="flex-1">
        {/* Map-first Hero */}
        <section className="relative isolate overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-emerald-50/40 to-transparent"
            aria-hidden
          />
          <MapHero />
        </section>

        {/* Town Strip */}
        <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4">
          <div className="rounded-3xl bg-white/90 p-4 shadow-xl shadow-emerald-100/40 ring-1 ring-emerald-100/70 backdrop-blur">
            <TownStrip />
          </div>
        </section>

        {/* Google Review Slider */}
        <section className="relative mt-20 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              What clients are saying
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Google reviews from NorthSide GTA buyers & sellers
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Genuine feedback shared by families we’ve helped move north of the city.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <ReviewSlider />
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative mt-24 px-4">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 py-16 shadow-2xl sm:px-12">
            <div className="absolute -top-24 -right-12 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-teal-400/30 blur-3xl" aria-hidden />
            <div className="relative mx-auto max-w-3xl text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
                Ready when you are
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to explore the NorthSide GTA?
              </h2>
              <p className="mt-4 text-lg text-emerald-50/90">
                Let us help you compare towns, understand pricing, and line up the perfect move.
              </p>
              <a
                href="/homeanalysis"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Get Your Home Analysis
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
