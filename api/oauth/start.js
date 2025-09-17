// /api/oauth/start.js
export default async function handler(req, res) {
  try {
    const { GITHUB_CLIENT_ID, OAUTH_SCOPE = 'repo,user:email' } = process.env
    if (!GITHUB_CLIENT_ID)
      return res.status(500).send('Missing GITHUB_CLIENT_ID')

    // Build your site base URL (prefer explicit SITE_URL, else proxy headers, else host)
    const hostUrl = getBaseUrl(req) // e.g. "https://northsidegta.ca"
    const redirectUri = hostUrl + '/api/oauth/callback' // NO trailing slash, NO double https

    // CSRF state cookie
    const state = Math.random().toString(36).slice(2)
    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
    )

    // Authorize URL to GitHub
    const auth = new URL('https://github.com/login/oauth/authorize')
    auth.searchParams.set('client_id', GITHUB_CLIENT_ID)
    auth.searchParams.set('redirect_uri', redirectUri)
    auth.searchParams.set('scope', OAUTH_SCOPE)
    auth.searchParams.set('state', state)

    return res.redirect(auth.toString())
  } catch (err) {
    console.error('[oauth/start] error:', err)
    return res.status(500).send('OAuth start error')
  }
}

function getBaseUrl(req) {
  // If SITE_URL is set (e.g. "https://northsidegta.ca"), use it AS-IS (strip trailing slash only)
  const siteUrl =
    process.env.SITE_URL && process.env.SITE_URL.replace(/\/+$/, '')
  if (siteUrl) return siteUrl

  // Otherwise derive from headers (works on Vercel)
  const proto =
    (req.headers['x-forwarded-proto'] || '').split(',')[0] ||
    process.env.SITE_PROTOCOL ||
    'https'

  const host =
    (req.headers['x-forwarded-host'] || '').split(',')[0] || req.headers.host

  // Normalize & return
  return `${proto}://${host}`.replace(/\/+$/, '')
}
