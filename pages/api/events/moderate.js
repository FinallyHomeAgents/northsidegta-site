import fs from 'fs'
import path from 'path'

import { sanitizeEventId } from '../../../lib/admin-events.js'
import { readJsonBody } from '../../../lib/api-helpers.js'
import {
  applyRepoChanges as baseApplyRepoChanges,
  buildEventPath as baseBuildEventPath,
  buildPendingEventPath as baseBuildPendingEventPath,
  fetchEventFileFromGithub as baseFetchEventFileFromGithub,
  fetchPendingEventFileFromGithub as baseFetchPendingEventFileFromGithub,
  getGithubEnvConfig as baseGetGithubEnvConfig,
} from '../../../lib/github-admin.js'

const adminOverrides = globalThis.__eventsModerationGithubAdmin__ || {}
const applyRepoChanges = adminOverrides.applyRepoChanges || baseApplyRepoChanges
const buildEventPath = adminOverrides.buildEventPath || baseBuildEventPath
const buildPendingEventPath =
  adminOverrides.buildPendingEventPath || baseBuildPendingEventPath
const fetchEventFileFromGithub =
  adminOverrides.fetchEventFileFromGithub || baseFetchEventFileFromGithub
const fetchPendingEventFileFromGithub =
  adminOverrides.fetchPendingEventFileFromGithub || baseFetchPendingEventFileFromGithub
const getGithubEnvConfig = adminOverrides.getGithubEnvConfig || baseGetGithubEnvConfig

const EVENTS_DIR = path.join(process.cwd(), 'public/data/events')
const PENDING_DIR = path.join(process.cwd(), 'public/data/events-pending')

function eventExists(slug) {
  return (
    fs.existsSync(path.join(EVENTS_DIR, `${slug}.json`)) ||
    fs.existsSync(path.join(PENDING_DIR, `${slug}.json`))
  )
}

function parseAction(value) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().toLowerCase()
  if (normalized === 'approve' || normalized === 'deny') return normalized
  return ''
}

function buildModerationMessage(slug, status) {
  const verb = status === 'published' ? 'approve' : 'deny'
  return {
    message: `chore(events-moderation): ${verb} ${slug}`,
    description:
      status === 'published'
        ? 'Approve event via moderation UI.'
        : 'Deny or remove event via moderation UI.',
  }
}

function buildUpdatedEvent(event, slug, status) {
  const next = { ...(event || {}), slug: event?.slug || slug, status }
  if (status === 'archived') {
    next.archived = true
  }
  return next
}

async function persistModerationChange({
  slug,
  status,
  existing,
  pending,
}) {
  const { message, description } = buildModerationMessage(slug, status)

  if (existing) {
    const updated = buildUpdatedEvent(existing.json, slug, status)
    const content = `${JSON.stringify(updated, null, 2)}\n`
    return applyRepoChanges({
      message,
      description,
      changes: [{ path: existing.path, content }],
    })
  }

  const livePath = buildEventPath(slug)
  if (pending) {
    const updated = buildUpdatedEvent(pending.json, slug, status)
    const content = `${JSON.stringify(updated, null, 2)}\n`
    return applyRepoChanges({
      message,
      description,
      changes: [
        { path: pending.path, delete: true },
        { path: livePath, content },
      ],
    })
  }

  const missing = new Error('Unable to locate event to update.')
  missing.status = 404
  throw missing
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (error) {
    res.status(400).json({ ok: false, error: error?.message || 'Invalid request body.' })
    return
  }

  const secret = process.env.EVENTS_MODERATOR_SECRET
  const providedSecret = body?.secret

  if (!secret) {
    res.status(500).json({ ok: false, error: 'Server missing moderator secret.' })
    return
  }

  if (!providedSecret || providedSecret !== secret) {
    res.status(401).json({ ok: false, error: 'Invalid or missing moderation secret.' })
    return
  }

  const slug = sanitizeEventId(body?.slug)
  const action = parseAction(body?.action)
  if (!slug || !action) {
    res.status(400).json({ ok: false, error: 'Missing slug or action.' })
    return
  }

  if (!eventExists(slug)) {
    res.status(404).json({ ok: false, error: 'Event does not exist.' })
    return
  }

  const config = getGithubEnvConfig()
  if (!config) {
    res.status(500).json({ ok: false, error: 'GITHUB_CONFIG_MISSING' })
    return
  }

  const targetStatus = action === 'approve' ? 'published' : 'archived'

  try {
    const existing = await fetchEventFileFromGithub(slug).catch((error) => {
      if (error?.status === 404) return null
      throw error
    })

    const pending = existing
      ? null
      : await fetchPendingEventFileFromGithub(slug).catch((error) => {
          if (error?.status === 404) return null
          throw error
        })

    if (!existing && !pending) {
      res.status(404).json({ ok: false, error: 'Event not found.' })
      return
    }

    await persistModerationChange({ slug, status: targetStatus, existing, pending })

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ ok: true, slug, status: targetStatus })
  } catch (error) {
    console.error('[events-moderate] failed to update status', { slug, action }, error)
    const statusCode = error?.status && Number.isInteger(error.status) ? error.status : 500
    res.status(statusCode).json({ ok: false, error: error?.message || 'Failed to update event.' })
  }
}
