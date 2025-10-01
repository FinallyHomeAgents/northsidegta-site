import { DateTime } from 'luxon'

import {
  loadPendingEventsFromDisk,
  sanitizeEventId,
  TORONTO_TIME_ZONE,
} from '../../../lib/admin-events'

function normalizePendingEvent(raw) {
  if (!raw || typeof raw !== 'object') return null
  const slug = sanitizeEventId(raw.slug || raw.id || raw.filePath || raw.__filename)
  if (!slug) return null
  const start = typeof raw.startDate === 'string' ? raw.startDate : ''
  const end = typeof raw.endDate === 'string' ? raw.endDate : ''
  const startDt = start ? DateTime.fromISO(start, { zone: TORONTO_TIME_ZONE }) : null
  const submitted = typeof raw.submittedAt === 'string' ? raw.submittedAt : ''
  const submittedDt = submitted ? DateTime.fromISO(submitted, { zone: TORONTO_TIME_ZONE }) : null
  return {
    slug,
    title: typeof raw.title === 'string' ? raw.title : 'Untitled event',
    status: typeof raw.status === 'string' ? raw.status : 'pending',
    startDate: start,
    endDate: end,
    submittedAt: submitted,
    organizerName: typeof raw.organizerName === 'string' ? raw.organizerName : '',
    organizerEmail: typeof raw.organizerEmail === 'string' ? raw.organizerEmail : '',
    town: typeof raw.town === 'string' ? raw.town : '',
    venueName: typeof raw.locationName === 'string' ? raw.locationName : '',
    priceType: typeof raw.priceType === 'string' ? raw.priceType : '',
    priceFrom: typeof raw.priceFrom === 'string' ? raw.priceFrom : '',
    categoryTags: Array.isArray(raw.categoryTags) ? raw.categoryTags : [],
    audienceTags: Array.isArray(raw.audienceTags) ? raw.audienceTags : [],
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    submittedTimestamp: submittedDt?.isValid
      ? submittedDt.toMillis()
      : startDt?.isValid
      ? startDt.toMillis()
      : Number.MAX_SAFE_INTEGER,
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let events = []
  try {
    events = loadPendingEventsFromDisk()
  } catch (error) {
    console.error('[pending-events] failed to load pending submissions', error)
    res.status(500).json({ error: 'Failed to load pending submissions.' })
    return
  }

  const normalized = events
    .map((raw) => normalizePendingEvent(raw))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.submittedTimestamp !== b.submittedTimestamp) {
        return a.submittedTimestamp - b.submittedTimestamp
      }
      return a.title.localeCompare(b.title)
    })

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ events: normalized })
}
