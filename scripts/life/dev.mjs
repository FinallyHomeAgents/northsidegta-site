import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
process.env.LIFE_LOCAL_DEV = '1'
process.env.LIFE_SESSION_SECRET ||= crypto.randomBytes(32).toString('hex')
process.env.LIFE_LOCAL_DATA ||= path.join(root, '.life-local')
// Node 22 understands the ESM syntax of the existing Vercel API modules.
const { default: handler } = await import('../../api/life.js')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json',
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  res.status = (n) => {
    res.statusCode = n
    return res
  }
  res.json = (v) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(v))
  }
  res.send = (v) => res.end(v)
  try {
    if (
      url.pathname === '/api/life' ||
      url.pathname === '/life/' ||
      url.pathname.startsWith('/life/posts/')
    ) {
      req.query = Object.fromEntries(url.searchParams)
      if (url.pathname === '/life/') req.query.action = 'feed-page'
      if (url.pathname.startsWith('/life/posts/'))
        req.query = { action: 'story', id: url.pathname.split('/').pop() }
      let size = 0
      const chunks = []
      for await (const chunk of req) {
        size += chunk.length
        if (size > 4 * 1024 * 1024) {
          res.status(413).json({ error: 'Image too large.' })
          return
        }
        chunks.push(chunk)
      }
      if (chunks.length) req.body = JSON.parse(Buffer.concat(chunks))
      await handler(req, res)
      return
    }
    if (url.pathname === '/life' || url.pathname === '/life/studio') {
      res.writeHead(302, { Location: url.pathname + '/' })
      res.end()
      return
    }
    const relative =
      decodeURIComponent(url.pathname) +
      (url.pathname.endsWith('/') ? 'index.html' : '')
    const file = path.resolve(root, 'public', '.' + relative)
    if (!file.startsWith(path.join(root, 'public') + path.sep)) {
      res.status(403).end()
      return
    }
    const data = await fs.readFile(file)
    res.setHeader(
      'Content-Type',
      types[path.extname(file)] || 'application/octet-stream'
    )
    res.end(data)
  } catch (e) {
    res
      .status(500)
      .json({ error: 'Local preview could not complete this request.' })
    console.error(e.message)
  }
})
server.listen(Number(process.env.PORT || 4317), '127.0.0.1', () =>
  console.log('NorthSide GTA Life preview: http://127.0.0.1:4317/life/studio/')
)
