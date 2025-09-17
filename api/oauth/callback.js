// /api/oauth/callback.js

function getCookie(req, name) {
  const cookie = req.headers.cookie || ''
  return cookie
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(name + '='))
    ?.split('=')[1]
}

export default async function handler(req, res) {
  try {
    const { code, state } = req.query || {}
    const savedState = getCookie(req, 'oauth_state')

    console.log('[oauth/callback] hit', { hasCode: !!code, state, savedState })

    if (!code || !state || state !== savedState) {
      console.warn('[oauth/callback] invalid state or missing code')
      return res.status(400).send('Invalid OAuth state')
    }

    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error('[oauth/callback] Missing GitHub credentials')
      return res.status(500).send('Missing GitHub credentials')
    }

    // Exchange code -> token (per GitHub docs)
    console.log('[oauth/callback] exchanging code for token…')
    const tokenResp = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: { Accept: 'application/json' }, // response as JSON
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    )

    const data = await tokenResp.json()
    console.log(
      '[oauth/callback] token exchange status:',
      tokenResp.status,
      'has token:',
      !!data.access_token
    )

    if (!data.access_token) {
      console.error('[oauth/callback] GitHub token exchange failed:', data)
      return res.status(401).send('GitHub token exchange failed')
    }

    const token = data.access_token

    // HTML does three things:
    // 1) Stores token under BOTH keys (decap + legacy netlify)
    // 2) PostMessages BOTH formats to opener (JSON + legacy string)
    // 3) If not a popup, redirect straight to /cms/#/collections/collections
    const html = `<!doctype html>
<html><body>
<script>
(function () {
  try {
    var payload = JSON.stringify({ token: ${JSON.stringify(
      token
    )}, provider: "github" });

    // Store under both keys
    localStorage.setItem('decap-cms-user', payload);
    localStorage.setItem('netlify-cms-user', payload);

    // If opened as a popup, notify opener (both formats) and close
    if (window.opener && !window.opener.closed && typeof window.opener.postMessage === "function") {
      try { window.opener.postMessage('authorizing:github', '*'); } catch (e) {}
      try { window.opener.postMessage(payload, '*'); } catch (e) {}
      try { window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(
        token
      )}, '*'); } catch (e) {}

      try { window.close(); return; } catch (e) {}
    }
  } catch (e) {
    // fall through to redirect
  }
  // Fallback when opened as a full tab: go straight to Collections UI
  window.location.replace('/cms/#/collections/collections');
})();
</script>
You can close this window.
</body></html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return res.status(500).send('OAuth callback error')
  }
}
