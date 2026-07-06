import { getTasteHubPolls } from '../../lib/tastehub/getTasteHubPolls.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  try {
    const polls = await getTasteHubPolls()
    res.status(200).json({ ok: true, polls })
  } catch (error) {
    console.error('[tastehub/polls] failed to load polls', error)
    res.status(500).json({ ok: false, error: 'failed-to-load' })
  }
}
