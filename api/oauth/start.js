// /api/oauth/start.js
export default async function handler(req, res) {
  const {
    GITHUB_CLIENT_ID,
    OAUTH_SCOPE = 'repo,user:email',
    OAUTH_REDIRECT_URI,
  } = process.env
  if (!GITHUB_CLIENT_ID) return res.status(500).send('Missing GITHUB_CLIENT_ID')
  if (!OAUTH_REDIRECT_URI)
    return res.status(500).send('Missing OAUTH_REDIRECT_URI')

  const state = Math.random().toString(36).slice(2)

  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI) // 👈 Always use this exact value
  authUrl.searchParams.set('scope', OAUTH_SCOPE)
  authUrl.searchParams.set('state', state)

  res.setHeader(
    'Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`
  )

  return res.redirect(authUrl.toString())
}
