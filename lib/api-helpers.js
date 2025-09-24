export async function readJsonBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      const trimmed = req.body.trim()
      if (!trimmed) return {}
      try {
        return JSON.parse(trimmed)
      } catch (error) {
        throw new Error('Invalid JSON body')
      }
    }
    if (typeof req.body === 'object') {
      return req.body
    }
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}
