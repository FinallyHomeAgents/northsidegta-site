// src/BuyingPowerPage.js
// Route: /what-my-home-buys
//
// Renders a full comparison from default state so the prerenderer emits real,
// crawlable HTML. No window/document access during render.

import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import CommunityComplianceFooter from "./components/CommunityComplianceFooter";
import MARKET from "./data/marketData.v2.json";
import TOWNS_RAW from "./towns.json";

const SITE = "https://northsidegta.ca";
const PATH = "/what-my-home-buys";
const DEFAULT_VALUE = 1250000;
const MIN = 500000;
const MAX = 3000000;

/* ------------------------------------------------------------------ *
 * Editorial: the honest drawback for each town.
 * Matthew / Landon — these are the highest-risk sentences on the page
 * and the most valuable. Rewrite them in your own words before launch.
 * ------------------------------------------------------------------ */
const TRADEOFFS = {
  georgina:
    "No GO station. Every commute starts with a drive to East Gwillimbury or a long bus.",
  "east-gwillimbury":
    "Still filling in. Newest housing stock of the seven, but the amenities are behind the building.",
  newmarket:
    "The busiest of the seven. Every amenity, and the traffic that comes with them.",
  aurora:
    "You pay a premium for the schools and the established feel — and much of the stock needs updating.",
  stouffville:
    "Priciest of the seven and rising while others fall. One rail line, running less often than Barrie.",
  uxbridge:
    "No GO station and the second-longest drive to the 404. Countryside over convenience.",
  scugog:
    "The furthest out. No GO station, and a Toronto commute realistically means a car every day.",
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
      goTrain: Boolean(goText) && !/bus/i.test(goText),
      goText,
      hoods,
      tradeoff: TRADEOFFS[t.slug] || "",
      href: `/communities/${t.slug}`,
    };
  }).filter((t) => t.avg);
}

