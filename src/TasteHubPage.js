import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import TasteHubPoll from "./components/tastehub/TasteHubPoll";

const TOWNS = [
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Stouffville",
  "Uxbridge",
  "Scugog",
];

const PRODUCTION_ORIGIN = "https://northsidegta.ca";
const DEFAULT_POLL_IMAGE = "/seo/tastehub-default-poll-share.jpg";
const REGION_NAME = "NorthSide GTA";

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "votes", label: "Most Votes" },
  { value: "new", label: "Newly Added" },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPollImagePath(poll) {
  const value = poll?.image ? String(poll.image).trim() : "";
  return value || DEFAULT_POLL_IMAGE;
}

function generatePollDescription(poll) {
  const title = poll?.title ? String(poll.title).trim() : "";
  const town = poll?.town ? String(poll.town).trim() : "";
  const category = poll?.displayCategory || poll?.category || "";
  const baseDescription = poll?.description ? String(poll.description).trim() : "";

  if (baseDescription) return baseDescription;

  const locationSnippet = [category, town].filter(Boolean).join(" in ");
  const focus = locationSnippet || title || "this TasteHub poll";

  return `Help crown ${focus}! Vote now and see live TasteHub community rankings across the ${REGION_NAME}.`;
}

function toAbsoluteUrl(pathOrUrl, origin = PRODUCTION_ORIGIN) {
  const value = String(pathOrUrl || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const base = origin || PRODUCTION_ORIGIN;
  if (value.startsWith("/")) return `${base}${value}`;
  return `${base}/${value}`;
}

function getPreviewOrigin() {
  if (typeof window === "undefined") return "";
  return window.location?.origin || "";
}

function buildLeaderboardUrl(rankingKey, ballotItems = []) {
  const params = new URLSearchParams();
  params.set("rankingKey", rankingKey);
  if (ballotItems.length > 0) {
    const ballot = ballotItems.map((item) => ({ id: slugify(item.id || item.name), title: item.name }));
    params.set("ballot", JSON.stringify(ballot));
  }
  return `/api/rankings/leaderboard?${params.toString()}`;
}

function normalizePoll(poll) {
  if (!poll) return null;
  const category = poll.category || "";
  const customCategory = poll.customCategory || poll.custom_category || "";
  const displayCategory = customCategory || category;
  const ballotItems = Array.isArray(poll.ballotItems)
    ? poll.ballotItems.map((item) => ({
        ...item,
        id: slugify(item.id || item.name),
      }))
    : [];
  return {
    ...poll,
    status: String(poll.status || "draft").toLowerCase(),
    category,
    customCategory,
    displayCategory,
    town: poll.town || "",
    rankingKey: poll.rankingKey || poll.ranking_key || poll.slug,
    ballotItems,
    image: poll.image || "",
    createdAt: poll.createdAt || poll.updatedAt || null,
  };
}

function PollCard({ poll, leaderboard, onOpen }) {
  const topItems = useMemo(() => {
    if (!leaderboard?.items) return [];
    const scoreMap = new Map();
    leaderboard.items.forEach((item) => {
      const key = slugify(item.id || item.slug);
      scoreMap.set(key, Number(item.score || 0));
    });
    return poll.ballotItems
      .map((item) => ({
        name: item.name,
        id: item.id,
        score: scoreMap.get(item.id) || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [leaderboard, poll.ballotItems]);

  const statusLabel = poll.status === "live" ? "Live" : poll.status === "closed" ? "Closed" : "Draft";
  const statusStyle =
    poll.status === "live"
      ? "bg-emerald-100 text-emerald-800"
      : poll.status === "closed"
      ? "bg-slate-200 text-slate-700"
      : "bg-amber-100 text-amber-700";

  return (
    <article
      className="flex h-full flex-col rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {poll.image && (
        <div className="-mt-2 mb-4 overflow-hidden rounded-2xl border border-emerald-100/70">
          <img
            src={poll.image}
            alt={`${poll.title} feature art`}
            className="h-40 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
        <span>{poll.town}</span>
        <span>{poll.displayCategory}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{poll.title}</h3>
      <p className="mt-3 text-sm text-slate-600">{poll.description}</p>

      <div className="mt-5 space-y-2 text-sm">
        {topItems.length > 0 ? (
          topItems.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-emerald-50/70 px-3 py-2">
              <span className="font-medium text-emerald-900">
                #{index + 1} {item.name}
              </span>
              <span className="text-xs text-emerald-700">{item.score} votes</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">See current rankings inside.</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={() => onOpen(poll)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          Vote & View Rankings →
        </button>
      </div>
    </article>
  );
}

function FeaturedPoll({ poll, onOpen }) {
  const backgroundStyles = poll.image
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(15, 74, 38, 0.85), rgba(245, 158, 11, 0.7)), url(${poll.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={() => onOpen(poll)}
      className="group relative flex min-w-[250px] flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-5 text-left text-white shadow-[0_18px_40px_rgba(10,54,27,0.35)] transition hover:bg-white/20"
      style={backgroundStyles}
    >
      {!poll.image && (
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen" aria-hidden />
      )}
      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-lime-200">
        {poll.town} • {poll.displayCategory}
      </span>
      <span className="mt-3 text-lg font-semibold leading-tight">{poll.title}</span>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime-100">
        Vote Now
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </span>
    </button>
  );
}

function PollShareControls({ poll, shareUrl, showHeading = true }) {
  const [copyStatus, setCopyStatus] = useState("idle");
  const safeUrl = shareUrl || "";
  const shareText = poll?.title
    ? `Vote on ${poll.title} on NorthSide TasteHub`
    : "Check out this NorthSide TasteHub poll";
  const encodedUrl = encodeURIComponent(safeUrl);
  const encodedText = encodeURIComponent(shareText);
  const canUseNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleCopy = useCallback(async () => {
    if (!safeUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeUrl);
      } else {
        const temp = document.createElement("textarea");
        temp.value = safeUrl;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 3000);
    } catch (error) {
      console.error("[TasteHub] copy link failed", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 4000);
    }
  }, [safeUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!canUseNativeShare || !safeUrl) return;
    try {
      await navigator.share({ title: poll?.title || "TasteHub Poll", text: shareText, url: safeUrl });
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.warn("[TasteHub] native share failed", error);
      }
    }
  }, [canUseNativeShare, safeUrl, poll?.title, shareText]);

  return (
    <div className="space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-xs text-white/80">
      {showHeading && <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-lime-200">Spread the word</p>}
      <div className="flex flex-wrap gap-2">
        {canUseNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-400"
          >
            Share from device
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!safeUrl}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copyStatus === "copied" ? "Link copied!" : copyStatus === "error" ? "Copy failed" : "Copy link"}
        </button>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
        >
          X / Twitter
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(poll?.title ? `TasteHub: ${poll.title}` : "TasteHub poll")}&body=${encodedText}%0A${encodedUrl}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
        >
          Email
        </a>
      </div>
      {safeUrl && <p className="break-all text-[11px] text-white/70">{safeUrl}</p>}
    </div>
  );
}

function PollDetailModal({ poll, leaderboard, onClose, onLeaderboardUpdate }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  if (!poll) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tastehub/${poll.slug}`
      : `https://northsidegta.ca/tastehub/${poll.slug}`;
  const heroImage = getPollImagePath(poll);
  const desktopHeroStyles = poll.image
    ? {
        backgroundImage: `linear-gradient(140deg, rgba(7, 70, 39, 0.66) 10%, rgba(6, 95, 70, 0.64) 45%, rgba(245, 158, 11, 0.6)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-emerald-950/80 px-3 py-6 backdrop-blur-sm sm:px-4 sm:py-10">
      <div className="relative mx-auto flex w-full max-w-[1220px] flex-col gap-8 overflow-hidden rounded-[32px] border border-emerald-200/30 bg-white shadow-[0_40px_120px_rgba(6,55,24,0.55)] md:grid md:grid-cols-[minmax(0,3.5fr)_minmax(0,2.5fr)] md:items-start md:gap-4 md:px-4 md:py-5 lg:gap-5 lg:px-4 lg:py-5">
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/90 text-white shadow-lg transition hover:bg-emerald-800"
          aria-label="Close poll"
        >
          ×
        </button>

        <div className="flex flex-col gap-6 p-6 sm:p-8 md:gap-0 md:p-0">
          <div className="space-y-4 rounded-[28px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-500 p-6 text-white shadow-[0_18px_50px_rgba(16,107,48,0.18)] md:hidden">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]">
              {poll.town} • {poll.displayCategory}
            </span>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{poll.title}</h2>
            <p className="text-sm text-emerald-50/90 sm:text-base">{poll.description}</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-emerald-100 shadow-sm md:hidden">
            <img
              src={heroImage}
              alt={`${poll.title} feature art`}
              className="block w-full object-contain md:aspect-[16/10] md:object-cover"
              style={{ height: "auto" }}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div
            className="relative hidden min-h-[520px] flex-col justify-between overflow-hidden rounded-[28px] border border-emerald-100/60 text-white shadow-[0_18px_50px_rgba(16,107,48,0.2)] md:flex"
            style={desktopHeroStyles}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/18 via-emerald-900/14 to-amber-500/14" aria-hidden />
            <div className="relative flex flex-col gap-4 p-7 lg:p-8">
              <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]">
                {poll.town} • {poll.displayCategory}
              </span>
              <h2 className="text-3xl font-semibold leading-tight lg:text-4xl">{poll.title}</h2>
              <p className="max-w-2xl text-sm text-emerald-50/90 lg:text-base">{poll.description}</p>
            </div>
            <div className="relative flex flex-col gap-4 p-6 lg:gap-5 lg:p-7">
              <div className="max-w-xl rounded-2xl border border-white/25 bg-white/10 p-5 shadow-lg backdrop-blur-sm lg:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lime-200">Spread the word</p>
                <p className="mt-2 text-sm text-emerald-50/85">
                  Share this poll right from the hero so friends can vote and watch the live leaderboard with you.
                </p>
                <div className="mt-3">
                  <PollShareControls poll={poll} shareUrl={shareUrl} showHeading={false} />
                </div>
              </div>
              <a href="#leaderboard" className="live-pill live-pill--northside">
                <span className="live-dot" />
                <span className="live-text">LIVE</span>
                <span className="live-label">View leaderboard ↓</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-16 sm:px-8 sm:pb-20 md:gap-4 md:px-4 md:pb-5 md:pt-3 md:[&>*+*]:mt-4 lg:gap-4 lg:px-4 lg:pb-4 lg:pt-4">
          <TasteHubPoll
            poll={poll}
            initialLeaderboard={leaderboard}
            onLeaderboardUpdate={(payload) => onLeaderboardUpdate?.(poll, payload)}
          />

          <div className="rounded-[28px] bg-gradient-to-br from-emerald-900/70 via-emerald-800/70 to-amber-600/65 p-[1px] shadow-[0_18px_40px_rgba(16,107,48,0.16)] md:hidden">
            <div className="h-full rounded-[26px] bg-emerald-950/80 p-6 text-white sm:p-7">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold leading-tight sm:text-xl">Spread the word</h3>
                <p className="text-sm text-emerald-50/80">
                  Share this poll with friends so they can vote and watch the live leaderboard with you.
                </p>
                <PollShareControls poll={poll} shareUrl={shareUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasteHubPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboards, setLeaderboards] = useState({});
  const [selectedTown, setSelectedTown] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortMode, setSortMode] = useState("trending");
  const [activePoll, setActivePoll] = useState(null);
  const [unknownSlug, setUnknownSlug] = useState("");

  const pollsRef = useRef(null);
  const filtersRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();
  const slugParam = (params?.slug || "").toLowerCase();

  const pollForSeo = useMemo(() => {
    if (!slugParam) return null;
    return polls.find((poll) => poll.slug === slugParam) || null;
  }, [polls, slugParam]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/tastehub/polls", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load polls");
        }
        const payload = await response.json();
        const normalized = Array.isArray(payload?.polls)
          ? payload.polls.map(normalizePoll).filter(Boolean)
          : [];
        if (!cancelled) {
          setPolls(normalized);
        }
      } catch (err) {
        console.error("[TasteHubPage] failed to load polls", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load polls");
          setPolls([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slugParam) {
      setUnknownSlug("");
      if (activePoll) {
        setActivePoll(null);
      }
      return;
    }
    if (!polls.length) return;
    const match = polls.find((poll) => poll.slug === slugParam);
    if (match) {
      setUnknownSlug("");
      setActivePoll(match);
    } else if (!loading) {
      setUnknownSlug(slugParam);
      setActivePoll(null);
    }
  }, [slugParam, polls, loading]);

  useEffect(() => {
    if (!polls.length) return;
    let cancelled = false;
    const loadSummaries = async () => {
      try {
        const entries = await Promise.all(
          polls.map(async (poll) => {
            try {
              const response = await fetch(buildLeaderboardUrl(poll.rankingKey, poll.ballotItems));
              if (!response.ok) throw new Error("Leaderboard load failed");
              const data = await response.json();
              return [poll.rankingKey, data];
            } catch (err) {
              console.warn("[TasteHubPage] leaderboard fetch failed", poll.rankingKey, err);
              return [poll.rankingKey, null];
            }
          })
        );
        if (!cancelled) {
          setLeaderboards((current) => {
            const next = { ...current };
            entries.forEach(([key, data]) => {
              if (key) next[key] = data;
            });
            return next;
          });
        }
      } catch (error) {
        console.warn("[TasteHubPage] failed to load leaderboards", error);
      }
    };

    loadSummaries();
    return () => {
      cancelled = true;
    };
  }, [polls]);

  const categories = useMemo(() => {
    const set = new Set();
    polls.forEach((poll) => {
      if (poll.displayCategory) set.add(poll.displayCategory);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [polls]);

  const filteredPolls = useMemo(() => {
    return polls.filter((poll) => {
      const matchTown = selectedTown === "all" || poll.town === selectedTown;
      const matchCategory = selectedCategory === "all" || poll.displayCategory === selectedCategory;
      return matchTown && matchCategory;
    });
  }, [polls, selectedTown, selectedCategory]);

  const sortedPolls = useMemo(() => {
    const withScores = filteredPolls.map((poll) => {
      const summary = leaderboards[poll.rankingKey];
      const totalVotes = summary?.totalBallots || 0;
      const updatedAt = summary?.updatedAt || poll.createdAt || "";
      return { poll, totalVotes, updatedAt };
    });

    if (sortMode === "votes") {
      return withScores.sort((a, b) => b.totalVotes - a.totalVotes).map((entry) => entry.poll);
    }

    if (sortMode === "new") {
      return withScores
        .sort((a, b) => {
          return (b.poll.createdAt || "").localeCompare(a.poll.createdAt || "");
        })
        .map((entry) => entry.poll);
    }

    return withScores
      .sort((a, b) => {
        const featuredDelta = Number(b.poll.featured) - Number(a.poll.featured);
        if (featuredDelta !== 0) return featuredDelta;
        if (b.totalVotes !== a.totalVotes) return b.totalVotes - a.totalVotes;
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      })
      .map((entry) => entry.poll);
  }, [filteredPolls, leaderboards, sortMode]);

  const featuredPolls = useMemo(() => {
    const candidates = polls.filter((poll) => poll.featured);
    if (!candidates.length) return [];
    if (selectedTown !== "all") {
      const townMatches = candidates.filter((poll) => poll.town === selectedTown);
      if (townMatches.length) return townMatches.slice(0, 2);
    }
    return candidates.slice(0, 2);
  }, [polls, selectedTown]);

  const hallOfFame = useMemo(() => {
    const scores = polls
      .map((poll) => ({ poll, total: leaderboards[poll.rankingKey]?.totalBallots || 0 }))
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    return scores;
  }, [polls, leaderboards]);

  const pollSeoData = useMemo(() => {
    if (!pollForSeo) return null;

    const pollTitle = pollForSeo.title || "TasteHub Poll";
    const documentTitle = `${pollTitle} | TasteHub | NorthSide GTA`;
    const shareTitle = `${pollTitle} – TasteHub Community Rankings`;
    const description = generatePollDescription(pollForSeo);
    const canonicalUrl = `${PRODUCTION_ORIGIN}/tastehub/${pollForSeo.slug}`;
    const previewOrigin = getPreviewOrigin();
    const previewUrl = previewOrigin ? `${previewOrigin}/tastehub/${pollForSeo.slug}` : canonicalUrl;
    const ogUrl = previewOrigin && !previewOrigin.includes("northsidegta.ca") ? previewUrl : canonicalUrl;
    const imagePath = getPollImagePath(pollForSeo);
    const absoluteImage = toAbsoluteUrl(imagePath, PRODUCTION_ORIGIN);
    const townArea = pollForSeo.townArea ? String(pollForSeo.townArea).trim() : "";
    const townName = pollForSeo.town ? String(pollForSeo.town).trim() : REGION_NAME;
    const voteCount = leaderboards[pollForSeo.rankingKey]?.totalBallots;

    const schemaObject = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: pollTitle,
      description,
      url: canonicalUrl,
      image: absoluteImage,
      identifier: pollForSeo.slug,
      genre: pollForSeo.displayCategory || pollForSeo.category || "TasteHub poll",
      about: pollForSeo.displayCategory ? { "@type": "Thing", name: pollForSeo.displayCategory } : undefined,
      inLanguage: "en-CA",
      isPartOf: "TasteHub Community Rankings",
      keywords: [
        pollForSeo.displayCategory || pollForSeo.category,
        pollForSeo.town,
        townArea,
        "TasteHub",
        REGION_NAME,
      ]
        .filter(Boolean)
        .join(", "),
      areaServed: [
        pollForSeo.town ? { "@type": "AdministrativeArea", name: pollForSeo.town } : null,
        { "@type": "AdministrativeArea", name: REGION_NAME },
      ].filter(Boolean),
      spatialCoverage: {
        "@type": "Place",
        name: townArea ? `${townArea}, ${townName}` : townName,
        address: {
          "@type": "PostalAddress",
          addressLocality: townArea || townName,
          addressRegion: REGION_NAME,
        },
      },
      audience: { "@type": "Audience", audienceType: `${REGION_NAME} food fans` },
      creator: { "@type": "Organization", name: "TasteHub by NorthSide GTA" },
    };

    if (typeof voteCount === "number" && voteCount > 0) {
      schemaObject.interactionStatistic = {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/VoteAction",
        userInteractionCount: voteCount,
      };
    }

    const schema = JSON.stringify(schemaObject, null, 2);

    return {
      meta: {
        documentTitle,
        title: documentTitle,
        ogTitle: shareTitle,
        twitterTitle: shareTitle,
        description,
        ogDescription: description,
        twitterDescription: description,
        canonicalUrl,
        ogType: "website",
        ogImage: imagePath,
        twitterImage: imagePath,
        siteName: REGION_NAME,
        twitterCard: "summary_large_image",
        additionalMeta: [{ property: "og:url", content: ogUrl }],
      },
      schema,
    };
  }, [leaderboards, pollForSeo]);

  const handleOpenPoll = (poll) => {
    setUnknownSlug("");
    setActivePoll(poll);
    if (poll?.slug) {
      navigate(`/tastehub/${poll.slug}`, { replace: slugParam === poll.slug });
    }
  };
  const handleClosePoll = () => {
    setActivePoll(null);
    setUnknownSlug("");
    if (slugParam) {
      navigate("/tastehub", { replace: true });
    }
  };

  const activeLeaderboard = activePoll ? leaderboards[activePoll.rankingKey] : null;

  const handleLeaderboardUpdate = (poll, payload) => {
    setLeaderboards((current) => ({ ...current, [poll.rankingKey]: payload }));
  };

  const scrollToPolls = () => {
    pollsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFilters = () => {
    filtersRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const metaConfig = pollSeoData?.meta || getStaticRouteMeta("/tastehub");
  const pollSchema = pollSeoData?.schema || "";

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfdf8] text-slate-900">
      <DynamicMetaTags {...metaConfig}>
        {pollSchema && <script type="application/ld+json">{pollSchema}</script>}
      </DynamicMetaTags>
      <HeaderShell />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3a20] via-[#165632] to-[#f59e0b]">
          <div className="absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-lime-300 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-200 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 text-white lg:flex-row lg:items-center lg:gap-16">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.38em] text-lime-200">
                Powered by Finally Home Agents
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">NorthSide TasteHub</h1>
              <p className="text-lg text-emerald-50">
                Vote on your favourite local spots, settle the food debates, and see who’s winning across the NorthSide GTA.
              </p>
              <p className="text-sm text-emerald-100/80">
                From Uxbridge to Georgina, TasteHub is where the community comes together to rank pizza, wings, coffee, and more—just for fun.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="button"
                  onClick={scrollToPolls}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-lg transition hover:translate-y-[-1px] hover:shadow-xl"
                >
                  Browse All Polls →
                </button>
                <button
                  type="button"
                  onClick={scrollToFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Jump to My Town
                </button>
              </div>
            </div>
            <div className="relative w-full max-w-md">
              <div className="rounded-[36px] border border-white/30 bg-white/10 p-6 shadow-[0_24px_70px_rgba(7,45,22,0.45)] backdrop-blur">
                <p className="text-sm uppercase tracking-[0.42em] text-lime-200">Live rankings</p>
                <p className="mt-4 text-2xl font-semibold leading-tight text-white">
                  The tastiest bracket north of the city.
                </p>
                <p className="mt-3 text-sm text-emerald-100">
                  Powered by our Upstash leaderboard. Every vote updates the standings instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section ref={filtersRef} className="relative z-10 -mt-12 pb-12">
          <div className="mx-auto max-w-6xl rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-emerald-900">Filter the TasteHub</h2>
                <p className="text-sm text-slate-500">Pick a town, choose a food category, and sort the community buzz.</p>
              </div>
              <div className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3">
                <label className="flex flex-col text-sm font-medium text-slate-600">
                  Town
                  <select
                    value={selectedTown}
                    onChange={(event) => setSelectedTown(event.target.value)}
                    className="mt-1 rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="all">All Towns</option>
                    {TOWNS.map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-medium text-slate-600">
                  Food
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="mt-1 rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="all">All Foods</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-medium text-slate-600">
                  Sort
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value)}
                    className="mt-1 rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {featuredPolls.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">Hot Right Now</h3>
                </div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {featuredPolls.map((poll) => (
                    <FeaturedPoll key={poll.slug} poll={poll} onOpen={handleOpenPoll} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section ref={pollsRef} className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-emerald-900">TasteHub Polls</h2>
            {loading && <span className="text-sm text-slate-500">Loading…</span>}
          </div>
          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {!loading && !error && unknownSlug && (
            <p className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-600">
              We couldn’t find a poll called <strong>{unknownSlug}</strong>. Explore the latest matchups below.
            </p>
          )}

          {!loading && !error && sortedPolls.length === 0 && (
            <p className="mt-6 rounded-3xl border border-emerald-100 bg-white/90 p-6 text-sm text-slate-500">
              No polls match those filters yet. Try another town or food type — more showdowns are on the way.
            </p>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedPolls.map((poll) => (
              <PollCard
                key={poll.slug}
                poll={poll}
                leaderboard={leaderboards[poll.rankingKey]}
                onOpen={handleOpenPoll}
              />
            ))}
          </div>
        </section>

        {hallOfFame.length > 0 && (
          <section className="bg-gradient-to-b from-white to-emerald-50/60 py-16">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-semibold text-emerald-900">TasteHub Hall of Fame</h2>
              <p className="mt-2 text-sm text-slate-500">
                The polls with the most community love across the NorthSide GTA.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {hallOfFame.map(({ poll, total }) => (
                  <div
                    key={poll.slug}
                    className="flex items-center justify-between rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
                        {poll.town} • {poll.displayCategory}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{poll.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-700">{total} votes</p>
                      <button
                        type="button"
                        onClick={() => handleOpenPoll(poll)}
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400"
                      >
                        View Poll →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-emerald-100 bg-white/95 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-semibold text-emerald-900">What is NorthSide TasteHub?</h2>
            <p className="mt-4 text-sm text-slate-600">
              NorthSide TasteHub is a community-driven, just-for-fun way to celebrate local spots across the NorthSide GTA.
              Rankings are based on community votes and are not official reviews or professional recommendations. Always do your
              own research before deciding where to eat.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {activePoll && (
        <PollDetailModal
          poll={activePoll}
          leaderboard={activeLeaderboard}
          onClose={handleClosePoll}
          onLeaderboardUpdate={handleLeaderboardUpdate}
        />
      )}
    </div>
  );
}
