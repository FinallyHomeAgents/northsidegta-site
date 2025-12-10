import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import TownHeroSpotlight from "./TownHeroSpotlight";
import TownLiveStrip from "./TownLiveStrip";
import { useTownSpotlightData } from "./useTownSpotlightData";

const DEFAULT_TASTEHUB_IMAGE = "/seo/tastehub-default-poll-share.jpg";

function normalizeTasteHubPoll(poll) {
  if (!poll) return null;

  const title = poll?.title ? String(poll.title).trim() : "";
  const town = poll?.town ? String(poll.town).trim() : "";
  const description = poll?.description ? String(poll.description).trim() : "";
  const image = poll?.image ? String(poll.image).trim() : DEFAULT_TASTEHUB_IMAGE;
  const category = poll?.category || "";
  const customCategory = poll?.customCategory || poll?.custom_category || "";

  return {
    slug: poll?.slug || "",
    title,
    town,
    description,
    image,
    displayCategory: customCategory || category,
    status: String(poll?.status || "draft").toLowerCase(),
  };
}

function TasteHubMiniCard({ poll }) {
  if (!poll) return null;

  const href = poll.slug ? `/tastehub/${poll.slug}` : "/tastehub";
  const townLabel = poll.town ? poll.town.toUpperCase() : "TASTEHUB";
  const categoryLabel = poll.displayCategory || "TasteHub poll";

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <img
          src={poll.image}
          alt={`${poll.title || "TasteHub poll"} feature art`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/90">
          {townLabel} • {categoryLabel}
        </p>
        <h3 className="mt-2 text-base font-semibold leading-snug text-emerald-950">
          {poll.title || "NorthSide TasteHub poll"}
        </h3>
        {poll.description && (
          <p className="mt-2 text-sm text-emerald-800/80">
            {poll.description}
          </p>
        )}
        <span className="mt-auto pt-4 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
          Vote or see results →
        </span>
      </div>
    </Link>
  );
}

