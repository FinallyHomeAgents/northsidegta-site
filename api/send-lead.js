// /api/send-lead.js  (ESM + CORS + validation)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// --- Config -------------------------------------------------
const ORIGIN = 'https://northsidegta.ca' // your site; add preview origin if needed
const FROM_DEFAULT =
  'Matthew at NorthSide GTA (Finally Home Agents) <no-reply@northsidegta.ca>' // must be a verified domain in Resend
const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()
const REPLY_TO_EMAIL = 'contact@finallyhomeagents.com'
const WHATSAPP_URL = 'https://wa.me/16476684646'
const VCARD_PATH = '/email/NorthSideGTA-Matthew.vcf'
const DEFAULT_SIGNATURE_PATH = '/email/signature.png'

// --- Utils --------------------------------------------------
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isHttpUrl(s) {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function cap(s = '', n = 500) {
  s = String(s)
  return s.length > n ? s.slice(0, n) : s
}

function getFirstName(fullName = '') {
  const clean = String(fullName || '').trim()
  if (!clean) return ''
  const parts = clean.split(/\s+/)
  return parts[0] || ''
}

function slugify(value = '') {
  const base = String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'listings'
}

function applyTrackingParams(url, slug, title) {
  try {
    const tracked = new URL(url)
    tracked.searchParams.set('utm_source', 'email')
    tracked.searchParams.set('utm_medium', 'automated')
    const campaign = slug || slugify(title)
    tracked.searchParams.set('utm_campaign', campaign)
    return tracked.toString()
  } catch (err) {
    console.warn('Tracking params could not be applied:', err)
    return url
  }
}

// --- CORS helper -------------------------------------------
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  try {
    setCors(res)

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }

    if (req.method === 'GET') {
      return res
        .status(200)
        .json({ ok: true, msg: 'send-lead is up. Use POST.' })
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, GET, OPTIONS')
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
    }

    if (!req.headers['content-type']?.includes('application/json')) {
      return res
        .status(400)
        .json({ ok: false, error: 'Content-Type must be application/json' })
    }

    // Vercel parses JSON body by default for API routes; fallback if needed
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
    let { name, email, phone, casl, notRepresented, slug, title, realmLink } =
      body

    // Basic normalization / caps
    name = cap(name, 120)
    email = cap(email, 200)
    phone = cap(phone || '', 60)
    slug = cap(slug || '', 120)
    title = cap(title || '', 200)
    realmLink = cap(realmLink || '', 800)

    // Required fields
    if (!name || !email || !title || !realmLink) {
      return res
        .status(400)
        .json({
          ok: false,
          error: 'Missing required fields (name, email, title, realmLink).',
        })
    }
    if (!casl || !notRepresented) {
      return res.status(400).json({ ok: false, error: 'Consent required.' })
    }
    if (!isHttpUrl(realmLink)) {
      return res
        .status(400)
        .json({ ok: false, error: 'Invalid realmLink URL.' })
    }

    // Env
    const from = process.env.FROM_EMAIL || FROM_DEFAULT
    const bcc = process.env.AGENT_EMAIL || '' // optional
    const sig = process.env.SIGNATURE_IMG_URL || ''

    // Email HTML (your original, kept + small tweaks)
    const firstName = getFirstName(name)
    const greetingLine = firstName
      ? `Hi ${escapeHtml(firstName)},`
      : 'Hi there,'
    const safeTitle = escapeHtml(title)
    const heroHeading = title ? `Your listings: ${safeTitle}` : 'Your listings'
    const curatedLine = title
      ? `As requested, here’s your curated list for ${safeTitle}. Tap below to view instantly — reply if you want recommendations or to book a showing.`
      : 'As requested, here’s your curated list. Tap below to view instantly — reply if you want recommendations or to book a showing.'
    const trackedLink = applyTrackingParams(realmLink, slug, title)
    const signatureUrl = sig || `${ORIGIN}${DEFAULT_SIGNATURE_PATH}`
    const vcardUrl = `${ORIGIN}${VCARD_PATH}`

    const html = `
      <div style="margin:0;padding:0;background-color:#0f172a;">
        <span style="display:none !important;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">
          Open for instant access &amp; ways to reach us.
        </span>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 auto;background-color:#0f172a;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;border-collapse:separate;background-color:#111827;border-radius:28px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 24px 16px 24px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#94a3b8;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">
                    NorthSide GTA | Finally Home Agents
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 8px 24px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;text-align:left;">
                    <h1 style="margin:0 0 24px 0;font-size:28px;line-height:1.3;font-weight:700;color:#f8fafc;">
                      ${heroHeading}
                    </h1>
                    <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#f8fafc;">
                      ${greetingLine}
                    </p>
                    <p style="margin:0 0 28px 0;font-size:16px;line-height:1.6;color:#cbd5f5;">
                      ${curatedLine}
                    </p>
                    <div style="text-align:center;margin-bottom:8px;">
                      <a href="${escapeHtml(trackedLink)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 36px;border-radius:999px;background-color:#22c55e;color:#052e16;font-size:17px;font-weight:700;line-height:1.2;text-decoration:none;min-width:220px;">
                        View the Listings
                      </a>
                    </div>
                    <p style="margin:16px 0 32px 0;font-size:14px;line-height:1.6;color:#cbd5f5;text-align:center;">
                      Questions or want to see a property? Reply to this email or
                      <a href="${escapeHtml(WHATSAPP_URL)}" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;text-decoration:underline;font-weight:600;">message us on WhatsApp</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 0 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;background-color:#0f172a;border-radius:20px;">
                      <tr>
                        <td style="padding:28px 20px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
                          ${
                            signatureUrl
                              ? `<img src="${escapeHtml(signatureUrl)}" alt="Finally Home Agents" style="width:100%;max-width:360px;border-radius:14px;display:block;margin:0 auto 20px auto;" />`
                              : ''
                          }
                          <a href="${escapeHtml(vcardUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background-color:#1f2937;color:#f8fafc;font-weight:600;font-size:14px;text-decoration:none;" target="_blank" rel="noopener noreferrer">
                            Download Contact
                          </a>
                          <p style="margin:12px 0 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
                            Save our contact so you can text or call when something catches your eye.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 24px 0 24px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#94a3b8;">
                    <span style="color:#fbbf24;font-size:14px;letter-spacing:2px;">★★★★★</span>
                    <span style="margin-left:6px;">Google-verified</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 24px 0 24px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;font-size:15px;line-height:1.6;">
                    <p style="margin:0 0 6px 0;">&mdash; Matthew Mulhall</p>
                    <p style="margin:0 0 4px 0;color:#cbd5f5;">Real Estate Agent &mdash; Finally Home Agents</p>
                    <p style="margin:0 0 12px 0;color:#cbd5f5;">HomeLife Optimum Realty, Brokerage</p>
                    <p style="margin:0;font-size:14px;">
                      <a href="tel:+16476684646" style="color:#93c5fd;text-decoration:none;font-weight:600;">+1&nbsp;647&nbsp;668&nbsp;4646</a>
                      <span style="color:#475569;">&nbsp;&bull;&nbsp;</span>
                      <a href="mailto:contact@finallyhomeagents.com" style="color:#93c5fd;text-decoration:none;font-weight:600;">contact@finallyhomeagents.com</a>
                      <span style="color:#475569;">&nbsp;&bull;&nbsp;</span>
                      <a href="https://northsidegta.ca" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;text-decoration:none;font-weight:600;">northsidegta.ca</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 24px 32px 24px;text-align:center;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#94a3b8;font-size:12px;line-height:1.8;">
                    <div style="margin-bottom:10px;">
                      <a href="https://instagram.com/FinallyHomeAgents" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;margin:0 6px;font-weight:600;">Instagram @FinallyHomeAgents</a>
                      <span style="color:#475569;">&bull;</span>
                      <a href="https://instagram.com/NorthSideGTA" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;margin:0 6px;font-weight:600;">Instagram @NorthSideGTA</a>
                    </div>
                    <div style="margin-bottom:10px;">
                      <a href="https://facebook.com/FinallyHomeAgents" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;margin:0 6px;font-weight:600;">Facebook</a>
                      <span style="color:#475569;">&bull;</span>
                      <a href="https://facebook.com/NorthSideGTA" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;margin:0 6px;font-weight:600;">Facebook NorthSide GTA</a>
                      <span style="color:#475569;">&bull;</span>
                      <a href="https://northsidegta.ca" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;margin:0 6px;font-weight:600;">Website</a>
                    </div>
                    <div style="margin-bottom:8px;color:#64748b;font-size:11px;">
                      Matthew Mulhall &mdash; Real Estate Agent &mdash; Finally Home Agents &mdash; HomeLife Optimum Realty, Brokerage
                    </div>
                    <div style="color:#475569;font-size:10px;">
                      not intended to solicit those currently under contract with another real estate brokerage.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `

    // Build message
    const subjectLine = title ? `Your listings: ${title}` : 'Your listings'
    const text = [
      'NorthSide GTA | Finally Home Agents',
      subjectLine,
      firstName ? `Hi ${firstName},` : 'Hi there,',
      title
        ? `As requested, here’s your curated list for ${title}. Tap the link below to view instantly — reply if you want recommendations or to book a showing.`
        : 'As requested, here’s your curated list. Tap the link below to view instantly — reply if you want recommendations or to book a showing.',
      `View the listings: ${trackedLink}`,
      `Questions or want to see a property? Reply to this email or message us on WhatsApp: ${WHATSAPP_URL}`,
      `Download our contact card: ${vcardUrl}`,
      '— Matthew Mulhall',
      'Real Estate Agent — Finally Home Agents',
      'HomeLife Optimum Realty, Brokerage',
      'Phone: +1-647-668-4646',
      'Email: contact@finallyhomeagents.com',
      'Website: https://northsidegta.ca',
      'Instagram: https://instagram.com/FinallyHomeAgents | https://instagram.com/NorthSideGTA',
      'Facebook: https://facebook.com/FinallyHomeAgents | https://facebook.com/NorthSideGTA',
      'Legal: Matthew Mulhall — Real Estate Agent — Finally Home Agents — HomeLife Optimum Realty, Brokerage',
      'Disclaimer: not intended to solicit those currently under contract with another real estate brokerage.',
    ].join('\n\n')

    const msg = {
      from,
      to: email,
      subject: subjectLine,
      html,
      text,
      reply_to: REPLY_TO_EMAIL,
    }
    if (bcc) msg.bcc = [bcc]

    // Send
    const r = await resend.emails.send(msg)

    if (r?.error) {
      console.error('Resend error:', r.error)
      return res.status(502).json({ ok: false, error: 'Email sending failed.' })
    }

    if (FORMSPREE_ENDPOINT) {
      if (!isHttpUrl(FORMSPREE_ENDPOINT)) {
        console.warn(
          'Formspree endpoint ignored (must be http/https):',
          FORMSPREE_ENDPOINT
        )
      } else {
        const payload = {
          name,
          email,
          phone,
          slug,
          title,
          casl,
          notRepresented,
          realmLink,
        }

        try {
          const fsRes = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (!fsRes.ok) {
            let bodyText = ''
            try {
              bodyText = await fsRes.text()
            } catch (err) {
              console.error('Formspree response read error:', err)
            }
            console.error(
              'Formspree error:',
              fsRes.status,
              fsRes.statusText,
              bodyText
            )
          }
        } catch (err) {
          console.error('Formspree request failed:', err)
        }
      }
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('send-lead error:', e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
