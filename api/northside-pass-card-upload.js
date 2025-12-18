import { put } from '@vercel/blob'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
}

function isValidDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/png;base64,')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    return
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    res.status(500).json({ ok: false, error: 'Blob storage is not configured.' })
    return
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Invalid JSON body' })
    return
  }

  const membershipId = (body.membershipId || '').toString().trim()
  const imageDataUrl = body.imageDataUrl

  if (!membershipId || !isValidDataUrl(imageDataUrl)) {
    res.status(400).json({ ok: false, error: 'Missing or invalid membershipId or imageDataUrl.' })
    return
  }

  try {
    const base64 = imageDataUrl.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')
    const path = `northside-pass/cards/${membershipId}.png`

    const { url } = await put(path, buffer, {
      access: 'public',
      contentType: 'image/png',
      token,
    })

    res.status(200).json({ ok: true, cardUrl: url })
  } catch (error) {
    console.error('[northside-pass-card-upload] upload failed', error)
    res.status(502).json({ ok: false, error: 'Unable to upload card image.' })
  }
}
