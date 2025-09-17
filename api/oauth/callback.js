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

    // Minimal HTML: save token under both keys, notify opener if present,
    // then ALWAYS land on the CMS list route.
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(`<!doctype html><html><body>
      <script>
        (function () {
          try {
            var payload = JSON.stringify({ token: ${JSON.stringify(
              token
            )}, provider: "github" });
            localStorage.setItem('decap-cms-user', payload);
            localStorage.setItem('netlify-cms-user', payload);

            // If opened as popup, tell the opener in both formats (covers all builds)
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(payload, "*");
                window.opener.postMessage("authorization:github:success:" + ${JSON.stringify(
                  token
                )}, "*");
                window.close();
                return;
              }
            } catch (e) {}

            // Fallback: same-tab
            window.location.replace("/cms/#/collections/collections");
          } catch (e) {
            document.body.textContent = "Token saved, redirecting…";
            setTimeout(function(){ window.location.replace("/cms/#/collections/collections"); }, 200);
          }
        })();
      </script>
    </body></html>`)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return res.status(500).send('OAuth callback error')
  }
}
