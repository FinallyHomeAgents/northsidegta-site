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

    // CSRF state cookie (HttpOnly so JS can’t tamper; Lax is fine for same-site)
    res.setHeader(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure`
    )

    // Go to GitHub
    return res.redirect(authUrl.toString())
  } catch (e) {
    console.error('[oauth/start] error:', e)
    return res.status(500).send('OAuth start error')
  }
}

function getBaseUrl(req) {
  // Prefer your production URL, then Vercel’s forwarded host, then Host header
  const host =
    process.env.SITE_URL || req.headers['x-forwarded-host'] || req.headers.host

  const proto =
    process.env.SITE_PROTOCOL || req.headers['x-forwarded-proto'] || 'https'

  // Ensure no trailing slash
  return `${proto}://${host}`.replace(/\/+$/, '')
}
