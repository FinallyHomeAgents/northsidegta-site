import { handleUpload } from '@vercel/blob'

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageFile,
  normalizeMimeType,
} from '../src/lib/uploadConstants'

export const config = {
  api: {
    // Allow the raw body so handleUpload can read the request directly.
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN on server' })
    return
  }

  try {
    await handleUpload(req, res, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async ({ filename, contentType }) => {
        const normalizedContentType = normalizeMimeType(contentType)
        console.log('UPLOAD_DEBUG file', {
          name: filename,
          type: contentType,
          normalizedContentType,
          allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
          allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        })

        const normalizedName = typeof filename === 'string' ? filename : 'upload'
        const prefix = 'blob-test/'

        const allowed = isAllowedImageFile(normalizedContentType, normalizedName)
        if (!allowed) {
          const error = new Error('Upload a JPG, PNG, or WebP image.')
          error.statusCode = 415
          throw error
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_MIME_TYPES,
          addRandomSuffix: true,
          pathname: `${prefix}${normalizedName}`,
        }
      },
    })
  } catch (error) {
    console.error('BLOB_TEST_UPLOAD_ERROR', error)
    const status = error?.statusCode || 400
    res.status(status).json({ error: error?.message || 'Upload failed' })
  }
}
