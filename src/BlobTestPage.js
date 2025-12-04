import React from 'react'
import { upload } from '@vercel/blob/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

function createUploadPath(file) {
  const extensionFromType = file.type.split('/').pop() || 'bin'
  const sanitizedExt = extensionFromType.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin'
  const uniqueId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
  return `blob-test/${Date.now()}-${uniqueId}.${sanitizedExt}`
}

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorText('Upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorText('Uploads are limited to 5MB.')
      return
    }

    setStatus('Uploading...')
    try {
      const pathname = createUploadPath(file)
      const response = await upload(pathname, file, {
        access: 'public',
        contentType: file.type,
        handleUploadUrl: '/api/blob-test-upload',
      })

      const uploadedUrl = response?.url || response?.downloadUrl || ''
      setResultText(JSON.stringify({ uploadedUrl, response }, null, 2))
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
        <input type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleFileChange} />
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
