import { handleUpload } from '@vercel/blob'

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageFile,
  normalizeMimeType,
} from '../../src/lib/uploadConstants'

const ALLOWED_PREFIX = 'community-events/'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  console.log('EVENT_UPLOAD_TOKEN_DEFINED', Boolean(process.env.BLOB_READ_WRITE_TOKEN))
  console.log('EVENT_UPLOAD_RUNTIME', process.env.NEXT_RUNTIME || 'node')
  console.log('EVENT_UPLOAD_METHOD', req.method)
  console.log('EVENT_UPLOAD_CONTENT_TYPE', req.headers?.['content-type'])

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN on server' })
    return
  }

  try {
    await handleUpload(req, res, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async ({ filename, contentType, pathname }) => {
        const normalizedContentType = normalizeMimeType(contentType)
        console.log('UPLOAD_DEBUG file', {
          name: filename,
          type: contentType,
          normalizedContentType,
          pathname,
          allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
          allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        })

        const normalizedName = typeof filename === 'string' ? filename : 'upload'
        const providedPath = typeof pathname === 'string' ? pathname : ''
        const safePath = providedPath.startsWith(ALLOWED_PREFIX)
          ? providedPath
          : `${ALLOWED_PREFIX}${normalizedName}`

        const allowed = isAllowedImageFile(normalizedContentType, normalizedName)
        if (!allowed) {
          const error = new Error('Upload a JPG, PNG, or WebP image.')
          error.statusCode = 415
          throw error
        }

        if (!safePath.startsWith(ALLOWED_PREFIX)) {
          const error = new Error('Invalid upload path')
          error.statusCode = 400
          throw error
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_MIME_TYPES,
          addRandomSuffix: true,
          pathname: safePath,
        }
      },
    })
  } catch (error) {
    console.error('EVENT_UPLOAD_ERROR', error)
    const status = error?.statusCode || 400
    res.status(status).json({ error: error?.message || 'Unable to prepare image upload.' })
  }
}
