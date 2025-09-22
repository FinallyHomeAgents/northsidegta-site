import React from 'react'
import { ExternalLink } from 'lucide-react'

export default function CommunityStories() {
  const [stories, setStories] = React.useState([])
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let cancelled = false
    fetch('/data/community-stories.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load stories')
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        const parsed = Array.isArray(data)
          ? data
              .filter((item) => item && item.tags && item.tags.includes('community'))
              .slice(0, 3)
          : []
        setStories(parsed)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Stories are loading—check back soon.
      </div>
    )
  }

  if (!stories.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Fresh community highlights land here once they’re published.
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stories.map((story) => (
        <article key={story.slug} className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {story.image && (
            <img
              src={story.image}
              alt={story.title}
              className="h-40 w-full object-cover"
              loading="lazy"
            />
          )}
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {new Date(story.publishedAt).toLocaleDateString('en-CA', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{story.title}</h3>
              {story.summary && <p className="text-sm text-slate-600">{story.summary}</p>}
            </div>
            <div className="mt-auto">
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Read story
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
