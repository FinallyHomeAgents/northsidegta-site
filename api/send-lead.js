// /api/send-lead.js  (ESM + CORS + validation)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// --- Config -------------------------------------------------
const ORIGIN = 'https://northsidegta.ca' // your site; add preview origin if needed
const FROM_DEFAULT = 'NorthSide GTA <no-reply@northsidegta.ca>' // must be a verified domain in Resend
const FORMSPREE_ENDPOINT = (process.env.FORMSPREE_ENDPOINT ?? '').trim()

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
    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>As requested, here’s the link to <strong>${escapeHtml(
          title
        )}</strong>:</p>
        <p>
          <a href="${realmLink}" target="_blank"
             style="display:inline-block;background:#0B6E4F;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700">
            View the listings
          </a>
        </p>
        <p style="margin-top:16px;">If you have any questions or want recommendations, just reply to this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="margin:0 0 6px 0;"><strong>Lead details</strong></p>
        <ul style="margin:0 0 16px 18px;padding:0;">
          <li>Name: ${escapeHtml(name)}</li>
          <li>Email: ${escapeHtml(email)}</li>
          <li>Phone: ${escapeHtml(phone)}</li>
          <li>Page: /collections/${escapeHtml(slug)}</li>
        </ul>
        <p style="font-size:12px;color:#666;">
          Matthew Mulhall — Real Estate Agent — HomeLife Optimum Realty — Finally Home Agents
        </p>
        ${
          sig
            ? `<img alt="Signature" src="${sig}" style="max-width:420px;width:100%;margin-top:8px;border-radius:6px;" />`
            : ''
        }
      </div>
    `

    // Build message
    const msg = {
      from,
      to: email,
      subject: `Your listings: ${title}`,
      html,
      reply_to: email, // so you can reply directly to the lead
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
