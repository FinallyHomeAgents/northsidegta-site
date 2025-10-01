import { handleUpload } from '@vercel/blob/client'

import { readJsonBody } from '../../lib/api-helpers'

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

  try {
    const body = await readJsonBody(req)
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (typeof pathname !== 'string' || !pathname.startsWith('community-events/')) {
          throw new Error('Invalid upload path')
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: false,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
        }
      },
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('[submit-event] failed to prepare upload', error)
    res.status(500).json({ error: 'Unable to prepare image upload.' })
  }
}
