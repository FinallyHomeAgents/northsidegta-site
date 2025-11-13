import React, { useCallback, useEffect, useMemo, useState } from 'react'

import LeaderboardWidget from './LeaderboardWidget'
import VoteFormInline from './VoteFormInline'
import { UXBRIDGE_PIZZA_OPTIONS } from '../../data/uxbridgePizzaOptions'

export default function PizzaSection({ town, category }) {
  const normalizedTown = String(town || '').toLowerCase()
  const normalizedCategory = String(category || '').toLowerCase()

  const staticOptions = useMemo(() => {
    if (normalizedTown === 'uxbridge' && normalizedCategory === 'pizza') {
      return UXBRIDGE_PIZZA_OPTIONS.map((option) => ({
        slug: option.id,
        title: option.label,
      }))
    }
    return null
  }, [normalizedTown, normalizedCategory])

  const [places, setPlaces] = useState(() => staticOptions || [])
  const [refreshToken, setRefreshToken] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(!staticOptions)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (staticOptions) {
      setPlaces(staticOptions)
      setIsLoading(false)
      setHasError(false)
    }
  }, [staticOptions])

  const handleLeaderboardLoaded = useCallback((payload) => {
    setIsLoading(false)
    setHasError(false)
    if (!staticOptions && Array.isArray(payload?.items)) {
      setPlaces(payload.items.map((item) => ({ slug: item.slug, title: item.title })))
    }
  }, [staticOptions])

  const handleLeaderboardError = useCallback(() => {
    setIsLoading(false)
    setHasError(!staticOptions)
  }, [staticOptions])

  const handleVoteComplete = useCallback(() => {
    if (!staticOptions) {
      setIsLoading(true)
    }
    setRefreshToken((token) => token + 1)
  }, [staticOptions])

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value)
  }, [])

  return (
    <section id="pizza" className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <LeaderboardWidget
          town={town}
          category={category}
          refreshToken={refreshToken}
          onLoaded={handleLeaderboardLoaded}
          onError={handleLeaderboardError}
        />

        <div className="rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-emerald-900">
                Pizza in {town} — Community Ranked
              </h2>
              <p className="text-sm text-gray-600">
                Vote for your favourite slice and see how the rankings change.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              {isOpen ? 'Hide vote form' : 'Cast your vote'}
            </button>
          </div>

          {isOpen && (
            <div className="mt-6">
              <VoteFormInline
                town={town}
                category={category}
                places={places}
                onVoted={handleVoteComplete}
                onVoteFailed={() => {
                  setIsLoading(true)
                  setRefreshToken((token) => token + 1)
                }}
              />
            </div>
          )}

          {!isOpen && (
            <div className="mt-6 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              {isLoading && !hasError && <p>Loading the ballot…</p>}
              {!isLoading && hasError && (
                <p>We couldn’t load the vote options right now. Please try again shortly.</p>
              )}
              {!isLoading && !hasError && (
                <p>Ready to support your go-to slice? Tap “Cast your vote” to open the ballot.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
