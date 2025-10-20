import React from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import Footer from "./Footer";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";

const HOME_REVIEWS = CANONICAL_TESTIMONIALS.map((review) => ({
  id: review.id,
  name: review.shortName || review.name,
  rating: review.rating || 5,
  quote: review.quote,
  date: review.date,
}));

const HERO_PILLARS = [
  "Predictive pricing & offer strategy updated daily",
  "Concierge WhatsApp command centre with live agent + AI",
  "NorthSide GTA coverage from Aurora to Scugog",
];

const AI_FEATURES = [
  {
    title: "Predictive Seller Strategy Engine",
    description:
      "We feed NorthSide GTA sold data, live buyer sentiment, and neighbourhood velocity into an AI model that stress tests thousands of list-price and timing combinations before you ever hit the market.",
    bullets: [
      "Discover the pricing window that maximizes demand in your street grid.",
      "Generate AI staging briefs and photography shot lists tuned to buyer behaviour.",
      "Deploy smart remarketing to keep warm buyers circling your property.",
    ],
  },
  {
    title: "Buyer DNA Matching",
    description:
      "Share your wish list once. Our platform translates it into lifestyle signals, commute tolerances, and school priorities — then our agents curate listings and off-market intel that match the profile in real-time.",
    bullets: [
      "Instantly see the top 3 towns that fit budget, vibe, and travel rhythm.",
      "Tap into private seller conversations surfaced by our agent+AI duo.",
      "Get narrated walkthroughs and risk flags inside a single mobile feed.",
    ],
  },
  {
    title: "Market Pulse Dashboards",
    description:
      "From Holland Landing to Port Perry, track micro-trends as they happen. We blend MLS velocity, Google search lift, and school enrolment data so you can move before the headlines do.",
    bullets: [
      "Weekly AI briefs that forecast inventory five weeks out.",
      "Heatmaps showing where upgrade buyers are shifting next.",
      "Offer playbooks that adjust automatically as conditions change.",
    ],
  },
  {
    title: "Concierge Collaboration",
    description:
      "Every conversation lives in a secure workspace that blends human expertise with AI co-pilots. Think of it as your own NorthSide GTA mission control.",
    bullets: [
      "Voice-note translations into actionable task lists within minutes.",
      "Document autofill and compliance checks handled before you sign.",
      "Real-time milestone tracking for financing, inspections, and closes.",
    ],
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
        <TownHighlight />
        <AiFeatureSection />
        <ConciergeSection />
        <ReviewsSection />
      </main>

      <Footer />
    </div>
  );
}

function HomeHero() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.5),_transparent_60%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-24 left-[-12%] h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-15%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-900/20 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100">
              Finally Home Agents
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.8rem]">
              NorthSide GTA real estate, powered by human expertise and predictive AI.
            </h1>
            <p className="mt-5 text-base text-emerald-100 sm:text-lg md:text-xl">
              Your hero image is our interactive command centre — a live map experience that pairs concierge agents with machine intelligence so you can see where to buy, sell, or invest before the market catches up.
            </p>
            <div className="mt-6 space-y-3 text-sm text-emerald-100/90 sm:text-base">
              {HERO_PILLARS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-400/80 text-xs font-extrabold text-emerald-950">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-3 text-lg font-semibold text-emerald-900 shadow-xl shadow-emerald-900/30 transition hover:bg-emerald-50"
              >
                Book a Strategy Session
              </a>
              <a
                href="/homeanalysis"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-7 py-3 text-lg font-semibold text-white shadow-lg shadow-black/20 transition hover:border-white/60 hover:bg-white/20"
              >
                Unlock Your AI Home Report
              </a>
            </div>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-emerald-100/70">
              Aurora • Uxbridge • Georgina • Scugog • Stouffville • East Gwillimbury • Newmarket
            </p>
          </div>
          <div className="relative">
            <div className="rounded-[40px] border border-white/15 bg-white/5 p-4 shadow-[0_40px_80px_rgba(2,26,20,0.55)] backdrop-blur">
              <MapHero variant="immersive" />
            </div>
            <div className="pointer-events-none absolute -bottom-12 left-1/2 hidden w-[72%] -translate-x-1/2 rounded-3xl border border-emerald-200/20 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-emerald-900 shadow-xl shadow-emerald-900/20 md:block">
              Interactive NorthSide GTA intelligence updated live for buyers &amp; sellers.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TownHighlight() {
  return (
    <section className="relative z-10 -mt-16 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/60 sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-emerald-900 sm:text-3xl">
              See every NorthSide GTA community through an agent + AI lens.
            </h2>
            <p className="mt-4 text-base text-slate-700 sm:text-lg">
              Compare commute times, vibe scores, school stories, and lifestyle perks directly on the hero map above. When you are ready to go deeper, jump into the community strip below to explore hyperlocal guides.
            </p>
          </div>
          <div className="mt-8">
            <TownStrip />
          </div>
        </div>
      </div>
    </section>
  );
}

function AiFeatureSection() {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700"
        aria-hidden
      />
      <div className="pointer-events-none absolute left-[-20%] top-[-10%] h-[22rem] w-[22rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
            AI-Augmented Command
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Revolutionary service for NorthSide GTA buyers, sellers, and investors.
          </h2>
          <p className="mt-4 text-base text-emerald-100 sm:text-lg">
            We pair concierge agents with an intelligent co-pilot so you move faster, negotiate smarter, and feel confident at every milestone.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {AI_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{feature.title}</h3>
        <p className="mt-3 text-sm text-emerald-100 sm:text-base">{feature.description}</p>
      </div>
      <ul className="mt-6 space-y-2 text-sm text-emerald-50 sm:text-base">
        {feature.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-emerald-300/70 text-[10px] font-bold text-emerald-950">
              ★
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
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
              Concierge collaboration that feels like having a pro sports team in your corner.
            </h2>
            <p className="mt-4 text-base text-slate-700 sm:text-lg">
              Every conversation syncs between human agents and our AI command centre. Drop a voice note, upload a document, or send a late-night question — you will get context-aware replies with next steps faster than any portal can deliver.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 sm:text-base">
              {["Live WhatsApp concierge from 9am–9pm", "Smart checklists tuned to your transaction", "Priority alerts for pre-market listings", "Closing team aligned with your lender & lawyer"].map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Need answers right now?
              </p>
              <p className="mt-4 text-xl font-semibold text-emerald-900">
                Message us and an agent will respond within the hour (9am–9pm).
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
          Loved by NorthSide GTA buyers, sellers, and renters.
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 sm:text-base">
          Real Google reviews from clients who used our human + AI approach to move smarter across the NorthSide GTA.
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

