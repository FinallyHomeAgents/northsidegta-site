import { handleUpload } from '@vercel/blob/client'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function resolveToken() {
  const raw = (process.env.BLOB_READ_WRITE_TOKEN || '').trim()
  if (!raw) {
    return { token: '', error: 'missing' }
  }
  if (!raw.startsWith('vercel_blob_rw_')) {
    return { token: '', error: 'invalid-format' }
  }
  return { token: raw, error: '' }
}

function buildCallbackUrl(req) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host
  if (!host) return undefined
  const protocol = req.headers?.['x-forwarded-proto'] || 'https'
  const reqUrl = req.url || ''
  try {
    const parsed = new URL(reqUrl, `${protocol}://${host}`)
    return `${protocol}://${host}${parsed.pathname}${parsed.search}`
  } catch (error) {
    console.warn('[event-image-upload] failed to derive callback URL', { error, reqUrl, host })
    return undefined
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body = await parseJsonBody(req)
    if (!body || typeof body !== 'object' || !body.type) {
      res.status(400).json({ error: 'Invalid upload request.' })
      return
    }

    const { token, error: tokenError } = resolveToken()
    console.log('TOKEN_DEFINED?', Boolean(token))
    if (tokenError) {
      console.error('[event-image-upload] invalid BLOB_READ_WRITE_TOKEN', { tokenError })
      res.status(500).json({ error: 'Upload service is not configured.' })
      return
    }

    const result = await handleUpload({
      token,
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (typeof pathname !== 'string' || !pathname.startsWith('community-events/')) {
          throw new Error('Invalid upload path')
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          callbackUrl: buildCallbackUrl(req),
        }
      },
      onUploadCompleted: ({ blob }) => {
        console.log('[event-image-upload] upload completed', {
          url: blob?.url,
          path: blob?.pathname,
        })
      },
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('[event-image-upload] failed to prepare upload', error)
    res.status(500).json({ error: 'Unable to prepare image upload.' })
  }
}

async function parseJsonBody(req) {
  try {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    if (!chunks.length) return {}
    const buffer = Buffer.concat(chunks)
    const text = buffer.toString('utf8')
    if (!text) return {}
    return JSON.parse(text)
  } catch (error) {
    console.warn('[event-image-upload] failed to parse request body', error)
    return {}
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
