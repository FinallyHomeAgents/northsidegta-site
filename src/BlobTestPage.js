import React from 'react'

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  isAllowedImageFile,
  normalizeExtension,
  normalizeMimeType,
} from './lib/uploadConstants'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPT_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`),
]

export default function BlobTestPage() {
  const [status, setStatus] = React.useState('Idle')
  const [resultText, setResultText] = React.useState('')
  const [errorText, setErrorText] = React.useState('')

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    setErrorText('')
    setResultText('')
    if (!file) return

    const normalizedMime = normalizeMimeType(file.type)
    const normalizedExtension = normalizeExtension(file.name)
    if (!isAllowedImageFile(normalizedMime, normalizedExtension)) {
      setErrorText('Upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorText('Uploads are limited to 5MB.')
      return
    }

    setStatus('Uploading...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pathPrefix', 'blob-test')

      const response = await fetch('/api/blob-test-upload', {
        method: 'POST',
        body: formData,
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json?.error || 'Upload failed')
      }

      const uploadedUrl = json?.url
      setResultText(JSON.stringify({ uploadedUrl, response: json }, null, 2))
      setStatus('Success')
    } catch (error) {
      console.error('BLOB_TEST_UPLOAD_FAILED', error)
      setErrorText(error?.message || 'Upload failed')
      try {
        const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        setResultText(serialized)
      } catch (serializationError) {
        setResultText(String(error))
      }
      setStatus('Error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Blob Upload Test</h1>
      <p className="text-gray-700">Use this page to verify client → API → Blob uploads.</p>

      <div>
        <input type="file" accept={ACCEPT_TYPES.join(',')} onChange={handleFileChange} />
      </div>

      <div className="p-3 rounded border bg-gray-50">
        <strong>Status:</strong> {status}
      </div>

      {errorText && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800">{errorText}</div>
      )}

      <div className="p-3 rounded border bg-gray-900 text-green-100 whitespace-pre-wrap break-words">
        {resultText || 'No result yet.'}
      </div>
    </div>
  )
}
