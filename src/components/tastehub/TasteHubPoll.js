import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "/api/rankings";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function computeBallotPayload(ballotItems = []) {
  return ballotItems.map((item) => ({
    id: slugify(item.id || item.name),
    title: item.name,
  }));
}

function buildLeaderboardUrl(rankingKey, ballotItems) {
  const ballotPayload = computeBallotPayload(ballotItems);
  const params = new URLSearchParams();
  params.set("rankingKey", rankingKey);
  if (ballotPayload.length > 0) {
    params.set("ballot", JSON.stringify(ballotPayload));
  }
  return `${API_BASE}/leaderboard?${params.toString()}`;
}

function formatPercent(score, total) {
  if (!total) return "0%";
  const pct = Math.round((score / total) * 100);
  return `${pct}%`;
}

function useLeaderboard({ rankingKey, ballotItems, initialData, onUpdate }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!rankingKey) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(buildLeaderboardUrl(rankingKey, ballotItems));
      if (!response.ok) {
        throw new Error("Failed to load leaderboard");
      }
      const payload = await response.json();
      setData(payload);
      onUpdate?.(payload);
    } catch (err) {
      console.error("[TasteHubPoll] leaderboard fetch failed", err);
      setError(err instanceof Error ? err.message : "Unable to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [rankingKey, ballotItems, onUpdate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

function LeaderboardList({ items, total, loading, error }) {
  if (loading && !items.length) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl bg-white/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded bg-emerald-100/60" />
              <div className="h-5 w-12 rounded bg-emerald-100/60" />
            </div>
            <div className="mt-3 h-2 rounded-full bg-emerald-100/60" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-rose-600">Rankings are unavailable right now. Please try again soon.</p>;
  }

  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">
        Be the first to vote! Once ballots come in we’ll show the live leaderboard here.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const percentage = total ? item.score / total : 0;
        const width = total ? Math.max(8, Math.round(percentage * 100)) : 0;
        const isLeader = index === 0 && item.score > 0;
        return (
          <li
            key={item.id}
            className={`rounded-2xl border border-emerald-200/70 bg-white/90 p-4 shadow-sm transition ${
              isLeader ? "shadow-[0_12px_30px_rgba(245,158,11,0.35)] border-amber-300" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-base font-semibold ${
                    isLeader
                      ? "border-amber-400 bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900">{item.name}</p>
                  {item.address && <p className="text-xs text-slate-500">{item.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-700">{item.score} votes</p>
                <p className="text-xs text-slate-500">{formatPercent(item.score, total)}</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#15803d,#f97316)] transition-all"
                style={{ width: `${Math.min(width, 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TasteHubPoll({
  poll,
  initialLeaderboard,
  onLeaderboardUpdate,
}) {
  const rankingKeySource =
    poll?.rankingKey || poll?.ranking_key || poll?.slug || "";
  const rankingKey = useMemo(
    () => rankingKeySource.trim(),
    [rankingKeySource]
  );

  const rawBallotItems = poll?.ballotItems || poll?.ballot_items || [];
  const status = String(poll?.status || "draft").toLowerCase();
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voteStatus, setVoteStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const normalizedBallot = useMemo(() => {
    return Array.isArray(rawBallotItems)
      ? rawBallotItems.map((item) => ({
          ...item,
          id: slugify(item.id || item.name),
        }))
      : [];
  }, [rawBallotItems]);

  const { data, loading, error, refresh } = useLeaderboard({
    rankingKey,
    ballotItems: normalizedBallot,
    initialData: initialLeaderboard,
    onUpdate: onLeaderboardUpdate,
  });

  const leaderboardItems = useMemo(() => {
    const scores = new Map();
    if (data?.items) {
      data.items.forEach((item) => {
        const key = slugify(item.id || item.slug);
        scores.set(key, {
          score: Number(item.score || 0),
          firsts: Number(item.firsts || 0),
        });
      });
    }
    return normalizedBallot.map((item) => ({
      ...item,
      score: scores.get(item.id)?.score || 0,
      firsts: scores.get(item.id)?.firsts || 0,
    }));
  }, [data, normalizedBallot]);

  const totalVotes = useMemo(() => {
    if (typeof data?.totalBallots === "number") return data.totalBallots;
    return leaderboardItems.reduce((sum, item) => sum + (item.score || 0), 0);
  }, [data, leaderboardItems]);

  const sortedItems = useMemo(() => {
    return [...leaderboardItems].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.firsts !== a.firsts) return b.firsts - a.firsts;
      return a.name.localeCompare(b.name);
    });
  }, [leaderboardItems]);

  const canVote = status === "live" && normalizedBallot.length > 0;

  useEffect(() => {
    setSelected("");
    setVoteStatus("idle");
    setMessage("");
  }, [rankingKey]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!rankingKey || !selected || submitting || !canVote) return;

      setSubmitting(true);
      setVoteStatus("submitting");
      setMessage("");

      const payload = {
        rankingKey,
        choice: selected,
        ballotItems: normalizedBallot.map((item) => ({ id: item.id, name: item.name })),
      };

      try {
        const response = await fetch(`${API_BASE}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          setVoteStatus("duplicate");
          setMessage("Looks like you’ve already voted today. Come back tomorrow to cheer again!");
          return;
        }

        if (!response.ok) {
          setVoteStatus("error");
          setMessage("We couldn’t record your vote. Please try again.");
          return;
        }

        setVoteStatus("success");
        setMessage("Thanks! Your vote was recorded.");
        await refresh();
      } catch (err) {
        console.error("[TasteHubPoll] vote failed", err);
        setVoteStatus("error");
        setMessage("We couldn’t record your vote. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [rankingKey, selected, submitting, canVote, normalizedBallot, refresh]
  );

  return (
    <div className="tastehub-poll-shell space-y-6 md:space-y-0">
      <div className="tastehub-poll space-y-4 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-600 p-[1px] shadow-[0_22px_50px_rgba(16,107,48,0.18)]">
        <div className="rounded-[28px] bg-white/98 p-6 shadow-[0_18px_50px_rgba(16,107,48,0.18)] lg:p-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <fieldset className="space-y-3" disabled={!canVote || submitting}>
              <legend className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Cast your vote
              </legend>
              {normalizedBallot.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selected === item.id
                      ? "border-amber-400 bg-amber-50/70 shadow-sm"
                      : "border-emerald-100 bg-white hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="tastehub-choice"
                    value={item.id}
                    checked={selected === item.id}
                    onChange={() => setSelected(item.id)}
                    className="mt-1 h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">{item.name}</span>
                    {item.address && <span className="block text-xs text-slate-500">{item.address}</span>}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        View menu →
                      </a>
                    )}
                  </span>
                </label>
              ))}

              {!normalizedBallot.length && (
                <p className="text-sm text-slate-500">Ballot coming soon. Check back shortly!</p>
              )}
            </fieldset>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={!canVote || !selected || submitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-300"
              >
                {submitting ? "Submitting…" : "Submit my vote"}
              </button>
              {status !== "live" && (
                <p className="text-xs text-slate-500">This poll isn’t accepting new votes right now.</p>
              )}
              {message && (
                <p
                  className={`text-sm ${
                    voteStatus === "success"
                      ? "inline-flex items-center rounded-full bg-emerald-900/90 px-3 py-1.5 font-semibold text-white shadow-[0_6px_18px_rgba(6,38,21,0.35)]"
                      : voteStatus === "duplicate"
                      ? "inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 font-semibold text-emerald-900 shadow-[0_8px_24px_rgba(15,94,43,0.15)]"
                      : "text-rose-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      <div id="leaderboard" className="tastehub-leader space-y-4 rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-[0_18px_40px_rgba(16,107,48,0.12)] lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
            <span role="img" aria-label="trophy">
              🏆
            </span>
            Live leaderboard
          </h3>
          <span className="text-xs uppercase tracking-[0.28em] text-emerald-600">
            Total votes: {totalVotes}
          </span>
        </div>
        <LeaderboardList items={sortedItems} total={totalVotes} loading={loading} error={error} />

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-slate-600">
          <p>
            One vote per person per day. Share this poll with your NorthSide friends and keep the friendly rivalries rolling!
          </p>
        </div>
      </div>
    </div>
  );
}
