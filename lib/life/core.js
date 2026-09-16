import crypto from 'node:crypto'
export const PEOPLE = ['Matthew', 'Landon']
export const COMMUNITIES = [
  'East Gwillimbury',
  'Newmarket',
  'Aurora',
  'Georgina',
  'Whitchurch-Stouffville',
  'Uxbridge',
  'Scugog',
]
export const DESTINATIONS = [
  { id: 'website', label: 'NorthSide GTA Life', kind: 'Website' },
  {
    id: 'instagram_northside',
    label: '@northsidegta',
    kind: 'Instagram',
    prefix: 'LIFE_NORTHSIDE',
  },
  {
    id: 'facebook_northside',
    label: 'NorthSide GTA',
    kind: 'Facebook Page',
    prefix: 'LIFE_NORTHSIDE',
  },
  {
    id: 'instagram_finallyhome',
    label: '@finallyhomeagents',
    kind: 'Instagram',
    prefix: 'LIFE_FINALLYHOME',
  },
  {
    id: 'facebook_finallyhome',
    label: 'Finally Home Agents',
    kind: 'Facebook Page',
    prefix: 'LIFE_FINALLYHOME',
  },
]
export function safeEqual(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest()
  const y = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(x, y)
}
export function sessionSecret(env) {
  return (
    env.LIFE_SESSION_SECRET ||
    (env.CMS_LOGIN_PASSWORD
      ? crypto
          .createHash('sha256')
          .update(`life-session:${env.CMS_LOGIN_PASSWORD}`)
          .digest('hex')
      : '')
  )
}
export function signSession(user, secret, now = Date.now()) {
  if (!secret) throw new Error('Sign-in is not configured.')
  const body = Buffer.from(
    JSON.stringify({ user, exp: now + 7 * 86400000 })
  ).toString('base64url')
  return `${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}`
}
export function verifySession(token, secret, now = Date.now()) {
  try {
    if (!secret) return null
    const [body, sig, extra] = String(token).split('.')
    if (
      extra ||
      !sig ||
      !safeEqual(
        sig,
        crypto.createHmac('sha256', secret).update(body).digest('base64url')
      )
    )
      return null
    const p = JSON.parse(Buffer.from(body, 'base64url'))
    return PEOPLE.includes(p.user) && p.exp > now ? p.user : null
  } catch {
    return null
  }
}
export const clean = (s, n = 2000) =>
  typeof s === 'string' ? s.trim().slice(0, n) : ''
export function validateDraft(input) {
  const place = clean(input.place, 100),
    community = clean(input.community, 80)
  if (!place) throw new Error('Add the name of the place.')
  if (!COMMUNITIES.includes(community)) throw new Error('Choose a community.')
  if (!input.locationConfirmed)
    throw new Error('Confirm the location before continuing.')
  const photo = clean(input.photo, 2600000)
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo))
    throw new Error('Add a JPEG-compatible photo.')
  const bytes = Buffer.from(photo.split(',')[1], 'base64')
  if (
    bytes.length > 1800000 ||
    bytes[0] !== 255 ||
    bytes[1] !== 216 ||
    bytes[2] !== 255
  )
    throw new Error('Photo is invalid or too large. Try a smaller image.')
  return {
    place,
    community,
    locationConfirmed: true,
    photo,
    notes: clean(input.notes, 1500),
    title: clean(input.title, 90),
    instagram: clean(input.instagram, 2200),
    facebook: clean(input.facebook, 5000),
    website: clean(input.website, 6000),
    alt: clean(input.alt, 500),
    layout: ['editorial', 'minimal', 'postcard'].includes(input.layout)
      ? input.layout
      : 'editorial',
  }
}
export function starterContent(d) {
  return {
    title: `A moment in ${d.place}`.slice(0, 90),
    instagram: `${d.place === d.community ? d.place : d.place + ', ' + d.community}.\n\n${d.notes ? d.notes + '\n\n' : ''}What do you love about this corner of the NorthSide GTA?\n\nMatthew & Landon · Finally Home Agents\n#NorthSideGTALife #NorthSideGTA`,
    facebook: `A local snapshot from ${d.place} in ${d.community}.\n\n${d.notes ? d.notes + '\n\n' : ''}Have a favourite nearby spot? We'd love to hear about it.\n\nMatthew & Landon Mulhall | Finally Home Agents`,
    website: `${d.place} · ${d.community}\n\n${d.notes || 'A local snapshot shared by Matthew and Landon.'}`,
    alt: `Photo taken at ${d.place}, ${d.community}.`,
  }
}
export function destinationReady(d, env) {
  if (d.id === 'website') return true
  const type = d.kind === 'Instagram' ? 'IG_USER_ID' : 'PAGE_ID'
  return Boolean(
    env[`${d.prefix}_${type}`] &&
    env[`${d.prefix}_PAGE_ACCESS_TOKEN`] &&
    env.LIFE_META_GRAPH_VERSION &&
    env.BLOB_READ_WRITE_TOKEN
  )
}
export function publicPost(d) {
  return {
    id: d.id,
    place: d.place,
    community: d.community,
    title: d.title,
    website: d.website,
    alt: d.alt,
    image: d.imageUrl,
    author: d.author,
    publishedAt: d.results?.website?.at,
  }
}
export function escapeHtml(s = '') {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  )
}
