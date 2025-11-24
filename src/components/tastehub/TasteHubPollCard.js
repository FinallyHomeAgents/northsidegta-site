import React, { useMemo } from "react";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TasteHubPollCard({ poll, leaderboard, onOpen }) {
  const topItems = useMemo(() => {
    if (!leaderboard?.items) return [];
    const scoreMap = new Map();
    leaderboard.items.forEach((item) => {
      const key = slugify(item.id || item.slug);
      scoreMap.set(key, Number(item.score || 0));
    });
    return Array.isArray(poll?.ballotItems)
      ? poll.ballotItems
          .map((item) => ({
            name: item.name,
            id: item.id,
            score: scoreMap.get(item.id) || 0,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      : [];
  }, [leaderboard, poll?.ballotItems]);

  const statusLabel = poll?.status === "live" ? "Live" : poll?.status === "closed" ? "Closed" : "Draft";
  const statusStyle =
    poll?.status === "live"
      ? "bg-emerald-100 text-emerald-800"
      : poll?.status === "closed"
      ? "bg-slate-200 text-slate-700"
      : "bg-amber-100 text-amber-700";

  return (
    <article className="flex h-full flex-col rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {poll?.image && (
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
        <span>{poll?.town}</span>
        <span>{poll?.displayCategory}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{poll?.title}</h3>
      <p className="mt-3 text-sm text-slate-600">{poll?.description}</p>

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
          onClick={() => onOpen?.(poll)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          Vote & View Rankings →
        </button>
      </div>
    </article>
  );
}
