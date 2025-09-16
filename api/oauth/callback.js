// Serverless: Complete GitHub OAuth and hand tokens back to Decap CMS
export default async function handler(req, res) {
  try {
    console.log('[oauth/callback] hit. query:', req.query)

    const { code, state } = req.query
    const cookieState = parseCookie(req.headers.cookie || '').oauth_state
    console.log(
      '[oauth/callback] state from query:',
      state,
      'cookie state:',
      cookieState
    )

    if (!code || !state || state !== cookieState) {
      console.warn('[oauth/callback] invalid state or missing code')
      return res.status(400).send('Invalid OAuth state')
    }

    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error('[oauth/callback] Missing GitHub credentials')
      return res.status(500).send('Missing GitHub credentials')
    }

    console.log('[oauth/callback] exchanging code for token…')
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    )

    const tokenJson = await tokenRes.json()
    console.log(
      '[oauth/callback] token exchange status:',
      tokenRes.status,
      'has token:',
      !!tokenJson.access_token
    )

    if (!tokenJson.access_token) {
      console.error('[oauth/callback] GitHub token exchange failed:', tokenJson)
      return res.status(401).send('GitHub token exchange failed')
    }

    // Write the token in the exact format Decap expects, then complete the handshake.
    // localStorage is shared across same-origin windows, so the parent can read it.
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(`
      <script>
        (function () {
          try {
            // Store as JSON under the standard key
            localStorage.setItem('decap-cms-user', JSON.stringify({
              token: '${tokenJson.access_token}',
              provider: 'github'
            }));
          } catch (e) {}

          function finish() {
            try {
              if (window.opener && !window.opener.closed) {
                // Normal Decap handshake (still do this for compatibility)
                window.opener.postMessage('authorizing:github', '*');
                window.opener.postMessage('authorization:github:success:${tokenJson.access_token}', '*');
                window.close();
                return;
              }
            } catch (e) {}
            // Fallback: opened as a tab → go back to CMS
            document.body.innerHTML = '<p style="font:16px/1.4 system-ui;margin:20px">Login complete. Returning to the CMS…</p>';
            setTimeout(function(){ window.location.href = '/admin/#/'; }, 600);
          }

          // Run immediately; some browsers need a tick before opener is available
          setTimeout(finish, 0);
        })();
      </script>
    `)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return res.status(500).send('OAuth callback error')
  }
}

function parseCookie(cookieStr) {
  return Object.fromEntries(
    (cookieStr || '')
      .split(';')
      .map((v) => v.trim().split('=').map(decodeURIComponent))
      .map(([k, ...r]) => [k, r.join('=')])
  )
}
