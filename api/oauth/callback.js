// Exchange ?code for an access token, then hand it back to Netlify CMS.
export default async function handler(req, res) {
  try {
    const { code, state } = req.query || {};
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map(c => c.trim().split("=")).filter(x => x.length === 2)
    );
    if (!code || !state || !cookies.oauth_state || cookies.oauth_state !== state) {
      return res.status(400).send("OAuth state mismatch.");
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.PUBLIC_BASE_URL}/api/oauth/callback`,
        state
      })
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return res.status(500).send("OAuth exchange failed.");
    }

    // Netlify CMS expects a small HTML page that calls postMessage with the { token }
    const html = `<!doctype html>
<html><body><script>
  (function() {
    function send() {
      if (window.opener) {
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify({token: '${tokenJson.access_token}'}),
          '*'
        );
        window.close();
      }
    }
    send();
    setTimeout(send, 500);
  })();
</script></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (e) {
    console.error(e);
    return res.status(500).send("OAuth error.");
  }
}