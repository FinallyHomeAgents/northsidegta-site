import { createHash, randomUUID } from 'node:crypto';
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
export function createSpamGuard({ env = process.env, fetchImpl = (...args) => fetch(...args) } = {}) {
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
  return async function guard(req, body, payload) {
    if (!env.TURNSTILE_SECRET_KEY) throw unavailable();
    const allowedHosts = new Set(['northsidegta.ca', 'www.northsidegta.ca']);
    // Only explicitly provisioned preview hosts, never arbitrary request headers.
    if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) allowedHosts.add(env.VERCEL_URL);
    const origin = req.headers.origin;
    try { const u = new URL(origin); if (u.protocol !== 'https:' || !allowedHosts.has(u.host)) throw Error(); }
    catch { throw new SpamError(403, 'Please submit this form from northsidegta.ca.'); }
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const [count, ttl] = await command('EVAL', RATE_SCRIPT, 1, `homepage:attempt:${hash(ip)}`, 600);
    if (count > 20) throw new SpamError(429, 'Please wait before trying again, or contact us directly.', Math.max(1, ttl));
    if (typeof body.turnstileToken !== 'string' || !body.turnstileToken || body.turnstileToken.length > 2048) throw new SpamError(400, 'Please complete the bot check and try again.');
    let verified;
    try {
      const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: body.turnstileToken, remoteip: ip }), signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw Error(); verified = await response.json();
    } catch { throw unavailable(); }
    if (!verified.success || !allowedHosts.has(verified.hostname) || verified.action !== 'homepage_lead') throw new SpamError(400, 'The bot check expired or failed. Please try again.');
    const normalizedContact = payload.contact.includes('@') ? payload.contact.toLowerCase() : payload.contact.replace(/\D/g, '');
    const key = `homepage:duplicate:${hash(JSON.stringify([payload.name.toLowerCase(), normalizedContact, payload.community]))}`;
    const owner = randomUUID();
    const held = await command('SET', key, owner, 'NX', 'EX', 60);
    if (held !== 'OK') {
      const state = await command('GET', key);
      if (state === 'done') return { duplicate: true };
      throw new SpamError(429, 'Your request is still being processed. Please wait before retrying.', 60);
    }
    const release = () => command('EVAL', RELEASE_SCRIPT, 1, key, owner);
    try {
      const [contactCount, contactTtl] = await command('EVAL', RATE_SCRIPT, 1, `homepage:contact:${hash(normalizedContact)}`, 3600);
      if (contactCount > 5) throw new SpamError(429, 'Please wait before sending another request, or contact us directly.', Math.max(1, contactTtl));
    } catch (e) { await release().catch(() => {}); throw e; }
    return { duplicate: false, release, complete: () => command('EVAL', COMPLETE_SCRIPT, 1, key, owner) };
  };
}
