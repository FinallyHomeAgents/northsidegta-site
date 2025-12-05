import Busboy from 'busboy'
import crypto from 'crypto'
import { put } from '@vercel/blob'

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageFile,
  normalizeExtension,
  normalizeMimeType,
} from '../src/lib/uploadConstants'

export const config = {
  api: {
    // Allow the raw body so Busboy can parse multipart uploads directly.
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
    const file = await parseSingleFile(req)

    if (!file) {
      res.status(400).json({ error: 'No file received' })
      return
    }

    const normalizedContentType = normalizeMimeType(file.mimeType)
    const normalizedName = typeof file.filename === 'string' ? file.filename : 'upload'
    console.log('UPLOAD_DEBUG file', {
      name: normalizedName,
      type: file.mimeType,
      normalizedContentType,
      allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
    })

    const allowed = isAllowedImageFile(normalizedContentType, normalizedName)
    if (!allowed) {
      res.status(415).json({ error: 'Upload a JPG, PNG, or WebP image.' })
      return
    }

    const safeExtension = normalizeExtension(normalizedName) || '.jpg'
    const randomSuffix = crypto.randomBytes(6).toString('hex')
    const pathname = `blob-test/${Date.now()}-${randomSuffix}${safeExtension}`

    const blob = await put(pathname, file.buffer, {
      access: 'public',
      contentType: normalizedContentType || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    res.status(200).json({ url: blob.url })
  } catch (error) {
    console.error('BLOB_TEST_UPLOAD_ERROR', error)
    const status = error?.statusCode || 400
    res.status(status).json({ error: error?.message || 'Upload failed' })
  }
}

function parseSingleFile(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('multipart/form-data')) {
      resolve(null)
      return
    }

    const fields = {}
    const busboy = new Busboy({ headers: req.headers, limits: { files: 1, fileSize: 5 * 1024 * 1024 } })
    let fileBuffer = Buffer.alloc(0)
    let fileName = ''
    let mimeType = ''

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val
    })

    busboy.on('file', (_fieldname, file, filename, _encoding, mimetype) => {
      fileName = filename
      mimeType = mimetype
      file.on('data', (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data])
      })
    })

    busboy.on('finish', () => {
      if (!fileName || !fileBuffer.length) {
        resolve(null)
        return
      }
      resolve({ filename: fileName, mimeType, buffer: fileBuffer, fields })
    })

    busboy.on('error', (err) => reject(err))

    req.pipe(busboy)
  })
}
