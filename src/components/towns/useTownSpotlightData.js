import { useEffect, useState } from 'react'

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function useTownSpotlightData(townSlug) {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const slug = normalizeSlug(townSlug)
    if (!slug) {
      setItems([])
      setLoaded(true)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function load() {
      setLoaded(false)
      try {
        const response = await fetch(`/api/spotlight/town?slug=${encodeURIComponent(slug)}`, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error('Failed to load spotlight data')
        }
        const payload = await response.json()
        if (!cancelled) {
          setItems(Array.isArray(payload?.items) ? payload.items : [])
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        if (!cancelled) {
          console.warn('[spotlight] unable to load cached data', error)
          setItems([])
        }
      } finally {
        if (!cancelled) {
          setLoaded(true)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [townSlug])

  return { items, loaded }
}
