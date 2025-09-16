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

    if (!code || !state || state !== savedState) {
      return res.status(400).send('Invalid OAuth state')
    }

    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_SCOPE } = process.env
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.status(500).send('Missing GitHub credentials')
    }

    // Exchange code -> token (use form-encoded per GitHub docs)
    const tokenResp = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    )

    const data = await tokenResp.json()
    if (!data.access_token) {
      return res.status(401).send('GitHub token exchange failed')
    }

    const token = data.access_token

    // IMPORTANT: send a JSON string via postMessage that Decap can JSON.parse(...)
    const html = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        try {
          // Optional: keep this for your own debugging/compat
          localStorage.setItem('decap-cms-user', JSON.stringify({
            token: ${JSON.stringify(token)},
            provider: "github"
          }));
        } catch (e) {}

        var payload = JSON.stringify({ token: ${JSON.stringify(
          token
        )}, provider: "github" });

        // Send only the JSON payload (no custom "authorization:...:success" strings)
        if (window.opener && typeof window.opener.postMessage === "function") {
          window.opener.postMessage(payload, "*");
        }

        // Close the popup
        window.close();
      })();
    </script>
    You can close this window.
  </body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return res.status(500).send('OAuth callback error')
  }
}
