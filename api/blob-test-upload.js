import { handleUpload } from '@vercel/blob/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  if (!chunks.length) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  console.log('BLOB_TEST_TOKEN_DEFINED', Boolean(process.env.BLOB_READ_WRITE_TOKEN))
  console.log('BLOB_TEST_RUNTIME', process.env.NEXT_RUNTIME || 'node')
  console.log('BLOB_TEST_METHOD', req.method)
  console.log('BLOB_TEST_CONTENT_TYPE', req.headers?.['content-type'])

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
    if (!body || typeof body !== 'object' || !body.type) {
      res.status(400).json({ error: 'Invalid upload request body' })
      return
    }
  } catch (error) {
    console.error('BLOB_TEST_PARSE_ERROR', error)
    res.status(400).json({ error: 'Invalid upload request body' })
    return
  }

  try {
    const result = await handleUpload({
      request: req,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_SIZE_BYTES,
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      }),
      onUploadCompleted: ({ blob }) => {
        console.log('BLOB_TEST_UPLOAD_COMPLETED', {
          url: blob?.url,
          path: blob?.pathname,
        })
      },
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('BLOB_TEST_UPLOAD_ERROR', error)
    res.status(500).json({
      error: error?.message || 'Upload failed',
      reason: 'handle-upload-failed',
    })
  }
}
