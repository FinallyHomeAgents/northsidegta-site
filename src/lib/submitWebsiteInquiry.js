// Keep a stable reference across retries without storing contact details on disk.
const attempts = new Map();
export async function submitWebsiteInquiry(endpoint, options, source = 'contact') {
  const url = new URL(endpoint, window.location.origin);
  if (url.origin !== 'https://formspree.io' || !/^\/f\/[a-z0-9]+$/i.test(url.pathname)) {
    throw new Error('This inquiry destination is not configured.');
  }
  const fields = options.body instanceof FormData
    ? Object.fromEntries(options.body.entries()) : JSON.parse(options.body);
  // Carry only the three supported attribution fields; never copy arbitrary query data.
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_campaign', 'utm_source', 'utm_medium'];
  if (keys.every(key => params.getAll(key).length === 1)
    && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(params.get('utm_campaign'))
    && ['instagram', 'facebook'].includes(params.get('utm_source'))
    && params.get('utm_medium') === 'organic_social') {
    for (const key of keys) fields[key] = params.get(key);
  }
  const pageUrl = 'https://northsidegta.ca' + window.location.pathname;
  const stableFields = Object.fromEntries(Object.entries(fields).filter(([key]) => !/timestamp|submitted_at|submittedAt|_timestamp/i.test(key)));
  const bytes = new TextEncoder().encode(JSON.stringify([url.pathname, source, pageUrl, stableFields]));
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  const key = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (!attempts.has(key)) {
    if (attempts.size >= 50) attempts.delete(attempts.keys().next().value);
    attempts.set(key, { submissionId: window.crypto.randomUUID(), fields });
  }
  const attempt = attempts.get(key);
  return fetch('/api/website-inquiry', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ destination: url.pathname.split('/').pop(), source, pageUrl, ...attempt }),
  });
}