function TasteHubTownSection({ townName }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPolls = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/tastehub/polls", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load TasteHub polls");
        }
        const payload = await response.json();
        const normalized = Array.isArray(payload?.polls)
          ? payload.polls.map(normalizeTasteHubPoll).filter(Boolean)
          : [];

        if (!cancelled) {
          setPolls(normalized);
        }
      } catch (error) {
        console.warn("[TownPageLayout] unable to load TasteHub polls", error);
        if (!cancelled) {
          setPolls([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPolls();
    return () => {
      cancelled = true;
    };
  }, []);

  const townKey = (townName || "").toLowerCase();

  const townPolls = useMemo(() => {
    return polls
      .filter((poll) => poll.status === "live" && poll.town.toLowerCase() === townKey)
      .slice(0, 3);
  }, [polls, townKey]);

  const hasPolls = townPolls.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <style>{`
        @keyframes tastehubLivePulse {
          0% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.65);
          }
          70% {
            box-shadow: 0 0 0 7px rgba(52, 211, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
        }
      `}</style>

      <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/90 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 text-emerald-950">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">NorthSide TasteHub™</p>
            <h2 className="text-2xl font-bold leading-tight">Local Favourites in {townName}</h2>
            <p className="max-w-3xl text-sm text-emerald-900/80 md:text-[15px]">
              See which spots locals are loving in {townName} and cast your vote on NorthSide TasteHub™.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-[tastehubLivePulse_1.8s_ease-out_infinite] rounded-full bg-emerald-400/60" aria-hidden />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            LIVE
          </div>
        </div>

        <div className="mt-6">
          {hasPolls ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {townPolls.map((poll) => (
                <TasteHubMiniCard key={poll.slug || poll.title} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-white/85 p-5 text-emerald-900 shadow-sm">
              <p className="text-sm font-semibold text-emerald-900">TasteHub polls for {townName} are coming soon.</p>
              <p className="mt-2 text-sm text-emerald-800/80">
                We’re curating the next round of community favourites. Until then, explore all live TasteHub polls across the NorthSide GTA.
              </p>
              <Link
                to="/tastehub"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-900 hover:underline"
              >
                See all TasteHub polls →
              </Link>
              {loading && <p className="mt-3 text-xs text-emerald-700/80">Loading live TasteHub polls…</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ButtonLink({ href, label, variant = "primary" }) {
  if (!href || !label) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantClasses =
    variant === "secondary"
      ? "border border-white/70 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-green focus-visible:ring-white focus-visible:ring-offset-emerald-900"
      : "bg-brand-green text-white shadow transition-colors hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:ring-brand-green/50 focus-visible:ring-offset-emerald-900";

  const className = `${baseClasses} ${variantClasses}`;

  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

function IconBubble({ icon: Icon, label }) {
  if (!Icon) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 font-semibold text-brand-green">
        {label ? label.charAt(0) : ""}
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
      <Icon className="h-6 w-6 text-brand-green" aria-hidden />
    </div>
  );
}

function SnapshotRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-emerald-50 bg-white/80 p-4 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function RatingRow({ item, scaleMax = 10 }) {
  if (!item) return null;
  const { icon, label, score = 0, description } = item;
  const normalized = scaleMax > 0 ? (score / scaleMax) * 10 : 0;
  const displayScore = Number.isFinite(normalized)
    ? normalized % 1 === 0
      ? `${normalized.toFixed(0)} / 10`
      : `${normalized.toFixed(1)} / 10`
    : "–";
  const barPercent = scaleMax > 0 ? Math.max(0, Math.min(100, (score / scaleMax) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-emerald-50 bg-white/75 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBubble icon={icon} label={label} />
          <div>
            <p className="text-base font-semibold text-gray-900">{label}</p>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        </div>
        <span className="text-sm font-semibold text-emerald-700">{displayScore}</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  );
}

function LifestyleCard({ item }) {
  if (!item) return null;
  const { icon, title, description } = item;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/80 p-6 shadow-sm">
      <IconBubble icon={icon} label={title} />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-700">{description}</p>}
      </div>
    </div>
  );
}

function AudienceTile({ item }) {
  if (!item) return null;
  const { icon, title, description } = item;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/80 p-5 shadow-sm">
      <IconBubble icon={icon} label={title} />
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );
}

function NeighbourhoodCard({ item }) {
  if (!item) return null;
  const { name, description } = item;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-emerald-50 bg-white/85 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{name}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle, index }) {
  if (!item) return null;
  const { question, answer } = item;
  const regionId = `faq-panel-${index}`;
  return (
    <div className="rounded-2xl border border-emerald-50 bg-white/80 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={regionId}
      >
        <span className="text-base font-semibold text-gray-900">{question}</span>
        <span className="text-emerald-600">{isOpen ? "−" : "+"}</span>
      </button>
      <div
        id={regionId}
        hidden={!isOpen}
        className="px-5 pb-4 text-sm text-gray-700"
      >
        {answer}
      </div>
    </div>
  );
}

export default function TownPageLayout({
  townName,
  townSlug = "",
  hero,
  snapshot = {},
  ratings = [],
  ratingScaleMax = 10,
  lifestyleHighlights = [],
  audiences = [],
  neighbourhoods = [],
  faqs = [],
  cta,
  guide,
  introContent,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const spotlightData = useTownSpotlightData(townSlug);

  const snapshotFields = [
    { key: "population", label: "Population" },
    { key: "driveToToronto", label: "Drive to Toronto" },
    { key: "goTrainTime", label: "GO Train" },
    { key: "homePriceRange", label: "Typical Home Price" },
    { key: "highways", label: "Highways" },
    { key: "transitSummary", label: "Transit" },
  ];

  const secondaryCtaLabel = cta?.secondaryButton?.label || "Tell Us What You’re Looking For";

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          {hero?.backgroundImage ? (
            <img
              src={hero.backgroundImage}
              alt={hero?.backgroundAlt || `${townName} skyline`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
          )}
          <div className="absolute inset-0 bg-emerald-950/70" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24 lg:py-28">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl text-white">
              {hero?.tagline && (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">
                  {hero.tagline}
                </p>
              )}
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {hero?.title || `Living in ${townName}`}
              </h1>
              {hero?.subtitle && (
                <p className="mt-4 text-base text-emerald-50 sm:text-lg">
                  {hero.subtitle}
                </p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink
                  href={hero?.primaryButton?.href || "#"}
                  label={hero?.primaryButton?.label}
                  variant="primary"
                />
                <ButtonLink
                  href={hero?.secondaryButton?.href || "#"}
                  label={hero?.secondaryButton?.label}
                  variant="secondary"
                />
              </div>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="w-full max-w-xs">
                <TownHeroSpotlight
                  townSlug={townSlug}
                  townName={townName}
                  spotlightData={spotlightData}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {introContent}

      {/* Snapshot + Ratings */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Town Snapshot</h2>
              {guide?.href && guide?.label && (
                <a
                  href={guide.href}
                  target={guide.target || "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {guide.label}
                  <span aria-hidden>→</span>
                </a>
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {snapshotFields.map((field) => (
                <SnapshotRow key={field.key} label={field.label} value={snapshot?.[field.key]} />
              ))}
            </div>
            <div className="mt-6 border-t border-emerald-100 pt-5">
              <TownLiveStrip
                townSlug={townSlug}
                townName={townName}
                spotlightData={spotlightData}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">NorthSide Town Ratings</h2>
            </div>
            <div className="mt-6 space-y-4">
              {ratings.map((item, index) => (
                <RatingRow key={item?.label || index} item={item} scaleMax={ratingScaleMax} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <TasteHubTownSection townName={townName} />

      {/* Lifestyle */}
      {lifestyleHighlights.length > 0 && (
        <section className="bg-emerald-950/02">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Lifestyle at a Glance</h2>
              <p className="mt-2 text-sm text-gray-600">
                What day-to-day life feels like in {townName}.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {lifestyleHighlights.map((item, index) => (
                <LifestyleCard key={item?.title || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Audiences */}
      {audiences.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Who {townName} is Great For</h2>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {audiences.map((item, index) => (
                <AudienceTile key={item?.title || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Neighbourhoods */}
      {neighbourhoods.length > 0 && (
        <section className="bg-gradient-to-b from-emerald-50 to-white/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Neighbourhoods in {townName}</h2>
              <p className="mt-2 text-sm text-gray-600">
                A few of the areas home buyers ask us about.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {neighbourhoods.map((item, index) => (
                <NeighbourhoodCard key={item?.name || index} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section>
          <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">Key Questions About Living in {townName}</h2>
            </div>
            <div className="mt-8 space-y-4">
              {faqs.map((item, index) => (
                <FaqItem
                  key={item?.question || index}
                  item={item}
                  index={index}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className="relative isolate overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at top, rgba(255,255,255,0.2), transparent 55%)" }} />
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{cta.title}</h2>
            <p className="mt-4 mx-auto max-w-3xl text-center text-lg font-semibold text-white">
              We live and work across the NorthSide GTA. Let’s talk about whether {townName} is the right fit for your commute, your budget, and your lifestyle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href={cta?.primaryButton?.href || "#"}
                label={cta?.primaryButton?.label}
                variant="primary"
              />
              <ButtonLink
                href="/contact#contact-form"
                label={secondaryCtaLabel}
                variant="secondary"
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
