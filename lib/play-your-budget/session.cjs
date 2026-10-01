const { createHash, createHmac, timingSafeEqual } = require('node:crypto');
const COOKIE = 'cms_leads_session';
function secret(env) {
  return env.CMS_SESSION_SECRET || (env.CMS_LOGIN_PASSWORD ? createHash('sha256').update(`cms-leads:${env.CMS_LOGIN_PASSWORD}`).digest('hex') : '');
}
function signSession(env, now = Date.now()) {
  const key = secret(env);
  if (!key) throw new Error('CMS sign-in is not configured.');
  const body = Buffer.from(JSON.stringify({ scope: 'cms-leads', exp: now + 7 * 86400000 })).toString('base64url');
  return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`;
}
function verifySession(req, env, now = Date.now()) {
  try {
    const key = secret(env);
    if (!key) return false;
    const token = String(req.headers?.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    const [body, signature, extra] = String(token).split('.');
    if (!body || !signature || extra) return false;
    const expected = createHmac('sha256', key).update(body).digest('base64url');
    const actualBuffer = Buffer.from(signature), expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return false;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return data.scope === 'cms-leads' && data.exp > now;
  } catch { return false; }
}
function cookie(value, clear = false) {
  return `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : 7 * 86400}`;
}
module.exports = { signSession, verifySession, cookie };
