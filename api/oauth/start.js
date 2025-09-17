// /api/oauth/start.js
export default async function handler(req, res) {
  try {
    const { GITHUB_CLIENT_ID, OAUTH_SCOPE = 'repo,user:email' } = process.env
    if (!GITHUB_CLIENT_ID) {
      return res.status(500).send('Missing GITHUB_CLIENT_ID')
    }

    const state = Math.random().toString(36).slice(2)
    const redirectUri = `${getBaseUrl(req)}/api/oauth/callback`

    const authUrl = new URL('https://github.com/login/oauth/authorize')
    authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', OAUTH_SCOPE)
    authUrl.searchParams.set('state', state)

    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
    )

    return res.redirect(authUrl.toString())
  } catch (e) {
    console.error('[oauth/start] error:', e)
    return res.status(500).send('OAuth start error')
  }
}

function getBaseUrl(req) {
  // If SITE_URL is set (e.g. "https://northsidegta.ca"), use it AS-IS.
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '') // strip trailing slash only
  }

  // Otherwise, build from headers
  const host = req.headers['x-forwarded-host'] || req.headers.host

  const proto =
    req.headers['x-forwarded-proto'] || process.env.SITE_PROTOCOL || 'https'

  return `${proto}://${host}`.replace(/\/+$/, '')
}
