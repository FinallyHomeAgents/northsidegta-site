import crypto from 'crypto'
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

function verifyPassUploadToken(token, membershipId) {
  const secret = process.env.PASS_UPLOAD_SECRET
  if (typeof secret !== 'string' || secret.length < 32) return false

  if (typeof token !== 'string') return false

  const [payloadBase, signature] = token.split('.')
  if (!payloadBase || !signature) return false

  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadBase).digest('base64url')
  const providedSig = Buffer.from(signature)
  const expectedSig = Buffer.from(expectedSignature)

  if (providedSig.length !== expectedSig.length) return false
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return false

  let payload
  try {
    payload = JSON.parse(Buffer.from(payloadBase, 'base64url').toString('utf8'))
  } catch (error) {
    return false
  }

  if (!payload || payload.cardNumber !== membershipId) return false
  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return false

  return true
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
  const passUploadToken = body.passUploadToken

  if (!membershipId || !isValidDataUrl(imageDataUrl)) {
    res.status(400).json({ ok: false, error: 'Missing or invalid membershipId or imageDataUrl.' })
    return
  }

  const isAuthorized = verifyPassUploadToken(passUploadToken, membershipId)
  if (!isAuthorized) {
    res.status(401).json({ ok: false, error: 'Unauthorized upload attempt.' })
    return
  }

  try {
    const base64 = imageDataUrl.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')
    const uniqueSuffix = crypto.randomBytes(4).toString('hex')
    const path = `northside-pass/cards/${membershipId}-${uniqueSuffix}.png`

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
