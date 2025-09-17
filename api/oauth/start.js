// /api/oauth/start.js
export default async function handler(req, res) {
  try {
    const { GITHUB_CLIENT_ID, OAUTH_SCOPE = 'repo,user:email' } = process.env
    if (!GITHUB_CLIENT_ID)
      return res.status(500).send('Missing GITHUB_CLIENT_ID')

    const hostUrl = getBaseUrl(req) // e.g. "https://northsidegta.ca"
    const redirectUri = hostUrl + '/api/oauth/callback'

    // CSRF state (MUST be non-empty)
    const state = Math.random().toString(36).slice(2)

    // Set cookie so callback can verify it’s the same value
    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
    )

    // Build GitHub authorize URL
    const auth = new URL('https://github.com/login/oauth/authorize')
    auth.searchParams.set('client_id', GITHUB_CLIENT_ID)
    auth.searchParams.set('redirect_uri', redirectUri)
    auth.searchParams.set('scope', OAUTH_SCOPE)
    auth.searchParams.set('state', state)

    console.log('[oauth/start] redirecting to:', auth.toString())
    return res.redirect(auth.toString())
  } catch (err) {
    console.error('[oauth/start] error:', err)
    return res.status(500).send('OAuth start error')
  }
}

function getBaseUrl(req) {
  const siteUrl =
    process.env.SITE_URL && process.env.SITE_URL.replace(/\/+$/, '')
  if (siteUrl) return siteUrl

  const proto =
    (req.headers['x-forwarded-proto'] || '').split(',')[0] ||
    process.env.SITE_PROTOCOL ||
    'https'
  const host =
    (req.headers['x-forwarded-host'] || '').split(',')[0] || req.headers.host

  return `${proto}://${host}`.replace(/\/+$/, '')
}
