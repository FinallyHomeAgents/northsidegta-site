import { handleUpload } from '@vercel/blob/client'

import { ALLOWED_IMAGE_MIME_TYPES } from '../src/lib/uploadConstants'

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

  try {
    const response = await handleUpload(req, {
      onBeforeGenerateToken: async ({ filename, contentType }) => {
        console.log('UPLOAD_DEBUG allowedTypes', ALLOWED_IMAGE_MIME_TYPES)
        const normalizedContentType = (contentType || '').split(';')[0]
        console.log('UPLOAD_DEBUG file', { name: filename, type: contentType })

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedContentType)) {
          const error = new Error('Upload a JPG, PNG, or WebP image.')
          error.statusCode = 415
          throw error
        }

        const normalizedName = typeof filename === 'string' ? filename : 'upload'
        const prefix = 'blob-test/'

        return {
          allowedContentTypes: ALLOWED_IMAGE_MIME_TYPES,
          pathname: `${prefix}${normalizedName}`,
          addRandomSuffix: true,
        }
      },
    })

    const status = response instanceof Response ? response.status : 200
    const body = response instanceof Response ? await response.json() : response

    res.status(status).json(body)
  } catch (error) {
    console.error('BLOB_TEST_UPLOAD_ERROR', error)
    const status = error?.statusCode || 400
    res.status(status).json({ error: error?.message || 'Upload failed' })
  }
}
