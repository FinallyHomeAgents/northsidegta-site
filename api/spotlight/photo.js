async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  const photoParam = Array.isArray(req.query?.photo) ? req.query.photo[0] : req.query?.photo
  const photoPath = typeof photoParam === 'string' ? photoParam : null

  if (!photoPath) {
    res.status(400).json({ ok: false, error: 'Missing photo path' })
    return
  }

  const apiKey = (process.env.GOOGLE_PLACES_API_KEY || '').trim()
  if (!apiKey) {
    res.status(500).json({ ok: false, error: 'Missing Google Places API key' })
    return
  }

  const url = `https://places.googleapis.com/v1/${photoPath}/media?maxWidthPx=800&key=${apiKey}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const status = response.status === 404 ? 404 : response.status || 502
      res.status(status).json({ ok: false, error: 'Unable to fetch photo' })
      return
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type')

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(200).send(buffer)
  } catch (error) {
    console.warn('[spotlight] photo proxy failed', error)
    res.status(502).json({ ok: false, error: 'Failed to load photo' })
  }
}

module.exports = handler
