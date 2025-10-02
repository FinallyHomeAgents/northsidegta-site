const { parse } = require('node-html-parser')

const DEFAULT_MAX_HTML_ITEMS = 40

function getAdapter(name) {
  return ADAPTERS[name] || null
}

function toArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function safeJoin(values, separator = ', ') {
  return toArray(values)
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(separator)
}

function toISODate(value) {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return ''
  const parsed = new Date(text)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    const fromNumber = new Date(numeric)
    if (!Number.isNaN(fromNumber.getTime())) {
      return fromNumber.toISOString()
    }
  }
  return ''
}

async function wordpressTribe(feed, context) {
  const results = []
  let page = 1
  let nextUrl = context.resolveUrl(
    feed.endpoint || '/wp-json/tribe/events/v1/events?paged=1'
  )

  const perPage = Number.isFinite(feed.perPage) ? feed.perPage : 50
  const maxPages = Number.isFinite(feed.maxPages) ? feed.maxPages : 4
  const startDate = feed.startDate || context.now.toISOString()

  while (nextUrl && page <= maxPages) {
    const urlObj = new URL(nextUrl)
    if (!urlObj.searchParams.has('per_page')) {
      urlObj.searchParams.set('per_page', String(perPage))
    }
    if (!urlObj.searchParams.has('page')) {
      urlObj.searchParams.set('page', String(page))
    }
    if (!urlObj.searchParams.has('start_date')) {
      urlObj.searchParams.set('start_date', startDate)
    }

    const data = await context.fetchJson(urlObj.toString(), {
      headers: context.jsonHeaders(feed),
    })

    if (!data || (!Array.isArray(data.events) && !Array.isArray(data.data))) {
      break
    }

    const payload = Array.isArray(data.events) ? data.events : data.data

    for (const event of payload) {
      if (!event) continue
      const venue = event.venue || (Array.isArray(event.venues) ? event.venues[0] : null)
      const organizer = event.organizer || (Array.isArray(event.organizers) ? event.organizers[0] : null)

      const addressParts = []
      if (venue) {
        ;['address', 'address_1', 'address1', 'address2', 'city', 'province', 'state', 'postal_code', 'zip'].forEach(
          (key) => {
            if (venue[key]) addressParts.push(venue[key])
          }
        )
      }

      results.push({
        title: event.title || event.name,
        description: event.description || event.excerpt || '',
        summary: event.excerpt || '',
        start: event.utc_start_date || event.start_date || event.start,
        end: event.utc_end_date || event.end_date || event.end,
        locationName: venue?.venue || venue?.name || '',
        address: addressParts.join(', '),
        town: venue?.city || feed.town,
        subArea:
          venue && feed.town && venue.city && venue.city.toLowerCase() !== feed.town.toLowerCase()
            ? venue.city
            : '',
        url: event.url || event.link,
        image: event.image?.url || event.featured_image?.url || event.image_url || '',
        priceType: event.cost && /free/i.test(event.cost) ? 'Free' : '',
        priceNote: event.cost_details
          ? safeJoin(
              event.cost_details.map((item) =>
                [item.currency_symbol, item.cost].filter(Boolean).join('').trim()
              )
            )
          : event.cost || '',
        organizerName: organizer?.organizer || organizer?.name || '',
        organizerUrl: organizer?.website || organizer?.url || '',
        category: Array.isArray(event.categories) && event.categories[0]?.name
          ? event.categories[0].name
          : feed.category,
        badges: feed.badges || [],
        sourceUrl: feed.sourceUrl,
      })
    }

    if (data.next_rest_url) {
      nextUrl = context.resolveUrl(data.next_rest_url)
      page += 1
    } else {
      break
    }
  }

  return results
}

async function universeSearch(feed, context) {
  const baseUrl = context.resolveUrl(feed.apiUrl || feed.url || 'https://www.universe.com/api/v2/events/search')
  const url = new URL(baseUrl)

  if (feed.lat && feed.lng) {
    url.searchParams.set('lat', String(feed.lat))
    url.searchParams.set('lng', String(feed.lng))
  }
  if (feed.radius) {
    url.searchParams.set('radius', String(feed.radius))
  }
  if (!url.searchParams.has('per_page')) {
    url.searchParams.set('per_page', String(feed.perPage || 50))
  }
  if (!url.searchParams.has('page')) {
    url.searchParams.set('page', '1')
  }
  if (!url.searchParams.has('sort')) {
    url.searchParams.set('sort', 'start_at')
  }

  const data = await context.fetchJson(url.toString(), {
    headers: context.jsonHeaders(feed),
  })

  if (!data) return []

  const eventsArray = Array.isArray(data.events)
    ? data.events
    : Array.isArray(data.data)
      ? data.data
      : []

  return eventsArray
    .filter(Boolean)
    .map((event) => {
      const venue = event.venue || event.location || {}
      const addressParts = []
      ;['address', 'address_1', 'address1', 'address2', 'city', 'state', 'province', 'postal_code', 'zip'].forEach(
        (key) => {
          if (venue[key]) addressParts.push(venue[key])
        }
      )

      return {
        title: event.name || event.title,
        description: event.description || '',
        summary: event.short_description || '',
        start: event.start_at || event.start_date,
        end: event.end_at || event.end_date,
        locationName: venue.name || venue.title || '',
        address: addressParts.join(', '),
        town: venue.city || feed.town,
        url: event.web_uri || event.url,
        image: event.image?.url || event.poster?.url || '',
        priceType: event.is_free ? 'Free' : '',
        priceNote: event.price_range || '',
        badges: feed.badges || [],
        sourceUrl: event.web_uri || event.url,
      }
    })
}

