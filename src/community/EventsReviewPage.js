import React from 'react'
import { Helmet } from 'react-helmet-async'
import { DateTime } from 'luxon'

const PASSCODE = (process.env.REACT_APP_EVENTS_REVIEW_PASS || '').trim()
const MODERATOR_SECRET = (process.env.REACT_APP_EVENTS_MODERATOR_SECRET || '').trim()
const ACCESS_KEY = 'eventsReviewAccess'
const TORONTO_ZONE = 'America/Toronto'

function parseDate(value) {
  if (!value) return null
  const dt = DateTime.fromISO(String(value), { setZone: true })
  if (!dt.isValid) return null
  return dt.setZone(TORONTO_ZONE)
}

function getEventTitle(event) {
  return (
    event?.summary ||
    event?.title ||
    event?.name ||
    event?.eventName ||
    event?.slug ||
    'Untitled event'
  )
}

function getLocationLabel(event) {
  const parts = []
  if (event?.town) parts.push(event.town)
  if (event?.region) parts.push(event.region)
  if (event?.locationName) parts.push(event.locationName)
  if (event?.venue) parts.push(event.venue)
  return parts.length ? parts.join(' • ') : 'Location TBA'
}

function formatWhen(event) {
  const start = parseDate(event?.startDate || event?.start)
  const end = parseDate(event?.endDate || event?.end)
  const dateLabel = start?.isValid ? start.toFormat('ccc, MMM d') : 'Date TBA'

  const startTimeLabel = event?.startTime
    ? String(event.startTime)
    : start?.isValid && (start.hour || start.minute)
      ? start.toFormat('h:mm a')
      : ''
  const endTimeLabel = event?.endTime
    ? String(event.endTime)
    : end?.isValid && (end.hour || end.minute)
      ? end.toFormat('h:mm a')
      : ''

  let timeLabel = ''
  if (startTimeLabel && endTimeLabel) {
    timeLabel = `${startTimeLabel} – ${endTimeLabel}`
  } else if (startTimeLabel) {
    timeLabel = startTimeLabel
  }

  return { dateLabel, timeLabel }
}

function getSourceUrl(event) {
  if (event?.sourceUrl) return event.sourceUrl
  if (event?.url) return event.url
  if (event?.link) return event.link
  return ''
}

function compareEvents(a, b) {
  const aDate = parseDate(a?.startDate || a?.start)
  const bDate = parseDate(b?.startDate || b?.start)

  if (aDate && bDate && aDate.toMillis() !== bDate.toMillis()) {
    return aDate.toMillis() - bDate.toMillis()
  }

  if (aDate && !bDate) return -1
  if (!aDate && bDate) return 1

  const aTitle = getEventTitle(a)
  const bTitle = getEventTitle(b)
  return aTitle.localeCompare(bTitle)
}

function sortEvents(list) {
  return [...list].sort(compareEvents)
}

function EventCard({ event, mode, onApprove, onDeny, actionState }) {
  const { dateLabel, timeLabel } = formatWhen(event)
  const sourceUrl = getSourceUrl(event)
  const isSaving = Boolean(actionState?.loading)
  const error = actionState?.error || ''

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">{dateLabel}</div>
          {timeLabel ? <div className="text-sm text-slate-500">{timeLabel}</div> : null}
          <h3 className="text-lg font-semibold text-slate-900">{getEventTitle(event)}</h3>
          <div className="text-sm text-slate-600">{getLocationLabel(event)}</div>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:text-emerald-700"
            >
              View source
              <span aria-hidden="true" className="text-xs">
                ↗
              </span>
            </a>
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="flex flex-col items-stretch gap-2 text-sm font-semibold">
          {mode === 'pending' ? (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onApprove(event)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                ✅ Approve
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onDeny(event)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                ❌ Deny
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onDeny(event)}
              className="rounded-lg bg-rose-600 px-4 py-2 text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
            >
              ❌ Remove from Community
            </button>
          )}
          {isSaving ? <span className="text-xs font-normal text-slate-500">Saving…</span> : null}
        </div>
      </div>
    </article>
  )
}

