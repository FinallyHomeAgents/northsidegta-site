// src/BuyingPowerPage.js
// Route: /what-my-home-buys
//
// Renders a full comparison from default state so the prerenderer emits real,
// crawlable HTML. No window/document access during render.

import React, { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import CommunityComplianceFooter from "./components/CommunityComplianceFooter";
import BuyingPowerLeadForm from "./components/BuyingPowerLeadForm";
import { trackBuyingPower } from "./lib/buyingPowerTracking";
import MARKET from "./data/marketData.v2.json";
import TOWNS_RAW from "./towns.json";

const SITE = "https://northsidegta.ca";
const PATH = "/what-my-home-buys";
const DEFAULT_VALUE = 1250000;
const MIN = 500000;
const MAX = 3000000;
const DIRECT_GO_RAIL_TOWNS = new Set([
  "aurora",
  "east-gwillimbury",
  "newmarket",
  "stouffville",
]);

// Local lifestyle trade-offs, separate from the monthly market figures.
const TRADEOFFS = {
  georgina:
    "Major urban amenities and Toronto are farther away, in exchange for lake access, space and value.",
  "east-gwillimbury":
    "Newer neighbourhoods continue to grow, and nearby shops and services vary by location.",
  newmarket:
    "Full-service amenities also bring more traffic and less of an escape-from-the-city feel.",
  aurora:
    "Its established setting and strong location generally come with a higher entry price.",
  stouffville:
    "Pricing can narrow the value advantage of moving north; compare the home types and locations you want.",
  uxbridge:
    "Land and outdoor access come with fewer big-city conveniences and a drive-focused location.",
  scugog:
    "Lake and small-town living can mean a longer trip to Toronto, depending on your destination.",
};

// Approximate each town mark's dominant colour; these can be adjusted by hand.
const TOWN_ACCENTS = {
  georgina: "#1D4B91",
  "east-gwillimbury": "#07599B",
  newmarket: "#183960",
  aurora: "#0B5599",
  stouffville: "#2352A5",
  uxbridge: "#008A4B",
  scugog: "#138ACA",
};

const cad = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);