function band(ratio) {
  if (ratio < 0.8)
    return {
      tone: "over",
      head: "Below the average home",
      sub: "You'd be looking at condos, townhomes, or a detached that needs work.",
    };
  if (ratio < 1.1)
    return {
      tone: "level",
      head: "Right at the market",
      sub: "A typical detached in an established pocket. No stretch, no surplus.",
    };
  if (ratio < 1.5)
    return {
      tone: "good",
      head: "Comfortably above average",
      sub: "Larger detached, a better lot, or a newer build — with room to negotiate.",
    };
  if (ratio < 2.2)
    return {
      tone: "good",
      head: "Well above the market",
      sub: "Premium neighbourhoods, big lots, or an executive home outright.",
    };
  return {
    tone: "good",
    head: "Top of the market",
    sub: "Estate lots, waterfront, or a custom build — the best this town has.",
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

export default function BuyingPowerPage() {
  const towns = useMemo(buildTowns, []);
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [address, setAddress] = useState("");
  const [sort, setSort] = useState("power");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const formspreeId = (process.env.REACT_APP_FORMSPREE_ID || "").trim();
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
  const best = ranked[0];
  const bestPct = best ? Math.round((value / best.avg - 1) * 100) : 0;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!formspreeId) {
      setError("Form is not configured yet. Add REACT_APP_FORMSPREE_ID to your environment.");
      return;
    }
    const fd = new FormData(e.target);
    if (fd.get("nickname")) return; // honeypot

    setBusy(true);
    try {
      const payload = Object.fromEntries(fd.entries());
      payload.address = address || payload.address || "";
      payload.estimatedValue = cad(value);
      payload.topMatch = best ? best.name : "";
      payload.marketPeriod = period;
      payload.sourcePage = PATH;

      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.[0]?.message || `Request failed (${res.status})`);
      }
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "buyingpower_submit" });
        if (window.fbq) window.fbq("trackCustom", "BuyingPowerSubmit");
      } catch (_) {}
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again or call us directly.");
    } finally {
      setBusy(false);
    }
  }

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
      q: "Which towns north of Toronto have a GO train station?",
      a: `${towns.filter((t) => t.goTrain).map((t) => t.name).join(", ")} are served by GO train. ${towns
        .filter((t) => !t.goTrain)
        .map((t) => t.name)
        .join(", ")} are not — commuting from those towns means driving or a connecting bus.`,
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
    <article
      key="capture"
      id="capture"
      className="rounded border border-brand-green bg-emerald-100 p-[18px] sm:p-6 flex flex-col gap-3 scroll-mt-20"
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-brand-green m-0">
        Unlock the accurate version
      </p>
      <h3 className="text-lg font-bold text-brand-green m-0 leading-snug">
        These are town averages. Yours will differ.
      </h3>
      <p className="text-sm text-gray-700 m-0 leading-relaxed">
        Give us your details and we&apos;ll rerun this against your own neighbourhood&apos;s sales — plus a
        real opinion of value on your home, back to you within 24 hours.
      </p>
      {sent ? (
        <p className="text-sm font-semibold text-brand-green m-0">
          Got it. Matthew or Landon will be in touch within 24 hours.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            aria-label="Your name"
            className="w-full rounded border border-gray-200 bg-white px-3 py-3 text-sm min-h-[48px]"
          />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            aria-label="Email"
            className="w-full rounded border border-gray-200 bg-white px-3 py-3 text-sm min-h-[48px]"
          />
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone (optional)"
            aria-label="Phone, optional"
            className="w-full rounded border border-gray-200 bg-white px-3 py-3 text-sm min-h-[48px]"
          />
          <input name="nickname" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <label className="flex gap-2.5 items-start text-[12.5px] text-gray-700 leading-snug cursor-pointer">
            <input type="checkbox" name="notUnderContract" className="mt-0.5 h-[22px] w-[22px] flex-none accent-[#32610E]" />
            <span>Not currently under a representation agreement with another brokerage.</span>
          </label>
          <label className="flex gap-2.5 items-start text-[12.5px] text-gray-700 leading-snug cursor-pointer">
            <input type="checkbox" name="marketingConsent" className="mt-0.5 h-[22px] w-[22px] flex-none accent-[#32610E]" />
            <span>Also send me the monthly NorthSide numbers. I can unsubscribe any time.</span>
          </label>
          {error && <p className="text-[13px] text-red-700 m-0">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="min-h-[52px] w-full rounded bg-brand-green px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send my real numbers"}
          </button>
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-gray-500 m-0">
            No spam. No pressure. Reply within 24 hrs.
          </p>
        </form>
      )}
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
          <h3 className="m-0 pr-8 text-xl font-bold tracking-tight">
            <a href={t.href} className="hover:underline">{t.name}</a>
          </h3>
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
          <Chip tone={pct >= 0 ? "good" : "bad"}>{pct >= 0 ? "+" : ""}{pct}% buying power</Chip>
          {t.drive404 != null && <Chip>{t.drive404} min to 404</Chip>}
          <Chip tone={t.goTrain ? "good" : "bad"}>{t.goTrain ? "GO train" : "No GO train"}</Chip>
          {t.yoy != null && (
            <span className="hidden min-[420px]:inline">
              <Chip tone={t.yoy >= 0 ? "bad" : "good"}>{t.yoy >= 0 ? "+" : ""}{t.yoy}% YoY</Chip>
            </span>
          )}
        </div>
        {t.hoods.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="m-0 mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.13em] text-gray-500">
              Entry point
            </p>
            {t.median ? (
              <p className="m-0 text-[13.5px] text-gray-700">
                Half of sales under <strong>{cad(t.median)}</strong>
              </p>
            ) : (
              <span className="inline-block rounded-sm bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] text-amber-800">
                Community data pending
              </span>
            )}
            <p className="m-0 mt-1.5 text-[13px] text-gray-500">{t.hoods.join(" · ")}</p>
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
          content={`Compare what your Toronto home is worth against average prices in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge and Scugog. ${period} TRREB figures, plus the commute and the trade-offs.`}
        />
        <link rel="canonical" href={`${SITE}${PATH}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="What Does My Toronto Home Buy North of the City?" />
        <meta property="og:url" content={`${SITE}${PATH}`} />
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
            Your Toronto home is worth <span className="text-brand-green">more house</span> up here.
          </h1>
          <p className="mt-2.5 sm:mt-5 max-w-[55ch] text-[15px] sm:text-lg text-gray-700">
            Enter what your place is worth. We&apos;ll show you what it buys in each of the seven towns
            north of the city
            <span className="hidden sm:inline"> — including the parts nobody tells you</span>.
          </p>

          <div className="mt-5 sm:mt-9 rounded border border-gray-200 bg-white p-[17px] sm:p-8 shadow-sm">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-[1.25fr_1fr]">
              <div>
                <label htmlFor="bp-addr" className="mb-2 block text-[13px] font-semibold">
                  Your current address
                </label>
                <input
                  id="bp-addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  placeholder="e.g. 42 Wineva Ave, Toronto"
                  className="min-h-[52px] w-full rounded border border-gray-200 bg-emerald-50/60 px-4 py-3.5 text-base font-semibold"
                />
                <span className="mt-1.5 block font-mono text-[10.5px] leading-snug text-gray-500">
                  Lets us use your neighbourhood&apos;s real sales, not a city-wide average.
                </span>
              </div>
              <div>
                <label htmlFor="bp-val" className="mb-2 block text-[13px] font-semibold">
                  What&apos;s it worth today?
                </label>
                <div className="flex items-center gap-2 rounded border border-gray-200 bg-emerald-50/60 px-4 py-3">
                  <span className="text-2xl font-bold text-gray-400">$</span>
                  <input
                    id="bp-val"
                    inputMode="numeric"
                    value={value.toLocaleString("en-CA")}
                    onChange={(e) => {
                      const raw = Number(String(e.target.value).replace(/[^0-9]/g, "")) || 0;
                      setValue(Math.min(MAX, Math.max(1, raw)));
                    }}
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
                  onChange={(e) => setValue(Number(e.target.value))}
                  aria-label="Adjust home value"
                  className="mt-4 w-full accent-[#32610E]"
                />
              </div>
            </div>
          </div>

          {best && (
            <div className="mt-3.5 sm:mt-5 flex flex-wrap items-baseline gap-2.5 rounded border border-brand-green bg-emerald-100 px-4 py-3.5">
              <span className="flex-none font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-green">
                Best value
              </span>
              <span className="text-[17px] font-bold tracking-tight">{best.name}</span>
              <span className="w-full text-[13.5px] leading-snug text-gray-700">
                {bestPct >= 0 ? (
                  <>
                    Your money goes <strong>{bestPct}% further</strong> than the average home there — about{" "}
                    {shortDelta(value - best.avg).replace("+", "")} left over.
                  </>
                ) : (
                  <>
                    The average home there is <strong>{Math.abs(bestPct)}% above</strong> your number.
                  </>
                )}
                {!best.goTrain && " No GO train, though."}
              </span>
            </div>
          )}
        </section>

        <div className="mb-3.5 mt-6 sm:mt-14 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight">What {cad(value)} buys you</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["power", "Most house"],
              ["commute", "Shortest commute"],
              ["price", "Cheapest first"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
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

          <div className="mt-5 overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="w-full min-w-[660px] border-collapse">
              <caption className="sr-only">
                Average sale price by NorthSide GTA town, {period}
              </caption>
              <thead>
                <tr className="bg-gray-50">
                  {["Town", "Avg price", "Sales", "Days on market", "Year over year", "Drive to 404", "GO train"].map(
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
                      <a href={t.href} className="hover:underline">{t.name}</a>
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{cad(t.avg)}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{t.sales ?? "—"}</td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">{t.ldom ?? "—"}</td>
                    <td className={`border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums ${t.yoy >= 0 ? "text-brand-green" : "text-red-700"}`}>
                      {t.yoy != null ? `${t.yoy >= 0 ? "+" : ""}${t.yoy}%` : "—"}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm tabular-nums">
                      {t.drive404 != null ? `${t.drive404} min` : "—"}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-right font-mono text-sm">{t.goTrain ? "Yes" : "No"}</td>
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

        {/* ---------- repeat form ---------- */}
        <section className="mt-14 rounded border border-gray-200 bg-white p-6 sm:p-9 shadow-sm">
          <h2 className="m-0 text-2xl font-bold tracking-tight">Want your actual numbers?</h2>
          <p className="mt-2 mb-6 max-w-[52ch] text-[15px] text-gray-700">
            Everything above uses town-wide averages. Send us your address and we&apos;ll rerun it against your
            own neighbourhood&apos;s sales, with a written opinion of value on your home within 24 hours.
          </p>
          {sent ? (
            <p className="m-0 font-semibold text-brand-green">
              Got it. Matthew or Landon will be in touch within 24 hours.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="grid max-w-2xl gap-3 sm:grid-cols-2">
              <input name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name"
                className="min-h-[48px] rounded border border-gray-200 bg-emerald-50/60 px-3 py-3 text-sm" />
              <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email"
                className="min-h-[48px] rounded border border-gray-200 bg-emerald-50/60 px-3 py-3 text-sm" />
              <input name="address" value={address} onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address" placeholder="Your address" aria-label="Your address"
                className="min-h-[48px] rounded border border-gray-200 bg-emerald-50/60 px-3 py-3 text-sm" />
              <input name="phone" type="tel" autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone, optional"
                className="min-h-[48px] rounded border border-gray-200 bg-emerald-50/60 px-3 py-3 text-sm" />
              <input name="nickname" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="flex gap-2.5 items-start text-[13px] text-gray-700 sm:col-span-2 cursor-pointer">
                <input type="checkbox" name="notUnderContract" className="mt-0.5 h-[22px] w-[22px] flex-none accent-[#32610E]" />
                <span>I&apos;m not currently under a representation agreement with another brokerage.</span>
              </label>
              <label className="flex gap-2.5 items-start text-[13px] text-gray-700 sm:col-span-2 cursor-pointer">
                <input type="checkbox" name="marketingConsent" className="mt-0.5 h-[22px] w-[22px] flex-none accent-[#32610E]" />
                <span>Email me the monthly NorthSide GTA numbers. I can unsubscribe any time.</span>
              </label>
              {error && <p className="m-0 text-[13px] text-red-700 sm:col-span-2">{error}</p>}
              <button type="submit" disabled={busy}
                className="min-h-[52px] rounded bg-brand-green px-6 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2">
                {busy ? "Sending…" : "Send me my real numbers"}
              </button>
            </form>
          )}
        </section>

        <p className="mt-10 text-[13px] leading-relaxed text-gray-500">
          Figures are average sale prices across all home types from {source} and describe the market
          generally. They are not an appraisal, not an opinion of value for any particular property, and not a
          prediction of what any home will sell for. Commute times are off-peak driving estimates to Highway
          404 and Steeles Avenue.
        </p>
      </main>
      <CommunityComplianceFooter />
    </>
  );
}
