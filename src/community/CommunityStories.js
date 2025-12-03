import React from 'react'
import { getSeoImageForPath } from '../lib/seoImage'

const DEFAULT_FEATURED_IMAGE = '/Images/hero-about.jpg'

const FEATURED_CARDS = [
  {
    id: 'where-to-live-2026',
    title: 'Where to Live in the NorthSide GTA in 2026',
    description:
      'Moving north of Toronto? This guide breaks down each NorthSide GTA town so you can find the community that fits your lifestyle, commute, and budget.',
    href: '/insights/where-to-live-in-the-northside-gta-2026-guide-for-toronto-movers',
    seoPath: '/insights/where-to-live-in-the-northside-gta-2026-guide-for-toronto-movers',
    cta: 'Read the guide',
  },
  {
    id: 'tastehub-best-pizza',
    title: 'Who Makes the Best Pizza in the NorthSide GTA? 🍕',
    description:
      'Explore live community rankings for pizza, wings, date-night spots and more. Cast your vote and see who’s climbing the leaderboard.',
    href: '/tastehub',
    seoPath: '/tastehub',
    cta: 'View the rankings',
  },
  {
    id: 'submit-event',
    title: 'Add Your Event to the Community Calendar',
    description:
      'Hosting a market, concert, fundraiser, sports event, or workshop? Submit your event and we’ll feature it on the NorthSide GTA Community Calendar.',
    href: '/community/submit-event',
    seoPath: '/community/submit-event',
    cta: 'Submit your event',
  },
].map((card) => ({
  ...card,
  imageSrc: getSeoImageForPath(card.seoPath),
}))

export default function CommunityStories() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {FEATURED_CARDS.map((card) => {
        const imageSrc = card.imageSrc || DEFAULT_FEATURED_IMAGE

        return (
          <a
            key={card.id}
            href={card.href}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-[0_10px_30px_rgba(2,6,23,0.35)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#32610E]/70 hover:shadow-[0_20px_40px_rgba(2,6,23,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#32610E] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transform-none motion-reduce:shadow-none motion-reduce:transition-none"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl rounded-b-none">
              <img
                src={imageSrc}
                alt={card.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-transparent" />
              <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-100">
                <span className="inline-block h-2 w-2 rounded-full bg-[#32610E]" />
                <span>NorthSide GTA</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-6 p-8">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold leading-snug text-slate-50">{card.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{card.description}</p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 transition-colors duration-200 group-hover:bg-[#32610E] group-hover:text-white group-focus-visible:bg-[#32610E] group-focus-visible:text-white">
                  {card.cta}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