async function simpleHtmlList(feed, context) {
  const html = await context.fetchText(feed.url, {
    headers: context.htmlHeaders(feed),
  })

  if (!html) return []

  const config = feed.html || {}
  const root = safeParseHtml(html, config)
  if (!root) return []

  const items = []
  const itemSelector = config.itemSelector || 'article, li, .event-item'
  const nodes = safeQuerySelectorAll(root, itemSelector).slice(0, config.maxItems || DEFAULT_MAX_HTML_ITEMS)

  for (const node of nodes) {
    const titleNode = config.titleSelector
      ? safeQuerySelector(node, config.titleSelector)
      : findFirst(node, ['h3 a', 'h2 a', 'h3', 'h2', '.event-title a', '.event-title'])
    if (!titleNode) continue

    const linkNode = getAttribute(titleNode, 'href') ? titleNode : safeQuerySelector(titleNode, 'a') || titleNode
    const rawLink = getAttribute(linkNode, 'href')

    const summaryNode = config.summarySelector
      ? safeQuerySelector(node, config.summarySelector)
      : safeQuerySelector(node, 'p, .excerpt, .summary')
    const dateNode = config.dateSelector
      ? safeQuerySelector(node, config.dateSelector)
      : safeQuerySelector(node, 'time, .event-date')
    const timeAttr = getAttribute(dateNode, 'datetime')
    const dateText = timeAttr || getNodeText(dateNode)

    const locationNode = config.locationSelector
      ? safeQuerySelector(node, config.locationSelector)
      : safeQuerySelector(node, '.event-location, .location, address')
    const imageNode = config.imageSelector
      ? safeQuerySelector(node, config.imageSelector)
      : safeQuerySelector(node, 'img')

    const start = parseDateFromText(dateText, config)
    if (!start) continue

    const endText =
      getAttribute(dateNode, 'data-end') ||
      (config.endDateSelector ? getNodeText(safeQuerySelector(node, config.endDateSelector)) : '')

    const imageSrc = getAttribute(imageNode, 'src')

    items.push({
      title: getNodeText(titleNode),
      summary: getNodeText(summaryNode),
      description: getNodeText(summaryNode),
      start,
      end: parseDateFromText(endText, config) || '',
      url: context.resolveUrl(rawLink),
      locationName: getNodeText(locationNode),
      image: imageSrc ? context.resolveUrl(imageSrc) : '',
      town: config.town || feed.town,
      subArea: config.subArea || '',
      badges: feed.badges || [],
      priceType: feed.priceType,
    })
  }

  return items
}

function findFirst(root, selectors) {
  for (const selector of selectors) {
    const node = safeQuerySelector(root, selector)
    if (node) return node
  }
  return null
}

function safeParseHtml(html, config = {}) {
  const trimmed = typeof html === 'string' ? html.trim() : ''
  if (!trimmed) return null

  try {
    return parse(trimmed, {
      lowerCaseTagName: false,
      comment: false,
      blockTextElements: {
        script: true,
        noscript: true,
        style: true,
      },
      pre: config.preservePreformatted === true,
    })
  } catch (error) {
    console.warn('[event-source-adapters] Failed to parse HTML feed:', error.message)
    return null
  }
}

function safeQuerySelector(root, selector) {
  if (!root || typeof root.querySelector !== 'function' || !selector) return null
  try {
    return root.querySelector(selector)
  } catch (error) {
    return null
  }
}

function safeQuerySelectorAll(root, selector) {
  if (!root || typeof root.querySelectorAll !== 'function' || !selector) return []
  try {
    const result = root.querySelectorAll(selector)
    return Array.isArray(result) ? result : result || []
  } catch (error) {
    return []
  }
}

function getNodeText(node) {
  if (!node) return ''
  const candidates = ['text', 'innerText', 'rawText']
  for (const key of candidates) {
    if (typeof node[key] === 'string') {
      const value = node[key].trim()
      if (value) return value
    }
  }
  if (typeof node.toString === 'function') {
    const value = String(node.toString()).trim()
    if (value) return value
  }
  return ''
}

function getAttribute(node, name) {
  if (!node || typeof node.getAttribute !== 'function' || !name) return ''
  try {
    return node.getAttribute(name) || ''
  } catch (error) {
    return ''
  }
}

function parseDateFromText(text, config) {
  if (!text) return ''
  const trimmed = String(text).trim()
  if (!trimmed) return ''
  if (config && typeof config.parseDate === 'function') {
    const result = config.parseDate(trimmed)
    if (result) return toISODate(result)
  }

  // Attempt to split on separators if multiple dates exist
  const candidate = trimmed.split(/[|•\n]/)[0].trim()
  return toISODate(candidate)
}

const ADAPTERS = {
  wordpressTribe,
  universeSearch,
  simpleHtmlList,
}

module.exports = {
  getAdapter,
}
