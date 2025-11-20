import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiClock,
  FiGlobe,
  FiHelpCircle,
  FiMap,
  FiNavigation,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import TownLiveStrip from "./TownLiveStrip";
import { useTownSpotlightData } from "./useTownSpotlightData";
import TownHeroSpotlight from "./TownHeroSpotlight";
import { selectTownSpotlight } from "../../lib/spotlight/selectSpotlight";

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

function TasteHubTownSection({ townName, variant = "full" }) {
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

  const Wrapper = variant === "full" ? "section" : React.Fragment;
  const wrapperProps =
    variant === "full"
      ? { className: "mx-auto max-w-6xl px-4 pb-16" }
      : { className: "" };

  const cardClasses =
    variant === "full"
      ? "rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/90 p-6 shadow-lg backdrop-blur"
      : "rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-amber-50/70 p-4 shadow-sm";

  return (
    <Wrapper {...wrapperProps}>
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

      <div className={cardClasses}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 text-emerald-950">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">NorthSide TasteHub™</p>
            <h2 className={`font-bold leading-tight ${variant === "full" ? "text-2xl" : "text-lg"}`}>
              Local Favourites in {townName}
            </h2>
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
            <div className="grid grid-cols-1 gap-4">
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
    </Wrapper>
  );
}

function ButtonLink({ href, label, variant = "primary" }) {
  if (!href || !label) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const variantClasses =
    variant === "secondary"
      ? "border border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-950"
      : "bg-brand-green text-white shadow transition-colors hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:ring-brand-green/50";

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
  const baseClass =
    "flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-[0_6px_20px_-16px_rgba(0,0,0,0.35)]";

  if (!Icon) {
    return (
      <div className={`${baseClass} text-base font-semibold`}>
        {label ? label.charAt(0) : ""}
      </div>
    );
  }

  return (
    <div className={baseClass}>
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

function SnapshotRow({ label, value, icon }) {
  if (!value) return null;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-50 bg-white/85 p-4 shadow-sm">
      <IconBubble icon={Icon} label={label} />
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {label}
        </span>
        <p className="text-sm font-semibold text-emerald-950">{value}</p>
      </div>
    </div>
  );
}

function RatingRow({ item, scaleMax = 10, animated = false, showValue = false, reduceMotion = false }) {
  if (!item) return null;
  const { icon, label, score = 0, description } = item;
  const normalized = scaleMax > 0 ? (score / scaleMax) * 10 : 0;
  const displayScore = Number.isFinite(normalized)
    ? normalized % 1 === 0
      ? `${normalized.toFixed(0)} / 10`
      : `${normalized.toFixed(1)} / 10`
    : "–";
  const barPercent = scaleMax > 0 ? Math.max(0, Math.min(100, (score / scaleMax) * 100)) : 0;
  const widthValue = showValue ? `${barPercent}%` : "0%";
  const progressTransition = animated && !reduceMotion ? "transition-[width] duration-700 ease-out" : "transition-none";

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBubble icon={icon} label={label} />
          <div>
            <p className="text-base font-semibold text-gray-900">{label}</p>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        </div>
        <span className="text-sm font-semibold text-emerald-800">{displayScore}</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-50">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 ${progressTransition}`}
          style={{ width: widthValue }}
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
  livingIntro,
  ratings = [],
  ratingScaleMax = 10,
  lifestyleHighlights = [],
  audiences = [],
  neighbourhoods = [],
  faqs = [],
  cta,
  guide,
  summary,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const spotlightData = useTownSpotlightData(townSlug);
  const [ratingsInView, setRatingsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionError, setQuestionError] = useState("");
  const ratingsRef = useRef(null);

  const snapshotFields = [
    { key: "population", label: "Population", icon: FiUsers },
    { key: "driveToToronto", label: "Drive to Toronto", icon: FiClock },
    { key: "goTrain", label: "GO Train", icon: FiNavigation },
    { key: "homePriceRange", label: "Typical Home Price", icon: FiTrendingUp },
    { key: "highways", label: "Highways", icon: FiMap },
    { key: "transitSummary", label: "Transit", icon: FiGlobe },
  ];

  const secondaryCtaLabel = cta?.secondaryButton?.label || "Tell Us What You’re Looking For";
  const spotlightSelection = useMemo(() => {
    const items = Array.isArray(spotlightData?.items) ? spotlightData.items : [];
    return selectTownSpotlight(townSlug, townName, items);
  }, [spotlightData?.items, townName, townSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => setPrefersReducedMotion(media.matches);
    handleMotionChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleMotionChange);
      return () => media.removeEventListener("change", handleMotionChange);
    }

    media.addListener(handleMotionChange);
    return () => media.removeListener(handleMotionChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setRatingsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRatingsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    if (ratingsRef.current) {
      observer.observe(ratingsRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const showRatings = ratingsInView || prefersReducedMotion;
  const animateRatings = ratingsInView && !prefersReducedMotion;
  const hasFaqs = Array.isArray(faqs) && faqs.length > 0;

  const handleQuestionSubmit = (event) => {
    event.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed) {
      setQuestionError("Please enter a question.");
      return;
    }

    setQuestionError("");
    const params = new URLSearchParams();
    if (townSlug) params.set("town", townSlug);
    params.set("question", trimmed);
    const targetUrl = `/contact?${params.toString()}`;
    window.location.href = targetUrl;
  };

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
          <div className="flex max-w-4xl flex-col gap-6 text-white">
            {hero?.tagline && (
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">{hero.tagline}</p>
            )}
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {hero?.title || `Living in ${townName}`}
            </h1>
            {hero?.subtitle && <p className="text-base text-emerald-50 sm:text-lg">{hero.subtitle}</p>}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        </div>
      </section>

      {/* Living intro + Ratings */}
      <section className="relative mx-auto -mt-10 max-w-6xl px-4 pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" ref={ratingsRef}>
          <article className="rounded-[28px] border border-emerald-100 bg-white/95 p-7 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Living in {townName}</p>
            <h2 className="mt-3 text-2xl font-semibold text-emerald-950">{hero?.title || `Living in ${townName}`}</h2>
            {(livingIntro || hero?.subtitle || summary) && (
              <p className="mt-4 text-[15px] leading-relaxed text-emerald-900/85">
                {livingIntro || hero?.subtitle || summary}
              </p>
            )}
            {guide?.href && guide?.label && (
              <a
                href={guide.href}
                target={guide.target || "_blank"}
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline"
              >
                {guide.label}
                <span aria-hidden>→</span>
              </a>
            )}
          </article>
          <div className="rounded-[28px] border border-emerald-100 bg-white/95 p-7 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">NorthSide Town Ratings</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Out of 10</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-emerald-800/80">
              <FiHelpCircle className="h-4 w-4" aria-hidden />
              Ratings are relative to other NorthSide GTA towns.
            </p>
            <div className="mt-6 space-y-3.5">
              {ratings.map((item, index) => (
                <RatingRow
                  key={item?.label || index}
                  item={item}
                  scaleMax={ratingScaleMax}
                  animated={animateRatings}
                  showValue={showRatings}
                  reduceMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-[30px] border border-emerald-100 bg-white/95 p-7 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Spotlight</p>
              <h2 className="text-2xl font-semibold text-emerald-950">Curated daily for {townName}</h2>
              <p className="text-sm text-emerald-900/80">
                Updated place intel powered by Google data and NorthSide scouting. Tap into what’s trending now.
              </p>
            </div>
            <div className="w-full max-w-md lg:max-w-sm">
              <TownHeroSpotlight townSlug={townSlug} townName={townName} spotlightData={spotlightData} />
            </div>
          </div>
          {spotlightSelection?.thumbnails?.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spotlightSelection.thumbnails.slice(0, 3).map((place) => (
                <div
                  key={place.placeId}
                  className="group rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/90">
                    {spotlightSelection.thumbnailLabels.find((meta) => meta.placeId === place.placeId)?.label || townName}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-emerald-950">{place.name}</h3>
                  {place.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-emerald-900/80">{place.summary}</p>
                  )}
                  {typeof place.rating === "number" && typeof place.userRatingsTotal === "number" && (
                    <p className="mt-2 text-[12px] font-semibold text-emerald-700">⭐ {place.rating.toFixed(1)}
                      <span className="text-emerald-800/70"> ({place.userRatingsTotal.toLocaleString()} reviews)</span>
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900">
                    See details →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Town Snapshot */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-[30px] border border-emerald-100 bg-white/95 p-7 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Town Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">Key stats at a glance</h2>
            </div>
            {guide?.href && guide?.label && (
              <a
                href={guide.href}
                target={guide.target || "_blank"}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-200 hover:bg-white"
              >
                {guide.label}
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snapshotFields.map((field) => (
              <SnapshotRow
                key={field.key}
                label={field.label}
                value={snapshot?.[field.key]}
                icon={field.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live strip */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-[30px] border border-emerald-100 bg-white/95 p-7 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Live in {townName}</p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">What’s happening now</h2>
            </div>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-900 hover:underline"
            >
              Explore community →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/90">Daily picks</p>
              <TownLiveStrip
                townSlug={townSlug}
                townName={townName}
                spotlightData={spotlightData}
                className="mt-4"
              />
            </div>
            <div className="rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:col-span-1 lg:col-span-1">
              <TasteHubTownSection townName={townName} variant="compact" />
            </div>
            <div className="rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700/90">Stay curious</p>
                <Link
                  to="/insights"
                  className="text-sm font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-900 hover:underline"
                >
                  Insights →
                </Link>
              </div>
              <p className="mt-3 text-sm text-emerald-900/80">
                Explore the latest NorthSide research, market snapshots, and buyer guides crafted for movers across the GTA.
              </p>
              <Link
                to="/buyers"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-900 hover:underline"
              >
                NorthSide Buyers →
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {/* FAQs + Question box */}
      <section>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900">Key Questions About Living in {townName}</h2>
            <p className="mt-2 text-sm text-gray-600">Ask us anything about neighbourhoods, commute, or fit for your lifestyle.</p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="rounded-2xl border border-emerald-100 bg-white/95 p-5 shadow-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Ask a question</p>
              <h3 className="mt-2 text-lg font-semibold text-emerald-950">Have a question about living in {townName}?</h3>
              <p className="mt-2 text-sm text-emerald-900/80">
                Drop a quick note and we’ll route you to the contact page with your question prefilled.
              </p>
              <form className="mt-4 space-y-3" onSubmit={handleQuestionSubmit}>
                <label className="text-sm font-semibold text-emerald-900" htmlFor="town-question">
                  Your question
                </label>
                <textarea
                  id="town-question"
                  rows={2}
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-900 shadow-inner focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  placeholder={`Ask us anything about ${townName}`}
                  aria-invalid={Boolean(questionError)}
                />
                {questionError && <p className="text-xs text-red-600">{questionError}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Send your question
                    <FiArrowUpRight className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="text-xs text-emerald-800/80">We’ll include your town so we can respond faster.</span>
                </div>
              </form>
            </div>
            {hasFaqs && (
              <div className="space-y-4">
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
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      {cta && (
        <section className="relative isolate overflow-hidden pb-20 pt-14">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-emerald-50" />
          <div className="relative mx-auto max-w-5xl px-4">
            <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-8 text-center shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Thinking about living in {townName}?</p>
              <h2 className="mt-3 text-2xl font-semibold text-emerald-950">{cta.title}</h2>
              <p className="mt-3 text-base text-emerald-900/80">
                We live and work across the NorthSide GTA. Let’s talk about whether {townName} is the right fit for your commute, your budget, and your lifestyle.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href={cta?.primaryButton?.href || "#"}
                  label={cta?.primaryButton?.label}
                  variant="primary"
                />
                <ButtonLink href="/contact#contact-form" label={secondaryCtaLabel} variant="secondary" />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
