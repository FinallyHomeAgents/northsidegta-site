// /api/sync-now.js
const OWNER = process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER
const REPO = process.env.GITHUB_REPO_NAME || process.env.VERCEL_GIT_REPO_SLUG
const WORKFLOW_FILE = 'events-sync.yml'

async function trigger() {
  const token = process.env.GH_TOKEN
  if (!token || !OWNER || !REPO) {
    return { ok: false, status: 500, body: { error: 'Missing GH_TOKEN/owner/repo' } }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }

  try {
    const wf = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref: 'main' }),
      }
    )

    const rd = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event_type: 'sync_now' }),
    })

    const ok =
      wf.status === 204 ||
      wf.status === 201 ||
      wf.status === 202 ||
      rd.status === 204 ||
      rd.status === 201 ||
      rd.status === 202

    return {
      ok,
      status: ok ? 200 : 502,
      body: { workflowStatus: wf.status, repoDispatchStatus: rd.status },
    }
  } catch (error) {
    console.error('[sync-now] failed to trigger GitHub workflow', error)
    return { ok: false, status: 502, body: { error: 'Failed to trigger sync' } }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (req.headers['x-sync-secret'] !== process.env.SYNC_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const result = await trigger()
  res.status(result.status).json(result.body)
}
