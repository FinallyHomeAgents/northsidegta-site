export function trackBuyingPower(event, properties = {}, target = typeof window === 'undefined' ? null : window) {
  if (!target) return;
  // Explicit allowlist: never send contact details, addresses or full URLs to analytics.
  const data = { calculator: 'what_my_home_buys' };
  for (const key of ['lead_type', 'sort_order', 'community', 'control']) {
    if (typeof properties[key] === 'string') data[key] = properties[key];
  }
  try {
    if (typeof target.gtag === 'function') target.gtag('event', event, data);
    else { target.dataLayer = target.dataLayer || []; target.dataLayer.push({ event, ...data }); }
  } catch (_) {}
  try {
    if (typeof target.fbq === 'function') {
      if (event === 'generate_lead') target.fbq('track', 'Lead', data);
      else target.fbq('trackCustom', event, data);
    }
  } catch (_) {}
}
