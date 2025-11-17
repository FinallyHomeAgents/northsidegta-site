import { getTastehubTownAreas } from '../../../lib/tastehub/townAreas.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method-not-allowed' })
  }

  try {
    const townAreas = await getTastehubTownAreas()
    return res.status(200).json({ ok: true, townAreas })
  } catch (error) {
    console.error('[tastehub/town-areas] failed to load', error)
    return res.status(500).json({ ok: false, error: 'failed-to-load' })
  }
}
