const { randomUUID, createHash } = require('node:crypto');
const PREFIX = 'play-your-budget:v1:';
const COMMUNITIES = new Set(['Georgina', 'East Gwillimbury', 'Newmarket', 'Aurora', 'Stouffville', 'Uxbridge', 'Scugog', 'King', 'Bradford']);
const STATUSES = new Set(['New', 'Contacted', 'Closed']);
const clean = (value, max = 500) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
const money = value => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value);
const validId = value => /^[a-f0-9-]{36}$/i.test(value || '');
const originAllowed = req => {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try { return new URL(origin).host === (req.headers?.host || req.headers?.['x-forwarded-host']); }
  catch { return false; }
};
function createHandler({ getRedis, authorize, fetchImpl = (...args) => fetch(...args), env = process.env, now = () => new Date() }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const action = req.query?.action || 'submit';
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; }
    catch { return res.status(400).json({ ok: false, error: 'Invalid request.' }); }
    if (action !== 'submit') {
      if (!authorize(req)) return res.status(401).json({ ok: false, error: 'Sign in to view leads.' });
      if (action === 'logout' && req.method === 'POST') {
        if (!originAllowed(req)) return res.status(403).json({ ok: false });
        res.setHeader('Set-Cookie', [require('./session.cjs').cookie('', true), 'life_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0']);
        return res.json({ ok: true });
      }
      try {
        const redis = getRedis();
        if (action === 'list' && req.method === 'GET') {
          const offset = Math.max(0, Math.min(100000, Number.parseInt(req.query?.offset, 10) || 0));
          const ids = await redis.zrange(`${PREFIX}index`, offset, offset + 99, { rev: true });
          const rows = ids.length ? await redis.mget(...ids.map(id => `${PREFIX}lead:${id}`)) : [];
          const notifications = ids.length ? await redis.mget(...ids.map(id => `${PREFIX}notification:${id}`)) : [];
          const leads = rows.map((row, index) => row ? { ...row, notificationStatus: notifications[index] || row.notificationStatus } : null).filter(Boolean);
          return res.json({ ok: true, leads, nextOffset: ids.length === 100 ? offset + 100 : null });
        }
        if (action === 'update' && req.method === 'POST') {
          if (!originAllowed(req)) return res.status(403).json({ ok: false, error: 'Request origin not allowed.' });
          if (!validId(body.id) || !STATUSES.has(body.status)) return res.status(400).json({ ok: false, error: 'Choose a valid lead and status.' });
          const key = `${PREFIX}lead:${body.id}`, record = await redis.get(key);
          if (!record) return res.status(404).json({ ok: false, error: 'Lead not found.' });
          record.status = body.status;
          record.notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 6000) : record.notes;
          record.updatedAt = now().toISOString();
          await redis.set(key, record);
          return res.json({ ok: true, lead: record });
        }
        return res.status(405).json({ ok: false, error: 'Method not allowed.' });
      } catch { return res.status(503).json({ ok: false, error: 'Lead storage is temporarily unavailable.' }); }
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'Method not allowed.' }); }
    if (clean(body.botField, 120)) return res.status(200).json({ ok: true });
    const requestType = body.requestType === 'homes' ? 'homes' : 'match';
    const communities = Array.isArray(body.selectedCommunities) ? [...new Set(body.selectedCommunities.filter(v => COMMUNITIES.has(v)))].slice(0, 9) : [];
    const name = clean(body.name, 120), email = clean(body.email, 180).toLowerCase(), budget = Number(body.budget);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true || !Number.isFinite(budget) || budget < 500000 || budget > 4000000) {
      return res.status(400).json({ ok: false, error: 'Please check your name, email, budget and contact consent.' });
    }
    if (requestType === 'homes' && !communities.length) return res.status(400).json({ ok: false, error: 'Choose at least one community.' });
    const date = now();
    const record = {
      id: randomUUID(), name, email, phone: clean(body.phone, 80), budget, budgetLabel: money(budget),
      priorities: Array.isArray(body.priorities) ? body.priorities.map(v => clean(v, 80)).filter(Boolean).slice(0, 4) : [],
      recommendedCommunity: COMMUNITIES.has(body.recommendedCommunity) ? body.recommendedCommunity : '',
      selectedCommunities: communities, requestType, stage: requestType === 'homes' ? 'Homes requested' : 'Match revealed',
      propertyTypes: Array.isArray(body.propertyTypes) ? body.propertyTypes.slice(0, 8).map(v => ({ label: clean(v?.label, 120), status: clean(v?.status, 120) })).filter(v => v.label && v.status) : [],
      source: 'Play Your Budget', pageUrl: clean(body.pageUrl, 500), contactConsent: true,
      status: 'New', notes: '', createdAt: date.toISOString(), updatedAt: date.toISOString(), notificationStatus: 'pending',
    };
    let redis;
    try {
      redis = getRedis();
      const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      const bucket = Math.floor(date.getTime() / 60000);
      const key = `${PREFIX}limit:${createHash('sha256').update(ip).digest('hex')}:${bucket}`;
      const count = Number(await redis.eval("local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 120); end; return n", [key], []));
      if (count > 20) { res.setHeader('Retry-After', '60'); return res.status(429).json({ ok: false, error: 'Please wait a minute before trying again.' }); }
      // Save record and list index together before sending any notification.
      const result = await redis.multi().set(`${PREFIX}lead:${record.id}`, record).zadd(`${PREFIX}index`, { score: date.getTime(), member: record.id }).exec();
      if (result.some(v => v instanceof Error || (v && typeof v === 'object' && v.error))) throw new Error('Storage transaction failed');
    } catch { return res.status(503).json({ ok: false, error: 'We could not save your request. Please try again.' }); }
    const endpoint = (env.FORMSPREE_ENDPOINT || env.FORMSPREE_CONTACT_URL || '').trim();
    try {
      const url = new URL(endpoint);
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Missing notification endpoint');
      const response = await fetchImpl(endpoint, {
        method: 'POST', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: record.name, Email: record.email, Phone: record.phone || 'Not provided', Budget: record.budgetLabel,
          Priorities: record.priorities.join(', ') || 'None selected', 'Recommended community': record.recommendedCommunity || 'No realistic freehold match',
          'Requested communities': communities.join(', ') || record.recommendedCommunity,
          'Freehold property-type fit': record.propertyTypes.map(v => `${v.label}: ${v.status}`).join(' | '),
          Source: record.source, 'Request type': record.stage, 'Page URL': record.pageUrl, 'Submitted date/time': record.createdAt,
          'Contact consent': 'Yes', 'CMS reference': record.id, _replyto: record.email,
          _subject: `Play Your Budget ${record.stage} — ${record.budgetLabel} — ${record.name}`, _gotcha: '',
        }),
      });
      record.notificationStatus = response.ok ? 'sent' : 'failed';
    } catch { record.notificationStatus = 'failed'; }
    try { await redis.set(`${PREFIX}notification:${record.id}`, record.notificationStatus); }
    catch { console.error('[play-your-budget] Could not update notification status', record.id); }
    return res.status(200).json({ ok: true, reference: record.id, notificationSent: record.notificationStatus === 'sent' });
  };
}
module.exports = { createHandler, PREFIX };
