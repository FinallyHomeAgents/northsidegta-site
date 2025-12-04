import Busboy from 'busboy'
import { put } from '@vercel/blob'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const DEFAULT_PREFIX = 'blob-test'

export const config = {
  api: {
    bodyParser: false,
  },
}

function buildBlobKey(prefix, filename, mimeType) {
  const safePrefix = prefix && prefix.startsWith(`${DEFAULT_PREFIX}`) ? prefix : DEFAULT_PREFIX
  const extFromMime = mimeType?.split('/').pop() || ''
  const extFromName = filename?.includes('.') ? filename.split('.').pop() : ''
  const ext = (extFromMime || extFromName || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin'
  const unique = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex')
  return `${safePrefix}/${Date.now()}-${unique}.${ext}`
}

function parseMultipartRequest(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: MAX_SIZE_BYTES, fields: 5 },
    })

    const fields = {}
    let fileBuffer = null
    let mimeType = ''
    let filename = ''
    let fileReceived = false

    busboy.on('file', (fieldname, file, name, _encoding, type) => {
      if (fileReceived || fieldname !== 'file') {
        file.resume()
        return
      }

      fileReceived = true
      mimeType = type || 'application/octet-stream'
      filename = name || 'upload.bin'

      const chunks = []
      file.on('data', (data) => chunks.push(data))
      file.on('limit', () => reject(new Error('File exceeds maximum size')))
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks)
      })
    })

    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('error', (error) => reject(error))
    busboy.on('finish', () => {
      if (!fileReceived || !fileBuffer) {
        reject(new Error('No file provided'))
        return
      }
      resolve({ fileBuffer, mimeType, filename, fields })
    })

    req.pipe(busboy)
  })
}

export default async function handler(req, res) {
  console.log('BLOB_TEST_TOKEN_DEFINED', Boolean(process.env.BLOB_READ_WRITE_TOKEN))
  console.log('BLOB_TEST_RUNTIME', process.env.NEXT_RUNTIME || 'node')
  console.log('BLOB_TEST_METHOD', req.method)
  console.log('BLOB_TEST_CONTENT_TYPE', req.headers?.['content-type'])
  console.log('BLOB_TEST_ALLOWED_TYPES', ALLOWED_TYPES)

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
    res.status(500).json({ error: 'Blob token missing on server' })
    return
  }

  try {
    const { fileBuffer, mimeType, filename, fields } = await parseMultipartRequest(req)
    console.log('BLOB_TEST_DERIVED_MIME', mimeType)

    if (!ALLOWED_TYPES.includes(mimeType)) {
      res.status(400).json({ error: 'Unsupported file type' })
      return
    }

    const requestedPrefix = typeof fields?.pathPrefix === 'string' ? fields.pathPrefix : DEFAULT_PREFIX
    const blobKey = buildBlobKey(requestedPrefix, filename, mimeType)

    if (!blobKey.startsWith(`${DEFAULT_PREFIX}/`)) {
      res.status(400).json({ error: 'Invalid upload path' })
      return
    }

    const uploadResult = await put(blobKey, fileBuffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    })

    res.status(200).json({
      url: uploadResult?.url,
      pathname: uploadResult?.pathname,
      runtime: process.env.NEXT_RUNTIME || 'node',
      tokenDefined: true,
    })
  } catch (error) {
    console.error('BLOB_TEST_UPLOAD_ERROR', error)
    res.status(500).json({ error: error?.message || 'Upload failed', tokenDefined: Boolean(process.env.BLOB_READ_WRITE_TOKEN) })
  }
}
