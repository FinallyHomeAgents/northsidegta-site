const { createHash, randomUUID } = require('node:crypto');
const { comparisonRows, MIN_VALUE, MAX_VALUE } = require('../../src/lib/buyingPower.cjs');
const market = require('../../src/data/marketData.v2.json');
const clean = (v, max = 200) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';
const money = n => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
const hash = v => createHash('sha256').update(v).digest('hex');

function createHandler({ getRedis, fetchImpl = (...args) => fetch(...args), env = process.env, now = () => new Date() }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { return res.status(400).json({ ok: false, error: 'Please check your details and try again.' }); }
    if (!body || typeof body !== 'object') return res.status(400).json({ ok: false });
    if (clean(body.nickname)) return res.status(200).json({ ok: true, emailSent: false });
    const email = clean(body.email, 180).toLowerCase();
    const name = clean(body.name, 100);
    const address = clean(body.address, 250);
    const phone = clean(body.phone, 40);
    const type = body.leadType;
    const value = Number(body.estimatedValue);
    const preference = ['email', 'phone', 'text'].includes(body.contactPreference) ? body.contactPreference : 'email';
    if (!['comparison', 'valuation'].includes(type) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !Number.isFinite(value) || value < MIN_VALUE || value > MAX_VALUE ||
        (type === 'valuation' && (!name || !address || body.contactConsent !== true)) ||
        (preference !== 'email' && phone.replace(/\D/g, '').length < 10)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email, comparison value, and the required contact details.' });
    }
    const formEndpoint = env.FORMSPREE_ENDPOINT || env.FORMSPREE_CONTACT_URL || 'https://formspree.io/f/xblkwrzj';
    if (!/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(formEndpoint)) return res.status(503).json({ ok: false, error: 'Please contact us directly while the form is unavailable.' });
    let redis;
    try {
      redis = getRedis();
      // Shared limits across function instances. Hash keys so contact details stay out of keys/logs.
      const ip = clean(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
      const bucket = Math.floor(now().getTime() / 3600000);
      for (const [key, limit] of [[`bp:ip:${hash(ip)}:${bucket}`, 10], [`bp:email:${hash(email)}:${bucket}`, 3]]) {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, 3600);
        if (count > limit) { res.setHeader('Retry-After', '3600'); return res.status(429).json({ ok: false, error: 'Please wait before sending another request, or contact us directly.' }); }
      }
    } catch { return res.status(503).json({ ok: false, error: 'The form is temporarily unavailable. Please email contact@finallyhomeagents.com.' }); }
    const submittedAt = now();
    const id = randomUUID();
    const rows = comparisonRows(market, value);
    const selected = Array.isArray(body.communities) ? body.communities.filter(slug => rows.some(row => row.slug === slug)).slice(0, 7) : [];
    const attribution = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) attribution[key] = clean(body.attribution?.[key], 100);
    const record = {
      id, name, email, phone, address: type === 'valuation' ? address : '',
      leadType: type, estimatedValue: value, communities: [...new Set(selected)],
      contactPreference: preference, contactConsent: type === 'comparison' ? 'Requested comparison email only' : true,
      marketingConsent: body.marketingConsent === true, consentVersion: 'home-buys-2026-09-28',
      notUnderContract: body.notUnderContract === true,
      source: 'What My Home Buys', attribution, marketPeriod: market.monthly.periodLabel,
      owner: env.BUYING_POWER_LEAD_OWNER || 'Matthew Mulhall',
      backup: env.BUYING_POWER_LEAD_BACKUP || 'Landon Mulhall',
      status: 'new', submittedAt: submittedAt.toISOString(),
      followUpDueAt: new Date(submittedAt.getTime() + 86400000).toISOString(),
      comparison: rows, emailStatus: 'pending', notificationStatus: 'pending',
    };
    try {
      // Save before delivery. A failed notification must never erase an accepted lead.
      await redis.set(`buying-power:lead:${id}`, record);
      await redis.zadd('buying-power:leads', { score: submittedAt.getTime(), member: id });
    } catch { return res.status(503).json({ ok: false, error: 'We could not save your request. Please try again or email us directly.' }); }
    try {
      const response = await fetchImpl(formEndpoint, { method: 'POST', signal: AbortSignal.timeout(8000),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...record, _subject: `What My Home Buys — ${type} — ${name || email}`, _replyto: email, _gotcha: '' }) });
      record.notificationStatus = response.ok ? 'sent' : 'failed';
    } catch { record.notificationStatus = 'failed'; }
    record.emailStatus = 'manual_follow_up';
    if (env.RESEND_API_KEY) {
      const text = [
        `Hi${name ? ` ${name}` : ''},`,
        type === 'comparison' ? 'Here is the seven-town comparison you requested.' : 'We received your home-value request. Matthew or Landon will respond within 24 hours. Your comparison is below.',
        `Your comparison amount: ${money(value)}. Market period: ${market.monthly.periodLabel}.`,
        ...rows.map(row => `${row.name}: average ${money(row.average)}; your amount is ${money(Math.abs(row.difference))} ${row.difference >= 0 ? 'above' : 'below'} that average.`),
        'These are average sale prices across all home types, not available listings, an appraisal or a purchasing-power assessment. Mortgage balances, selling costs, purchase taxes and moving costs are not deducted.',
        `Source: ${market.monthly.source || 'TRREB Market Watch'}.`,
        'Revisit the calculator: https://northsidegta.ca/what-my-home-buys',
        'Matthew Mulhall and Landon Mulhall, Sales Representatives',
        'Finally Home Agents Team | HomeLife Optimum Realty, Brokerage',
        'Questions about this request? Reply to contact@finallyhomeagents.com or call 647-668-4646.',
        'This email delivers the information you requested. It does not subscribe you to marketing.',
      ].join('\n\n');
      try {
        const response = await fetchImpl('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(8000),
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `buying-power-${id}` },
          body: JSON.stringify({ from: env.FROM_EMAIL || 'Finally Home Agents <no-reply@northsidegta.ca>', to: [email], reply_to: 'contact@finallyhomeagents.com', subject: type === 'comparison' ? 'Your NorthSide GTA home comparison' : 'We received your home-value request', text }) });
        record.emailStatus = response.ok ? 'sent' : 'failed';
      } catch { record.emailStatus = 'failed'; }
    }
    try { await redis.set(`buying-power:lead:${id}`, record); }
    catch { console.error('[buying-power] Delivery-status update failed', id); }
    if (record.notificationStatus !== 'sent') console.error('[buying-power] Agent notification needs retry', id);
    return res.status(200).json({ ok: true, reference: id, emailSent: record.emailStatus === 'sent' });
  };
}
module.exports = { createHandler };
