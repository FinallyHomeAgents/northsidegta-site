export function trackEvent(event, props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.debug("dataLayer push failed", err);
  }

  try {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, props);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.debug("fbq tracking failed", err);
  }
}

export function trackEventOnce(event, props = {}) {
  if (typeof window === "undefined") return;
  const key = `__tracked_${event}`;
  if (window[key]) return;
  window[key] = true;
  trackEvent(event, props);
}
