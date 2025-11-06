import React from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import Footer from "./Footer";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import DidYouKnowCard from "./components/DidYouKnowCard";
import { didYouKnowFacts } from "./components/DidYouKnowData";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";

const HOME_REVIEWS = CANONICAL_TESTIMONIALS.map((review) => ({
  id: review.id,
  name: review.shortName || review.name,
  rating: review.rating || 5,
  quote: review.quote,
  date: review.date,
}));

const HERO_STATS = [
  {
    label: "Aurora Avg. Sale Price",
    value: "$1.29",
    suffix: "M",
    description: "TRREB Oct 2023 detached average across Aurora.",
  },
  {
    label: "North District DOM",
    value: "21",
    suffix: "days",
    description: "Median time on market over the past 30 days (MLS®).",
  },
  {
    label: "Union Station Commute",
    value: "38",
    suffix: "min",
    description: "GO Express from Newmarket to Union Station at 7:10 a.m.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <Helmet>
        <title>NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers</title>
        <meta
          name="description"
          content="Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge &amp; Scugog."
        />
        <meta
          name="keywords"
          content="NorthSide GTA real estate, homes for sale North GTA, sell my home, Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, Scugog, Finally Home Agents"
        />
        <link rel="canonical" href="https://www.northsidegta.ca/" />
        <meta
          property="og:title"
          content="NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers"
        />
        <meta
          property="og:description"
          content="Local team helping you buy and sell in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge &amp; Scugog."
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
        <meta
          name="twitter:title"
          content="NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers"
        />
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
        <HomeHero />
        <ConciergeSection />
        <ReviewsSection />
      </main>

      <Footer />
    </div>
  );
}

function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#04110c] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-40%] right-[-15%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/25 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1900px] px-3 pb-12 pt-2 sm:px-5 sm:pt-3 lg:pt-4">
        <div className="relative">
          <div className="rounded-[56px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-[0_55px_110px_rgba(2,26,20,0.55)]">
            <div className="rounded-[52px] border border-white/15 bg-black/45 p-3 sm:p-4 shadow-[0_30px_80px_rgba(4,47,35,0.55)] backdrop-blur">
              <div className="rounded-[44px] border border-white/5 bg-black/25 p-2 sm:p-3">
                <div className="relative overflow-hidden rounded-[36px] border border-white/10">
                  <MapHero
                    variant="immersive"
                    showQuickContact
                    tickerSlot={
                      <DidYouKnowCard
                        facts={didYouKnowFacts}
                        rotateInterval={6500}
                        className="h-full w-full"
                        variant="heroTicker"
                      />
                    }
                    afterTicker={<TownBridge />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
            NorthSide GTA • Finally Home Agents
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
            Explore the NorthSide GTA through our live command centre.
          </h1>
          <p className="mt-4 text-base text-emerald-100/90 sm:text-lg">
            Tap into the same interactive map we use every day to guide moves from Aurora to Scugog.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left shadow-lg shadow-black/20 backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/80">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-1 text-2xl font-semibold text-white">
                <span>{stat.value}</span>
                {stat.suffix ? <span className="text-base text-emerald-100/90">{stat.suffix}</span> : null}
              </div>
              <p className="mt-2 text-xs text-emerald-100/80">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/contact"
            className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-white px-7 py-3 text-base font-semibold text-emerald-900 shadow-xl shadow-emerald-900/30 transition hover:bg-emerald-50"
          >
            Book a Strategy Session
          </a>
          <a
            href="/homeanalysis"
            className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-black/30 transition hover:border-white/70 hover:bg-white/20"
          >
            Open the Home Analysis
          </a>
        </div>

        <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-emerald-100/70">
          Aurora • Uxbridge • Georgina • Scugog • Stouffville • East Gwillimbury • Newmarket
        </p>
      </div>
    </section>
  );
}

function TownBridge({ className = "" }) {
  return (
    <div
      className={`flex h-full flex-col gap-5 rounded-[28px] border border-white/12 bg-white/5 p-4 text-white shadow-[0_30px_70px_rgba(4,47,35,0.45)] backdrop-blur-sm sm:p-5 ${className}`}
    >
      <div className="space-y-2 text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
          Town Rail
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
          Jump straight into the towns we serve every day.
        </h2>
        <p className="text-sm text-emerald-100/85 sm:max-w-2xl">
          Browse Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog spotlights without leaving the hero map.
        </p>
      </div>
      <div className="w-full">
        <TownStrip />
      </div>
    </div>
  );
}

function DidYouKnowSection() {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
      <div className="pointer-events-none absolute left-[-18%] top-[-18%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12%] bottom-[-24%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_70%)]" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
            NorthSide GTA Facts
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Real stories from the towns behind our hero map.
          </h2>
          <p className="mt-4 text-base text-emerald-100/90 sm:text-lg">
            These rotating spotlights surface live from communities across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.
          </p>
        </div>

        <DidYouKnowCard
          facts={didYouKnowFacts}
          rotateInterval={6500}
          className="mx-auto mt-12 w-full max-w-5xl"
        />
      </div>
    </section>
  );
}

function ConciergeSection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-100/80 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-10 rounded-[32px] border border-emerald-200 bg-white/80 p-6 shadow-2xl shadow-emerald-100/70 backdrop-blur-sm md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:p-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-emerald-900 sm:text-3xl">
              Humans + automation ready the moment you reach out.
            </h2>
            <p className="mt-4 text-base text-slate-700 sm:text-lg">
              Drop a note from the map, text us, or upload paperwork — our concierge stitches it together and keeps you moving.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 sm:text-base">
              {["WhatsApp desk 9am–9pm", "Checklists that adjust as you progress", "Pre-market pings for your saved towns", "Closing team synced with lender + lawyer"].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 shadow-sm">
                  <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-white/90 p-4 shadow-xl shadow-emerald-200/60">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Need answers right now?</p>
              <p className="mt-4 text-xl font-semibold text-emerald-900">
                Message us and an agent will respond inside the hour.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-800"
                >
                  Start the Conversation
                </a>
                <a
                  href="https://wa.me/16476684646"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-white px-5 py-3 text-base font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-900"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Concierge
                </a>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.28em] text-emerald-500">
                Finally Home Agents • HomeLife Optimum Realty Brokerage
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  if (HOME_REVIEWS.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center text-2xl font-semibold text-emerald-900 sm:text-3xl">
          What NorthSide GTA movers say about working with us.
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 sm:text-base">
          Direct Google reviews from buyers, sellers, and renters we’ve guided across the region.
        </p>
        <div className="mt-10">
          <ReviewsCarousel
            reviews={HOME_REVIEWS}
            disclaimer="Real reviews from real clients."
          />
        </div>
      </div>
    </section>
  );
}

