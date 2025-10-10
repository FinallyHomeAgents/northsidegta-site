
// src/HomePage.js
import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import Footer from "./Footer";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";

export default function HomePage() {
  const reviews = useMemo(
    () =>
      CANONICAL_TESTIMONIALS.map((review) => ({
        id: review.id,
        name: review.shortName || review.name,
        rating: review.rating || 5,
        quote: review.quote,
        date: review.date,
      })),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
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

        <meta property="og:title" content="NorthSide GTA | Real Estate Agents for Buyers & Sellers" />
        <meta
          property="og:description"
          content="Local team helping you buy and sell in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/" />
        <meta property="og:image" content="https://www.northsidegta.ca/Images/og-home.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NorthSide GTA | Real Estate Agents for Buyers & Sellers" />
        <meta
          name="twitter:description"
          content="Find your perfect home or sell for more in the NorthSide GTA with expert agents."
        />
        <meta name="twitter:image" content="https://www.northsidegta.ca/Images/og-home.jpg" />

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

      <main>
        <MapHero />

        <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:-mt-10 lg:-mt-16">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-5 shadow-xl shadow-emerald-900/5 backdrop-blur sm:p-8">
            <TownStrip />
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl px-4 text-center">
          <div className="space-y-3">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-100/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700">
              What clients are saying
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Google reviews from NorthSide GTA movers
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              Real feedback from families upgrading their lifestyle north of Toronto.
            </p>
          </div>
          <div className="mt-8">
            <ReviewsCarousel reviews={reviews} disclaimer="Real reviews from real clients." />
          </div>
        </section>

        <section className="relative mt-20 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[44px] border border-emerald-100/60 bg-emerald-950 text-white shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 opacity-95"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_60%)]"
                aria-hidden
              />
              <div className="pointer-events-none absolute -top-24 right-[-18%] h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute bottom-[-30%] left-[-12%] h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden />

              <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-2xl text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
                    Ready when you are
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Ready to explore the NorthSide GTA?
                  </h2>
                  <p className="mt-4 text-sm text-emerald-100/90 sm:text-base">
                    Compare towns, understand commute times, and uncover the neighbourhoods that fit your lifestyle with Finally Home Agents.
                  </p>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:mt-0 lg:items-center">
                  <a
                    href="/homeanalysis"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-50"
                  >
                    Get Your Home Analysis
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-white/20"
                  >
                    Talk to the team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
