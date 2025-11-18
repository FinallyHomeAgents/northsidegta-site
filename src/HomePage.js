import React, { useEffect, useMemo, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import Footer from "./Footer";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import DidYouKnowCard from "./components/DidYouKnowCard";
import { didYouKnowFacts } from "./components/DidYouKnowData";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

const HOME_ROUTE_META = getStaticRouteMeta("/") || {};

const HOME_REVIEWS = CANONICAL_TESTIMONIALS.map((review) => ({
  id: review.id,
  name: review.shortName || review.name,
  rating: review.rating || 5,
  quote: review.quote,
  date: review.date,
}));

// TODO: Replace with CMS-driven weekly town highlight.
const TRENDING_TOWN = {
  slug: "aurora",
  name: "Aurora",
  description: "Explore homes, lifestyle, and local highlights in Aurora.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderShell />
      <DynamicMetaTags {...HOME_ROUTE_META}>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: "Finally Home Agents",
            url: HOME_ROUTE_META.canonicalUrl || "https://northsidegta.ca/",
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
            name: HOME_ROUTE_META.title || "NorthSide GTA",
            url: HOME_ROUTE_META.canonicalUrl || "https://northsidegta.ca/",
            potentialAction: {
              "@type": "SearchAction",
              target: `${(HOME_ROUTE_META.canonicalUrl || "https://northsidegta.ca/").replace(/\/$/, "")}/search?q={query}`,
              "query-input": "required name=query",
            },
          })}
        </script>
      </DynamicMetaTags>

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.4),_transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-40%] right-[-15%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/25 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1900px] px-3 pb-12 pt-2 sm:px-5 sm:pt-3 lg:pt-4">
        <div className="relative">
          <div className="rounded-[56px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-[0_55px_110px_rgba(2,26,20,0.55)]">
            <div className="rounded-[52px] border border-white/15 bg-black/45 p-3 sm:p-4 shadow-[0_30px_80px_rgba(34,68,10,0.55)] backdrop-blur">
              <div className="rounded-[44px] border border-white/5 bg-black/25 p-2 sm:p-3">
                <div className="relative overflow-hidden rounded-[36px] border border-white/10">
                  <MapHero
                    variant="immersive"
                    showQuickContact
                    tickerSlot={<TownBridge className="flex h-full w-full flex-col" />}
                    afterTicker={
                      <DidYouKnowCard
                        facts={didYouKnowFacts}
                        rotateInterval={6500}
                        className="mx-auto w-full max-w-4xl"
                        variant="compact"
                      />
                    }
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

        <NorthSideThisWeek />

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
      className={`flex h-full flex-col gap-5 rounded-[28px] border border-white/12 bg-white/5 p-4 text-white shadow-[0_30px_70px_rgba(34,68,10,0.45)] backdrop-blur-sm sm:p-5 ${className}`}
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
        <TownStrip id="town-guides" />
      </div>
    </div>
  );
}

function NorthSideThisWeek() {
  const [polls, setPolls] = useState([]);
  const [latestInsight, setLatestInsight] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPolls = async () => {
      try {
        const response = await fetch("/api/tastehub/polls", { cache: "no-store" });
        if (!response.ok) throw new Error("Request failed");
        const payload = await response.json();
        if (cancelled) return;
        const entries = Array.isArray(payload?.polls) ? payload.polls : [];
        setPolls(entries);
      } catch (error) {
        if (!cancelled) setPolls([]);
      }
    };

    loadPolls();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInsights = async () => {
      try {
        const response = await fetch("/content/insights/index.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Request failed");
        const items = await response.json();
        if (cancelled) return;
        if (Array.isArray(items)) {
          const sorted = [...items].sort((a, b) => {
            const aDate = new Date(a.publishDate || 0).getTime();
            const bDate = new Date(b.publishDate || 0).getTime();
            return bDate - aDate;
          });
          setLatestInsight(sorted[0] || null);
        }
      } catch (error) {
        if (!cancelled) setLatestInsight(null);
      }
    };

    loadInsights();
    return () => {
      cancelled = true;
    };
  }, []);

  const trendingPoll = useMemo(() => {
    if (!polls.length) return null;
    const featured = polls.find((poll) => poll.featured);
    return featured || polls[0];
  }, [polls]);

  const cards = useMemo(
    () => [
      {
        label: "Trending Town",
        title: `People are checking out ${TRENDING_TOWN.name} this week.`,
        description: TRENDING_TOWN.description,
        href: `/communities/${TRENDING_TOWN.slug}`,
      },
      {
        label: "Trending on NorthSide TasteHub™",
        title: trendingPoll
          ? `Trending poll: ${trendingPoll.title}.`
          : "Trending poll: Best Pizza around the NorthSide.",
        description: "Vote or see live results on TasteHub.",
        href: trendingPoll ? `/tastehub/${trendingPoll.slug}` : "/tastehub",
      },
      {
        label: "Latest NorthSide Insight",
        title: latestInsight
          ? `Buyers are reading our latest Insight: ${latestInsight.title}.`
          : "Buyers are reading our latest Insight series.",
        description:
          latestInsight?.excerpt || "Get a deeper look at life and real estate in the NorthSide GTA.",
        href: latestInsight ? `/insights/${latestInsight.slug}` : "/insights",
      },
      {
        label: "Around the NorthSide",
        title: "Events happening around the NorthSide this week.",
        description: "See what’s going on in Uxbridge, Georgina, Stouffville and more.",
        href: "/community",
      },
    ],
    [latestInsight, trendingPoll],
  );

  return (
    <section className="mt-9">
      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.08),transparent_45%),linear-gradient(135deg,rgba(10,35,20,0.85),rgba(8,30,18,0.92))] shadow-[0_30px_90px_rgba(4,17,12,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-300/10" aria-hidden />
        <div className="pointer-events-none absolute -left-24 top-[-30%] h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 bottom-[-30%] h-56 w-56 rounded-full bg-emerald-200/15 blur-3xl" aria-hidden />

        <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-50">
                <span
                  className="relative inline-flex h-2.5 w-2.5 items-center justify-center"
                  style={{ animation: "pulseLive 2s ease-in-out infinite" }}
                  aria-hidden
                >
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300/70 blur-[0.5px]" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="text-emerald-100">Live in the NorthSide</span>
              </span>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">NorthSide This Week</h2>
                <p className="max-w-2xl text-sm text-emerald-50/90 sm:text-base">
                  A quick look at what people are exploring, reading, and talking about across the NorthSide GTA.
                </p>
              </div>
            </div>

            <a
              href="/about"
              className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-sm transition hover:border-white/35 hover:bg-white/10"
            >
              Meet Your NorthSide Agents <span aria-hidden className="ml-2 text-base">→</span>
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <a
                key={card.label}
                href={card.href}
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-4 text-left shadow-lg shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">
                    {card.label}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug text-white sm:text-[1.05rem]">{card.title}</h3>
                  <p className="text-sm text-emerald-50/85">{card.description}</p>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-emerald-100/90">
                  Open
                  <span aria-hidden className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DidYouKnowSection() {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
      <div className="pointer-events-none absolute left-[-18%] top-[-18%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12%] bottom-[-24%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(50,97,14,0.15),_transparent_70%)]" aria-hidden />

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
                  <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white">
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
                  className="inline-flex items-center justify-center rounded-xl bg-brand-green px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand-green/40 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
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

