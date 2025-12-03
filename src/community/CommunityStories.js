import React from 'react'

const CTA_CARDS = [
  {
    title: 'Where to Live in the NorthSide GTA in 2026',
    body: 'Moving north of Toronto? This guide breaks down each NorthSide GTA town so you can find the community that fits your lifestyle, commute, and budget.',
    cta: 'Read the guide',
    href: '/insights/where-to-live-in-the-northside-gta-2026-guide-for-toronto-movers',
  },
  {
    title: 'Who Makes the Best Pizza in the NorthSide GTA? 🍕',
    body: 'Explore live community rankings for pizza, wings, date-night spots and more. Cast your vote and see who’s climbing the leaderboard.',
    cta: 'View the rankings',
    href: '/tastehub',
  },
  {
    title: 'Add Your Event to the Community Calendar',
    body: 'Hosting a market, concert, fundraiser, sports event, or workshop? Submit your event and we’ll feature it on the NorthSide GTA Community Calendar.',
    cta: 'Submit your event',
    href: '/community/submit-event',
  },
]

export default function CommunityStories() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CTA_CARDS.map((card) => (
        <article
          key={card.title}
          className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-600">{card.body}</p>
          </div>
          <div className="pt-6">
            <a
              href={card.href}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              {card.cta}
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}
