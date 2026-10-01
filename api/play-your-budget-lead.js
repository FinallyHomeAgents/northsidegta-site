const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT || process.env.FORMSPREE_CONTACT_URL || '').trim();

const SEARCH_COMMUNITIES = new Set(["Georgina", "East Gwillimbury", "Newmarket", "Aurora", "Stouffville", "Uxbridge", "Scugog", "King", "Bradford"]);

function normalizeText(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const botField = normalizeText(body.botField, 120);
  if (botField) {
    res.status(200).json({ ok: true });
    return;
  }

  const requestType = body.requestType === 'homes' ? 'Matching homes request' : 'Community match';
  const selectedCommunities = Array.isArray(body.selectedCommunities)
    ? [...new Set(body.selectedCommunities.filter(value => SEARCH_COMMUNITIES.has(value)))].slice(0, 9)
    : [];
  if (body.requestType === 'homes' && !selectedCommunities.length) {
    res.status(400).json({ ok: false, error: 'Choose at least one community.' });
    return;
  }
  const name = normalizeText(body.name, 120);
  const email = normalizeText(body.email, 180);
  const phone = normalizeText(body.phone, 80);
  const budgetLabel = normalizeText(body.budgetLabel, 80);
  const recommendedCommunity = normalizeText(body.recommendedCommunity, 120) || 'No realistic freehold match';
  const pageUrl = normalizeText(body.pageUrl, 500) || 'https://northsidegta.ca/play-your-budget';
  const submittedAt = normalizeText(body.submittedAt, 80) || new Date().toISOString();
  const consent = body.consent === true;
  const priorities = Array.isArray(body.priorities) ? body.priorities.map((v) => normalizeText(v, 80)).filter(Boolean).slice(0, 4) : [];
  const propertyTypes = Array.isArray(body.propertyTypes)
    ? body.propertyTypes.slice(0, 8).map((item) => ({
        label: normalizeText(item?.label, 120),
        status: normalizeText(item?.status, 120),
      })).filter((item) => item.label && item.status)
    : [];

  if (!name || !email || !consent) {
    res.status(400).json({ ok: false, error: 'Please complete your name, email, and contact consent.' });
    return;
  }

  if (!FORMSPREE_ENDPOINT || !isHttpUrl(FORMSPREE_ENDPOINT)) {
    console.error('[play-your-budget-lead] Formspree endpoint is not configured');
    res.status(500).json({ ok: false, error: 'Lead form is not configured right now.' });
    return;
  }

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        Name: name,
        Email: email,
        Phone: phone || 'Not provided',
        Budget: budgetLabel,
        Priorities: priorities.join(', ') || 'None selected',
        'Recommended community': recommendedCommunity,
        'Requested communities': selectedCommunities.join(', ') || recommendedCommunity,
        'Freehold property-type fit': propertyTypes.map((item) => `${item.label}: ${item.status}`).join(' | ') || 'No realistic freehold match',
        Source: 'Play Your Budget',
        'Request type': requestType,
        'Page URL': pageUrl,
        'Submitted date/time': submittedAt,
        'Contact consent': 'Yes',
        _subject: `Play Your Budget ${requestType} — ${budgetLabel || 'Budget'} — ${recommendedCommunity} — ${name}`,
        _gotcha: '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[play-your-budget-lead] Formspree error', response.status, errorText);
      res.status(502).json({ ok: false, error: 'Unable to send your request right now.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[play-your-budget-lead] request failed', error);
    res.status(502).json({ ok: false, error: 'Unable to send your request right now.' });
  }
}
