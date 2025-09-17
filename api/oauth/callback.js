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

    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.status(500).send('Missing GitHub credentials')
    }

    // Exchange code -> token (GitHub recommends form-encoded + Accept: application/json)
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

    // Return a tiny HTML page that:
    // 1) Stores the token under BOTH keys (decap + legacy netlify key)
    // 2) Posts BOTH message formats to the opener (JSON + legacy string)
    // 3) Closes popup if possible, else redirects the tab back to /admin
    const html = `<!doctype html>
<html>
  <body>
    <script>
      (function () {
        try {
          var payload = JSON.stringify({ token: ${JSON.stringify(
            token
          )}, provider: "github" });

          // Store under BOTH keys so any build of Decap/Netlify CMS can find it
          localStorage.setItem('decap-cms-user', payload);
          localStorage.setItem('netlify-cms-user', payload);

          // If opened as a popup, notify the opener using BOTH formats
          if (window.opener && !window.opener.closed && typeof window.opener.postMessage === "function") {
            // New-style JSON message (Decap 3.x expects to JSON.parse this string)
            window.opener.postMessage(payload, "*");
            // Legacy message some builds/plugins still handle
            window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(
              token
            )}, "*");
            // Attempt to close the popup
            try { window.close(); } catch (e) {}
            return;
          }
        } catch (e) {
          // swallow and fall through
        }

        // Fallback when opened as a full tab:
        // send the user back to the admin; CMS will read localStorage on load
        window.location.replace("/admin/#/");
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