const shortDelta = (n) => {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${a >= 1000 ? `${Math.round(a / 1000)}K` : Math.round(a)}`;
};

/** Build the town list once, from the two data files. */
function buildTowns() {
  return TOWNS_RAW.map((t) => {
    const m = MARKET.municipalities?.[t.slug];
    const all = m?.byType?.all || {};
    const goText = t.snapshot?.goTrainTime || "";
    const hoods = Array.isArray(t.neighbourhoods)
      ? t.neighbourhoods
          .map((h) => (typeof h === "string" ? h : h?.name))
          .filter(Boolean)
      : [];
    return {
      slug: t.slug,
      name: m?.name || t.name,
      avg: typeof all.avg === "number" ? all.avg : null,
      median: typeof all.median === "number" ? all.median : null,
      sales: all.sales ?? null,
      ldom: all.ldom ?? null,
      yoy: typeof all.yoy === "number" ? all.yoy : null,
      drive404: t.commute?.to404SteelesMinutes ?? null,
      goTrain: DIRECT_GO_RAIL_TOWNS.has(t.slug),
      goText,
      summary: t.summary || "",
      highlights: Array.isArray(t.highlights) ? t.highlights.slice(0, 3).map(text => text.replace("Top schools", "Schools & parks")) : [],
      highways: t.snapshot?.highways || "",
      transitSummary: t.snapshot?.transitSummary || "",
      hoods,
      tradeoff: TRADEOFFS[t.slug] || "",
      logo: `/assets/town-logos/${t.slug}.webp`,
      accent: TOWN_ACCENTS[t.slug],
      href: `/communities/${t.slug}`,
    };
  }).filter((t) => t.avg);
}

function band(ratio) {
  if (ratio < 0.8)
    return {
      tone: "over",
      head: "Below the local average",
      sub: "Your comparison amount is below the town-wide average; options may include smaller homes or properties needing work.",
    };
  if (ratio < 1.1)
    return {
      tone: "level",
      head: "Near the local average",
      sub: "Your comparison amount is near the town-wide average, with the result based on home type, location and condition.",
    };
  if (ratio < 1.5)
    return {
      tone: "good",
      head: "Comfortably above average",
      sub: "Your comparison amount is above the local average and may open up more size, lot or condition choices.",
    };
  if (ratio < 2.2)
    return {
      tone: "good",
      head: "Well above the local average",
      sub: "Your comparison amount reaches well above the local average, while individual home prices still depend on type, location and condition.",
    };
  return {
    tone: "good",
    head: "Above the local average",
    sub: "Your comparison amount reaches well into the upper end of the local market, but this does not establish a price ceiling or guarantee available properties.",
  };
}

const RULE = {
  good: "border-l-brand-green",
  level: "border-l-amber-600",
  over: "border-l-red-700",
};
const HEADTONE = {
  good: "text-brand-green",
  level: "text-amber-700",
  over: "text-red-700",
};

function Chip({ tone = "neutral", children }) {
  const map = {
    neutral: "bg-emerald-50 text-gray-700",
    good: "bg-emerald-100 text-brand-green",
    bad: "bg-red-50 text-red-700",
  };
  return (
    <span className={`${map[tone]} rounded-sm px-2 py-1 text-[11px] font-mono tabular-nums whitespace-nowrap`}>
      {children}
    </span>
  );
}

function transitLabel(town) {
  if (town.goTrain) return "GO rail + local transit";
  if (/GO Bus/i.test(town.transitSummary)) return "GO bus connection";
  if (/Durham Region Transit/i.test(town.transitSummary)) return "DRT + GO connection";
  return "Driving focused";
}

export default function BuyingPowerPage() {
  const towns = useMemo(buildTowns, []);
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [address, setAddress] = useState("");
  const [sort, setSort] = useState("power");
  const interacted = useRef(false);
  function updateValue(next, control) {
    setValue(next);
    if (!interacted.current) {
      interacted.current = true;
      trackBuyingPower("buyingpower_interaction", { control });
    }
  }

  const period = MARKET.monthly?.periodLabel || "";
  const source = MARKET.monthly?.source || "TRREB Market Watch";

  const ranked = useMemo(() => {
    const list = [...towns];
    if (sort === "power") list.sort((a, b) => value / b.avg - value / a.avg);
    if (sort === "commute") list.sort((a, b) => (a.drive404 ?? 99) - (b.drive404 ?? 99));
    if (sort === "price") list.sort((a, b) => a.avg - b.avg);
    return list;
  }, [towns, sort, value]);

  const cheapest = useMemo(() => [...towns].sort((a, b) => a.avg - b.avg), [towns]);
  const best = cheapest[0];
  const bestPct = best ? Math.round((value / best.avg - 1) * 100) : 0;

  const faqs = [
    {
      q: "How much more house can I get north of Toronto?",
      a: `In ${period}, average sale prices across the seven NorthSide GTA towns ranged from ${cad(
        cheapest[0].avg
      )} in ${cheapest[0].name} to ${cad(cheapest[cheapest.length - 1].avg)} in ${
        cheapest[cheapest.length - 1].name
      }. Source: ${source}.`,
    },
    {
      q: "Which NorthSide GTA towns are easiest for commuting?",
      a: "Aurora, Newmarket and East Gwillimbury combine Highway 404 access with Barrie Line GO rail. Stouffville has its own GO line and road access toward Markham, the 404 and 407. The right choice depends on whether your destination and schedule favour driving or transit; all drive estimates here are off-peak to Highway 404 and Steeles.",
    },
    {
      q: "Which towns are best if I want more land or a larger lot?",
      a: "Uxbridge, Scugog and Georgina generally offer the strongest mix of rural, estate and larger-lot possibilities. Availability and price vary significantly by neighbourhood, servicing, waterfront location and property condition.",
    },
    {
      q: "Which towns north of Toronto have GO train service?",
      a: `${towns.filter((t) => t.goTrain).map((t) => t.name).join(", ")} have local GO rail service. Georgina and Uxbridge have GO Bus connections toward rail, while Scugog has Durham Region Transit connections toward Whitby or Oshawa GO. Check current schedules for a specific trip.`,
    },
    {
      q: "Which towns feel more urban, and which feel more rural?",
      a: "Newmarket and Aurora offer the most complete urban-style amenities and established neighbourhoods. East Gwillimbury and Stouffville mix newer subdivisions with rural edges. Georgina, Uxbridge and Scugog lean further toward lake, trail, small-town and countryside lifestyles.",
    },
    {
      q: "Which NorthSide GTA town is the most affordable?",
      a: `${cheapest[0].name}, at an average sale price of ${cad(cheapest[0].avg)} in ${period}.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "What Your Home Buys Up North",
        url: `${SITE}${PATH}`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
        provider: {
          "@type": "RealEstateAgent",
          name: "Finally Home Agents",
          alternateName: "NorthSide GTA",
          url: SITE,
          parentOrganization: { "@type": "Organization", name: "HomeLife Optimum Realty, Brokerage" },
          areaServed: towns.map((t) => ({ "@type": "Place", name: t.name })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "What Your Home Buys Up North", item: `${SITE}${PATH}` },
        ],
      },
    ],
  };

  const captureCard = (
    <article key="capture" id="save-comparison" className="rounded border border-brand-green bg-emerald-100 p-[18px] sm:p-6 flex flex-col gap-3 scroll-mt-20">
      <p className="font-mono text-xs uppercase tracking-wider text-brand-green m-0">Keep your comparison</p>
      <h3 className="text-xl font-bold text-brand-green m-0">Explore now. Compare together later.</h3>
      <p className="text-sm text-gray-700 m-0">Get all seven town averages in one email to revisit or share with someone planning the move with you.</p>
      <BuyingPowerLeadForm type="comparison" value={value} towns={towns} />
    </article>
  );

  const cards = ranked.map((t, i) => {
    const ratio = value / t.avg;
    const b = band(ratio);
    const left = value - t.avg;
    const pct = Math.round((ratio - 1) * 100);
    return (
      <article
        key={t.slug}
        className={`relative rounded border border-gray-200 border-l-[3px] ${RULE[b.tone]} bg-white p-[18px] sm:p-6 flex flex-col gap-3.5 shadow-sm`}
      >
        <span className="absolute right-4 top-4 font-mono text-[11px] tracking-widest text-gray-400">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div>
          <div className="flex items-center gap-2 pr-8">
            <h3 className="m-0 text-xl font-bold tracking-tight">
              <a href={t.href} className="hover:underline">{t.name}</a>
            </h3>
            <span
              className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white ring-1"
              style={{ "--tw-ring-color": t.accent }}
            >
              <img
                src={t.logo}
                alt=""
                width={32}
                height={32}
                className="h-full w-full rounded-full object-contain p-0.5"
                loading="lazy"
              />
            </span>
          </div>
          <span className="mt-1 block font-mono text-[11px] uppercase tracking-wide text-gray-500">
            Avg {cad(t.avg)}
            {t.sales != null && ` · ${t.sales} sales`}
            {t.ldom != null && ` · ${t.ldom} days`}
          </span>
        </div>
        <div>
          <p className={`m-0 text-[22px] font-bold leading-tight tracking-tight ${HEADTONE[b.tone]}`}>{b.head}</p>
          <p className="mt-1.5 mb-0 text-sm text-gray-700">{b.sub}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone={left >= 0 ? "good" : "bad"}>{shortDelta(left)} vs average</Chip>
          <Chip tone={pct >= 0 ? "good" : "bad"}>{pct >= 0 ? "+" : ""}{pct}% vs average</Chip>
          {t.drive404 != null && <Chip>~{t.drive404} min to 404/Steeles</Chip>}
          <Chip tone={t.goTrain ? "good" : "neutral"}>{transitLabel(t)}</Chip>
          {t.yoy != null && (
            <span className="hidden min-[420px]:inline">
              <Chip tone={t.yoy >= 0 ? "bad" : "good"}>{t.yoy >= 0 ? "+" : ""}{t.yoy}% YoY</Chip>
            </span>
          )}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="m-0 mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.13em] text-gray-500">
            Why people choose it
          </p>
          <p className="m-0 text-[13.5px] font-medium leading-relaxed text-gray-700">
            {t.highlights.join(" · ")}
          </p>
          {t.summary && <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-gray-500">{t.summary}</p>}
        </div>
        {t.hoods.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            {t.median != null && (
              <>
                <p className="m-0 mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.13em] text-gray-500">
                  Median sale price
                </p>
                <p className="m-0 text-[13.5px] text-gray-700">
                  Midpoint of recorded sales: <strong>{cad(t.median)}</strong>
                </p>
              </>
            )}
            <p className={`m-0 text-[13px] text-gray-500 ${t.median != null ? "mt-1.5" : ""}`}>
              {t.hoods.join(" · ")}
            </p>
          </div>
        )}
        {t.tradeoff && (
          <div className="mt-auto border-t border-gray-100 pt-3">
            <p className="m-0 mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.13em] text-gray-500">
              What you give up
            </p>
            <p className="m-0 text-sm text-gray-500 leading-relaxed">{t.tradeoff}</p>
          </div>
        )}
      </article>
    );
  });

  const withCapture = [...cards];
  withCapture.splice(2, 0, captureCard);

  return (
    <>
      <Helmet>
        <title>What Does My Toronto Home Buy North of the City? | NorthSide GTA</title>
        <meta
          name="description"
          content={`Compare what your Toronto home could buy across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge and Scugog. ${period} TRREB figures, lifestyle, access and trade-offs.`}
        />
        <link rel="canonical" href={`${SITE}${PATH}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="What Does My Toronto Home Buy North of the City?" />
        <meta property="og:url" content={`${SITE}${PATH}`} />
        <meta property="og:description" content="One home value. Seven towns north of Toronto. Compare prices, lifestyle and trade-offs — free, with no signup required." />
        <meta property="og:image" content={`${SITE}/Images/seo/what-my-home-buys-og.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="What could your home buy north of Toronto? Compare seven NorthSide GTA towns." />
        <meta name="twitter:image" content={`${SITE}/Images/seo/what-my-home-buys-og.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <HeaderShell />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[1140px] px-4 sm:px-8 pb-24">
        <section className="pt-5 sm:pt-12 pb-4">
          <p className="mb-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-brand-green">
            NorthSide GTA · Finally Home Agents
          </p>
          <h1 className="m-0 max-w-[15ch] text-[26px] sm:text-5xl font-extrabold leading-[1.03] tracking-tight text-balance">
            What could your home buy <span className="text-brand-green">north of Toronto?</span>
          </h1>
          <p className="mt-2.5 sm:mt-5 max-w-[55ch] text-[15px] sm:text-lg text-gray-700">
            Enter what your current home is worth and compare that budget across seven NorthSide GTA
            communities — including prices, lifestyle, access and the trade-offs that matter.
          </p>

          <div className="mt-5 sm:mt-9 rounded border border-gray-200 bg-white p-[17px] sm:p-8 shadow-sm">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-[1fr_1fr]">
              <div>
                <label htmlFor="bp-val" className="mb-2 block text-[13px] font-semibold">
                  Your estimated home value
                </label>
                <div className="flex items-center gap-2 rounded border border-gray-200 bg-emerald-50/60 px-4 py-3">
                  <span className="text-2xl font-bold text-gray-400">$</span>
                  <input
                    id="bp-val"
                    inputMode="numeric"
                    value={value.toLocaleString("en-CA")}
                    onChange={(e) => {
                      const raw = Number(String(e.target.value).replace(/[^0-9]/g, "")) || 0;
                      updateValue(Math.min(MAX, Math.max(1, raw)), "amount");
                    }}
                    onBlur={() => setValue(Math.min(MAX, Math.max(MIN, value)))}
                    aria-label="Your home value"
                    className="min-h-[44px] w-full border-0 bg-transparent p-0 text-[27px] sm:text-4xl font-bold tabular-nums tracking-tight outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={10000}
                  value={Math.min(MAX, Math.max(MIN, value))}
                  onChange={(e) => updateValue(Number(e.target.value), "slider")}
                  aria-label="Adjust home value"
                  className="mt-4 w-full accent-[#32610E]"
                />
              </div>
              <div className="flex flex-col justify-center gap-3">
                <p className="m-0 text-sm text-gray-700">Compare all seven towns free. No address, email or phone number needed to explore.</p>
                <a href="#save-comparison" className="rounded bg-brand-green px-4 py-3 text-center font-bold text-white">Email me my comparison</a>
                <a href="#home-review" className="text-center text-sm font-semibold text-brand-green underline">Not sure what your home is worth?</a>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-600">Market data: {period} · {source} · All home types. This compares your estimate with town averages; it does not calculate your available purchase budget. Mortgage balances, selling costs, purchase taxes and moving costs are not deducted.</p>
          {best && (
            <div className="mt-3.5 sm:mt-5 flex flex-wrap items-baseline gap-2.5 rounded border border-brand-green bg-emerald-100 px-4 py-3.5">
              <span className="flex-none font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-green">
                Lowest average price
              </span>
              <span className="text-[17px] font-bold tracking-tight">{best.name}</span>
              <span className="w-full text-[13.5px] leading-snug text-gray-700">
                Your comparison amount is <strong>{Math.abs(bestPct)}% {bestPct >= 0 ? "above" : "below"}</strong> the average sale price here — a difference of {cad(Math.abs(value - best.avg))} before mortgage balances and transaction costs.
                {best.highlights[0] && ` ${best.highlights[0]} is one of the lifestyle draws.`}
              </span>
            </div>
          )}
        </section>

        <div className="mb-3.5 mt-6 sm:mt-14 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight">Compare {cad(value)} across seven towns</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["power", "Lowest average price"],
              ["commute", "Shortest drive to 404/Steeles"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setSort(key); trackBuyingPower("buyingpower_sort", { sort_order: key }); }}
                aria-pressed={sort === key}
                className={`min-h-[44px] sm:min-h-0 rounded-full border px-4 py-2 text-[13px] font-semibold ${
                  sort === key
                    ? "border-brand-green bg-brand-green text-white"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">{withCapture}</div>

        {/* ---------- static half: what Google and LLMs read ---------- */}
        <section className="mt-14 border-t-2 border-gray-900 pt-7">
          <h2 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight">
            NorthSide GTA house prices at a glance, {period}
          </h2>
          <div className="mt-5 rounded-r border-l-[3px] border-brand-green bg-emerald-100 px-5 py-5">
            <p className="m-0">
              <strong>
                In {period}, average home prices across the seven NorthSide GTA towns ranged from{" "}
                {cad(cheapest[0].avg)} in {cheapest[0].name} to {cad(cheapest[cheapest.length - 1].avg)} in{" "}
                {cheapest[cheapest.length - 1].name}
              </strong>{" "}
              — a spread of {cad(cheapest[cheapest.length - 1].avg - cheapest[0].avg)}. {cheapest[0].name} was
              the most affordable. Source: {source}.
            </p>
          </div>

          <p className="mt-5 max-w-[78ch] text-[15px] leading-relaxed text-gray-700">
            Price is only one part of the move. Aurora and Newmarket offer established, full-service centres;
            East Gwillimbury and Stouffville balance growing neighbourhoods with regional access; and Georgina,
            Uxbridge and Scugog trade a longer trip to Toronto for lake, trail, small-town or rural living.
            Highway 404 is a key route for York Region communities, while Highways 48, 7/7A, 12 and 407 help
            connect the eastern towns. GO rail, GO Bus, YRT and Durham Region Transit options vary by community.
          </p>

          <div className="mt-5 overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="w-full min-w-[660px] border-collapse">
              <caption className="sr-only">
                Average sale price by NorthSide GTA town, {period}
              </caption>
              <thead>
                <tr className="bg-gray-50">
                  {["Town", "Avg price", "Sales", "Days on market", "Year over year", "Drive to 404/Steeles", "Transit access"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`border-b border-gray-100 px-4 py-3 font-mono text-[10.5px] font-normal uppercase tracking-widest text-gray-500 ${
                          i === 0 ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {cheapest.map((t) => (
                  <tr key={t.slug}>
                    <td className="border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <a href={t.href} className="hover:underline">{t.name}</a>
                        <span
                          className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white ring-1"
                          style={{ "--tw-ring-color": t.accent }}
                        >
                          <img
                            src={t.logo}
                            alt=""
                            width={24}
                            height={24}
                            className="h-full w-full rounded-full object-contain p-0.5"
                            loading="lazy"
                          />
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{cad(t.avg)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{t.sales ?? "—"}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{t.ldom ?? "—"}</td>
                    <td className={`border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums ${t.yoy >= 0 ? "text-brand-green" : "text-red-700"}`}>
                      {t.yoy != null ? `${t.yoy >= 0 ? "+" : ""}${t.yoy}%` : "—"}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">
                      {t.drive404 != null ? `~${t.drive404} min` : "—"}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-xs">{transitLabel(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="m-0 text-base font-bold tracking-tight">{f.q}</h3>
                <p className="mt-1.5 mb-0 text-[15px] text-gray-700">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="home-review" className="mt-14 scroll-mt-20 rounded border border-gray-200 bg-white p-6 sm:p-9 shadow-sm">
          <h2 className="m-0 text-2xl font-bold tracking-tight">Start with your own home’s value.</h2>
          <p className="mt-2 mb-6 max-w-[60ch] text-[15px] text-gray-700">Town averages are a starting point. Share your address and Matthew or Landon will review nearby comparable sales and respond within 24 hours.</p>
          <div className="max-w-xl"><BuyingPowerLeadForm type="valuation" value={value} address={address} onAddressChange={setAddress} towns={towns} /></div>
        </section>

        <p className="mt-10 text-[13px] leading-relaxed text-gray-500">
          Figures are average sale prices across all home types from {source} and describe the market
          generally. They are not an appraisal, not an opinion of value for any particular property, and not a
          prediction of what any home will sell for. Commute times are off-peak driving estimates to Highway
          404 and Steeles Avenue.
        </p>
      </main>
      <CommunityComplianceFooter
        driveTimeSentence="Drive times on this page are off-peak estimates to Highway 404 and Steeles Avenue."
        marketDataSentence={`Average sold prices sourced from TRREB MLS® data and regional market reports (${period}).`}
      />
    </>
  );
}
