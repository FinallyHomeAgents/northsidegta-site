// Cache the public app shell only. Never cache sessions, drafts, or API responses.
const CACHE = 'northside-life-shell-v1'
const SHELL = [
  '/life/studio/',
  '/life/studio/style.css',
  '/life/studio/app.js',
  '/life/studio/photo.js',
  '/life/studio/icon.svg',
]
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('northside-life-shell-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
  )
})
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (
    e.request.method !== 'GET' ||
    url.origin !== location.origin ||
    !SHELL.includes(url.pathname)
  )
    return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
