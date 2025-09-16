// Redirect the browser to GitHub's OAuth authorize screen.
export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.PUBLIC_BASE_URL}/api/oauth/callback`;
  const scope = "repo,user:email";
  const state = Math.random().toString(36).slice(2); // basic CSRF token

  res.setHeader("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const url =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;

  res.writeHead(302, { Location: url });
  res.end();
}