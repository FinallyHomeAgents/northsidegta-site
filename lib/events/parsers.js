const Parser = require('rss-parser')
const ical = require('node-ical')
const { parse } = require('node-html-parser')
const { normalizeEvent } = require('./normalize')

const rssParser = new Parser({
  customFields: {
    item: [
      'content:encoded',
      'event:startdate',
      'event:enddate',
      'startdate',
      'enddate',
      'startDate',
      'endDate',
    ],
  },
})

async function parseWithStrategy(strategy, context) {
  const { buffer, text, source } = context
  switch (strategy) {
    case 'ics':
      return parseIcs(text || buffer?.toString('utf8'), source)
    case 'rss':
      return parseRss(text || buffer?.toString('utf8'), source)
    case 'jsonld':
      return parseJsonLd(text || buffer?.toString('utf8'), source)
    case 'json_api':
      return parseJsonApi(text || buffer?.toString('utf8'), source)
    default:
      return { events: [], errors: [`strategy_not_implemented:${strategy}`] }
  }
}

function parseIcs(content, source) {
  const payload = { events: [], errors: [] }
  if (!content) {
    payload.errors.push('empty_content')
    return payload
  }

  try {
    const data = ical.sync.parseICS(content)
    for (const item of Object.values(data)) {
      if (!item || item.type !== 'VEVENT') continue
      const isAllDay = item.datetype === 'date' || item.params?.VALUE === 'DATE'
      const startValue = isAllDay ? formatDateOnly(item.start) : item.start
      const endValue = isAllDay ? formatDateOnly(item.end) : item.end
      const normalized = normalizeEvent({
        source,
        title: item.summary,
        description: item.description,
        start: startValue,
        end: endValue,
        url: item.url || item.source || item.href,
        location: item.location,
        allDay: isAllDay,
        data: { uid: item.uid },
      })
      payload.events.push(normalized)
    }
  } catch (error) {
    payload.errors.push(error.message)
  }
  return payload
}

async function parseRss(content, source) {
  const payload = { events: [], errors: [] }
  if (!content) {
    payload.errors.push('empty_content')
    return payload
  }

  try {
    const feed = await rssParser.parseString(content)
    if (Array.isArray(feed.items)) {
      for (const item of feed.items) {
        const start =
          item.isoDate ||
          item['event:startdate'] ||
          item['startdate'] ||
          item['startDate']
        const end = item['event:enddate'] || item['enddate'] || item['endDate']
        const normalized = normalizeEvent({
          source,
          title: item.title,
          description: item.contentSnippet || item.content || item['content:encoded'],
          start,
          end,
          url: item.link,
          data: { guid: item.guid },
        })
        payload.events.push(normalized)
      }
    }
  } catch (error) {
    payload.errors.push(error.message)
  }
  return payload
}

function parseJsonLd(content, source) {
  const payload = { events: [], errors: [] }
  if (!content) {
    payload.errors.push('empty_content')
    return payload
  }

  try {
    const root = parse(content)
    const scripts = root.querySelectorAll('script[type="application/ld+json"]')
    for (const script of scripts) {
      const raw = script.text.trim()
      if (!raw) continue
      try {
        const data = JSON.parse(raw)
        const entries = Array.isArray(data) ? data : [data]
        for (const entry of entries) {
          if (!entry || typeof entry !== 'object') continue
          if (entry['@type'] === 'Event' ||
              (Array.isArray(entry['@type']) && entry['@type'].includes('Event')) ||
              entry['@type']?.type === 'Event') {
            const normalized = normalizeEvent({
              source,
              title: entry.name,
              description: entry.description,
              start: entry.startDate,
              end: entry.endDate,
              url: entry.url || entry['@id'],
              location: extractLocation(entry.location),
              data: { raw: entry },
            })
            payload.events.push(normalized)
          } else if (entry['@graph']) {
            const graphEntries = Array.isArray(entry['@graph']) ? entry['@graph'] : [entry['@graph']]
            for (const node of graphEntries) {
              if (!node) continue
              if (node['@type'] === 'Event' ||
                  (Array.isArray(node['@type']) && node['@type'].includes('Event'))) {
                const normalized = normalizeEvent({
                  source,
                  title: node.name,
                  description: node.description,
                  start: node.startDate,
                  end: node.endDate,
                  url: node.url || node['@id'],
                  location: extractLocation(node.location),
                  data: { raw: node },
                })
                payload.events.push(normalized)
              }
            }
          }
        }
      } catch (error) {
        payload.errors.push(`json_parse:${error.message}`)
      }
    }
  } catch (error) {
    payload.errors.push(error.message)
  }
  return payload
}

function parseJsonApi(content, source) {
  const payload = { events: [], errors: [] }
  if (!content) {
    payload.errors.push('empty_content')
    return payload
  }

  try {
    const data = JSON.parse(content)
    const events = Array.isArray(data) ? data : Array.isArray(data.events) ? data.events : []
    for (const item of events) {
      if (!item) continue
      const normalized = normalizeEvent({
        source,
        title: item.title || item.name,
        description: item.description,
        start: item.start || item.startDate,
        end: item.end || item.endDate,
        url: item.url || item.link,
        location: item.location,
        data: { raw: item },
      })
      payload.events.push(normalized)
    }
  } catch (error) {
    payload.errors.push(error.message)
  }

  return payload
}

function extractLocation(location) {
  if (!location) return null
  if (typeof location === 'string') return { name: location }
  if (Array.isArray(location)) {
    return extractLocation(location[0])
  }
  if (typeof location === 'object') {
    return {
      name: location.name,
      address: location.address || location.streetAddress,
      city: location.addressLocality,
      province: location.addressRegion,
      postalCode: location.postalCode,
    }
  }
  return null
}

function formatDateOnly(date) {
  if (!(date instanceof Date)) return null
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

module.exports = {
  parseWithStrategy,
}
