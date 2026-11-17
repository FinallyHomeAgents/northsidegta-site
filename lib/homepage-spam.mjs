import { createHash, randomUUID, randomBytes } from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest('hex');
export const RATE_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {count, redis.call('TTL', KEYS[1])}
`;
const RELEASE_SCRIPT = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`;
const COMPLETE_SCRIPT = `if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], 'done', 'EX', 600) return 1 end return 0`;
export class SpamError extends Error {
  constructor(status, message, retryAfter) { super(message); this.status = status; this.retryAfter = retryAfter; }
}
const unavailable = () => new SpamError(503, 'The form is temporarily unavailable. Please email contact@finallyhomeagents.com or call 647-668-4646.');
export function createFormProtection({ env = process.env, fetchImpl = (...args) => fetch(...args), now = Date.now } = {}) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  async function command(...args) {
    if (!url || !token || !/^https:\/\//.test(url)) throw unavailable();
    try {
      const r = await fetchImpl(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw Error('storage');
      const data = await r.json(); if (data.error) throw Error('storage'); return data.result;
    } catch { throw unavailable(); }
  }
  // Separate preview and production data even when both use the same Redis database.
  const namespace = env.VERCEL_ENV === 'preview' ? `homepage:preview:${hash(env.VERCEL_URL || 'local')}` : 'homepage';
  function context(req, challenge = false) {
    const allowedHosts = new Set(['northsidegta.ca', 'www.northsidegta.ca']);
    if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) allowedHosts.add(env.VERCEL_URL);
    // Fetch GET may omit Origin; Referer is checked only on challenge issuance.
    const origin = req.headers.origin || (challenge ? req.headers.referer : '');
    try { const u = new URL(origin); if (u.protocol !== 'https:' || !allowedHosts.has(u.host)) throw Error(); }
    catch { throw new SpamError(403, 'Please submit this form from northsidegta.ca.'); }
    return hash(String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim());
  }
  async function limited(key, max, seconds) {
    const [count, ttl] = await command('EVAL', RATE_SCRIPT, 1, key, seconds);
    if (count > max) throw new SpamError(429, 'Please wait before trying again, or contact us directly.', Math.max(1, ttl));
  }
  async function issue(req) {
    const ip = context(req, true);
    await limited(`${namespace}:issue:${ip}`, 300, 600);
    const token = randomBytes(32).toString('hex');
    await command('SET', `${namespace}:challenge:${hash(token)}`, JSON.stringify({ip, issued: now()}), 'EX', 3600);
    return {token, readyAfterMs: 1000};
  }
  async function guard(req, body, payload) {
    const ip = context(req);
    await limited(`${namespace}:attempt:${ip}`, 20, 600);
    if (typeof body.formToken !== 'string' || !/^[a-f0-9]{64}$/.test(body.formToken)) throw new SpamError(400, 'Please refresh the form and try again.');
    const challengeKey = `${namespace}:challenge:${hash(body.formToken)}`;
    // Atomic compare + delete prevents replay, including concurrent requests.
    const consume = `local v = redis.call('GET', KEYS[1])
if not v then return 0 end
local c = cjson.decode(v)
if c.ip ~= ARGV[1] then return 0 end
if tonumber(ARGV[2]) - c.issued < 1000 then return -1 end
redis.call('DEL', KEYS[1])
return 1`;
    const valid = await command('EVAL', consume, 1, challengeKey, ip, now());
    if (valid !== 1) throw new SpamError(400, 'The form check expired or failed. Please try again.');
    const normalizedContact = payload.contact.includes('@') ? payload.contact.toLowerCase() : payload.contact.replace(/\D/g, '');
    const key = `${namespace}:duplicate:${hash(JSON.stringify([payload.name.toLowerCase(), normalizedContact, payload.community]))}`;
    const owner = randomUUID();
    const held = await command('SET', key, owner, 'NX', 'EX', 60);
    if (held !== 'OK') {
      const state = await command('GET', key);
      if (state === 'done') return { duplicate: true };
      throw new SpamError(429, 'Your request is still being processed. Please wait before retrying.', 60);
    }
    const release = () => command('EVAL', RELEASE_SCRIPT, 1, key, owner);
    try {
      const [contactCount, contactTtl] = await command('EVAL', RATE_SCRIPT, 1, `${namespace}:contact:${hash(normalizedContact)}`, 3600);
      if (contactCount > 5) throw new SpamError(429, 'Please wait before sending another request, or contact us directly.', Math.max(1, contactTtl));
    } catch (e) { await release().catch(() => {}); throw e; }
    return { duplicate: false, release, complete: () => command('EVAL', COMPLETE_SCRIPT, 1, key, owner) };
  }
  return { issue, guard };
}
export function createSpamGuard(options) { return createFormProtection(options).guard; }
