import { getTastehubCategories } from '../../../lib/tastehub/categories.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method-not-allowed' })
  }

  try {
    const categories = await getTastehubCategories()
    return res.status(200).json({ ok: true, categories })
  } catch (error) {
    console.error('[tastehub/categories] failed to load', error)
    return res.status(500).json({ ok: false, error: 'failed-to-load' })
  }
}
