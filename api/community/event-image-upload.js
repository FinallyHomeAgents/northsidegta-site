import { handleUpload } from '@vercel/blob/client'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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

  const body = await parseJsonBody(req)
  if (!body || typeof body !== 'object' || !body.type) {
    res.status(400).json({ error: 'Invalid upload request.' })
    return
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error('[event-image-upload] missing BLOB_READ_WRITE_TOKEN env var')
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
