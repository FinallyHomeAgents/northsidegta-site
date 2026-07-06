import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DateTime } from 'luxon'

function SkeletonRow({ index }) {
  return (
    <div className="flex items-center gap-3 py-2" key={index}>
      <div className="h-5 w-5 rounded-full bg-emerald-100" />
      <div className="flex-1">
        <div className="h-3 w-32 rounded bg-emerald-100" />
        <div className="mt-2 h-1 rounded bg-emerald-100" />
      </div>
      <div className="h-4 w-10 rounded bg-emerald-100" />
    </div>
  )
}

function ScoreBar({ value, max }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  const width = value > 0 ? Math.max(percent, 12) : 4
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#1c5321,#3b8d3f)] transition-all"
        style={{ width: `${Math.min(width, 100)}%` }}
      />
    </div>
  )
}

export default function LeaderboardWidget({
  town,
  category,
  refreshToken = 0,
  onLoaded,
  onError,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const onLoadedRef = useRef(onLoaded)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onLoadedRef.current = onLoaded
  }, [onLoaded])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/rankings/leaderboard?town=${encodeURIComponent(town)}&category=${encodeURIComponent(category)}`
        )
        if (!response.ok) {
          throw new Error('Failed to load leaderboard')
        }
        const payload = await response.json()
        if (!cancelled) {
          setData(payload)
          onLoadedRef.current?.(payload)
        }
      } catch (err) {
        console.error('[LeaderboardWidget] load failed', err)
        if (!cancelled) {
          setError(err)
          onErrorRef.current?.(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [town, category, refreshToken])

  const topItems = useMemo(() => {
    if (!data?.items) return []
    return data.items.slice(0, 5)
  }, [data])

  const maxScore = useMemo(() => {
    if (!topItems.length) return 0
    return Math.max(...topItems.map((item) => item.score))
  }, [topItems])

  const updatedDisplay = useMemo(() => {
    if (!data?.updatedAt) return null
    const dt = DateTime.fromISO(data.updatedAt)
    if (!dt.isValid) return null
    const relative = dt.toRelative()
    if (relative) return relative
    return dt.toLocaleString(DateTime.DATETIME_MED)
  }, [data])

  return (
    <div className="w-full max-w-xl rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-xl">
      <div className="flex flex-col gap-1">
        <span className="font-display text-sm uppercase tracking-[0.35em] text-emerald-500">Community Rankings</span>
        <h2 className="font-display text-2xl font-semibold text-emerald-900">
          Top {category} in {town} — Community Ranked
        </h2>
        <p className="text-sm text-gray-600">Vote for your favourite slice and see how the rankings change.</p>
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div>
            {[0, 1, 2, 3, 4].map((index) => (
              <SkeletonRow key={index} index={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-rose-600">Rankings unavailable right now. Please try again later.</p>
        )}

        {!loading && !error && topItems.length === 0 && (
          <p className="text-sm text-gray-500">Be the first to vote for your favourite {category.toLowerCase()} spot.</p>
        )}

        {!loading && !error && topItems.length > 0 && (
          <ol className="space-y-3">
            {topItems.map((item, index) => (
              <li key={item.slug} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-emerald-700 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-base font-semibold text-emerald-900">{item.title}</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-700">{item.score}</span>
                </div>
                <ScoreBar value={item.score} max={maxScore} />
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-6 border-t border-emerald-100 pt-3 text-xs text-gray-500">
        {updatedDisplay && <p>Updated {updatedDisplay}</p>}
        <p>Total votes: {data?.totalBallots || 0}</p>
      </div>
    </div>
  )
}