export default function EventsReviewPage() {
  const [accessState, setAccessState] = React.useState(PASSCODE ? 'checking' : 'granted')
  const [passInput, setPassInput] = React.useState('')
  const [passError, setPassError] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('pending')
  const [pendingEvents, setPendingEvents] = React.useState([])
  const [liveEvents, setLiveEvents] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState('')
  const [actionState, setActionState] = React.useState({})

  React.useEffect(() => {
    if (!PASSCODE) return
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(ACCESS_KEY)
    setAccessState(stored === 'ok' ? 'granted' : 'prompt')
  }, [])

  const fetchList = React.useCallback(async (status) => {
    const response = await fetch(
      `/api/events?scope=upcoming&status=${encodeURIComponent(status)}&includeStatus=true`,
      { cache: 'no-store' }
    )
    if (!response.ok) {
      throw new Error('fetch-failed')
    }
    const payload = await response.json()
    return Array.isArray(payload?.events) ? payload.events : []
  }, [])

  const refreshLists = React.useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [pendingList, liveList] = await Promise.all([fetchList('pending'), fetchList('published')])
      setPendingEvents(sortEvents(pendingList))
      setLiveEvents(sortEvents(liveList))
    } catch (error) {
      console.error('[events-review] failed to load lists', error)
      setLoadError('Unable to load events right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [fetchList])

  React.useEffect(() => {
    if (accessState !== 'granted') return
    refreshLists()
  }, [accessState, refreshLists])

  const handlePassSubmit = React.useCallback(
    (event) => {
      event.preventDefault()
      if (!PASSCODE) {
        setAccessState('granted')
        return
      }
      if (passInput.trim() === PASSCODE) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(ACCESS_KEY, 'ok')
        }
        setAccessState('granted')
        setPassError('')
      } else {
        setPassError('Incorrect passcode. Please try again.')
      }
    },
    [passInput]
  )

  const handleModeration = React.useCallback(
    async (event, action) => {
      const slug = event?.slug
      if (!slug) return
      setActionState((prev) => ({ ...prev, [slug]: { loading: true, error: '' } }))
      try {
        const response = await fetch('/api/events/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, action, secret: MODERATOR_SECRET }),
        })
        if (!response.ok) {
          throw new Error('moderation-failed')
        }
        await response.json()
        setActionState((prev) => ({ ...prev, [slug]: { loading: false, error: '' } }))

        if (action === 'approve') {
          setPendingEvents((list) => list.filter((item) => item.slug !== slug))
          setLiveEvents((list) => {
            const exists = list.some((item) => item.slug === slug)
            if (exists) return sortEvents(list.map((item) => (item.slug === slug ? { ...item, status: 'published' } : item)))
            return sortEvents([...list, { ...event, status: 'published', archived: false }])
          })
        } else {
          setPendingEvents((list) => list.filter((item) => item.slug !== slug))
          setLiveEvents((list) => list.filter((item) => item.slug !== slug))
        }
      } catch (error) {
        console.error('[events-review] moderation failed', error)
        setActionState((prev) => ({
          ...prev,
          [slug]: { loading: false, error: "Couldn't update this event. Please try again." },
        }))
      }
    },
    []
  )

  const currentEvents = activeTab === 'pending' ? pendingEvents : liveEvents

  return (
    <>
      <Helmet>
        <title>Events Review</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Community events</p>
            <h1 className="text-3xl font-bold text-slate-900">Events Review</h1>
            <p className="max-w-3xl text-base text-slate-600">
              Approve new events and manage what’s live on the Community page.
            </p>
          </div>

          {accessState === 'prompt' || accessState === 'checking' ? (
            <form
              onSubmit={handlePassSubmit}
              className="mt-8 max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <label className="block text-sm font-semibold text-slate-800" htmlFor="events-passcode">
                Enter events review passcode
              </label>
              <input
                id="events-passcode"
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                autoComplete="off"
                disabled={accessState === 'checking'}
                placeholder="Passcode"
              />
              {passError ? <p className="text-sm text-rose-600">{passError}</p> : null}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                disabled={accessState === 'checking'}
              >
                Unlock
              </button>
            </form>
          ) : null}

          {accessState === 'granted' ? (
            <div className="mt-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      activeTab === 'pending'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('live')}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      activeTab === 'live'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Live on Community
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  {loading ? 'Loading events…' : `Pending: ${pendingEvents.length} • Live: ${liveEvents.length}`}
                </div>
              </div>

              {loadError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {loadError}
                </div>
              ) : null}

              {!loading && !currentEvents.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600">
                  {activeTab === 'pending'
                    ? 'No pending upcoming events right now.'
                    : 'No published upcoming events to manage.'}
                </div>
              ) : null}

              <div className="space-y-4">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.slug || getEventTitle(event)}
                    event={event}
                    mode={activeTab === 'pending' ? 'pending' : 'live'}
                    onApprove={(item) => handleModeration(item, 'approve')}
                    onDeny={(item) => handleModeration(item, 'deny')}
                    actionState={actionState[event.slug || '']}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}
