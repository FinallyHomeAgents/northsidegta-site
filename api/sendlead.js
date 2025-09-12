// api/send-lead.js (CommonJS)
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// tiny HTML escape
function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    // (Only needed if you’ll hit this from a different origin)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { name, email, phone, casl, notRepresented, slug, title, realmLink, botField } = req.body || {};

    // honeypot
    if (botField) return res.status(200).json({ ok: true });

    // required
    if (!name || !email || !title || !realmLink) {
      return res.status(400).send("Missing required fields.");
    }
    if (!casl || !notRepresented) {
      return res.status(400).send("Consent required.");
    }

    const from = process.env.FROM_EMAIL || "NorthSide GTA <no-reply@northsidegta.ca>";
    const bcc = (process.env.AGENT_EMAIL || "").trim();
    const sig = process.env.SIGNATURE_IMG_URL || "";

    const subject = `Your listings: ${title}`;
    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;">
        <p>Hi ${esc(name)},</p>
        <p>As requested, here’s the link to <strong>${esc(title)}</strong>:</p>
        <p>
          <a href="${realmLink}" target="_blank" 
             style="display:inline-block;background:#0B6E4F;color:#fff;padding:12px 16px;border-radius:10px;
                    text-decoration:none;font-weight:700">
            View the listings
          </a>
        </p>
        <p style="margin-top:16px;">If you have any questions or want recommendations, reply to this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="margin:0 0 6px 0;"><strong>Lead details</strong></p>
        <ul style="margin:0 0 16px 18px;padding:0;">
          <li>Name: ${esc(name)}</li>
          <li>Email: ${esc(email)}</li>
          <li>Phone: ${esc(phone || "")}</li>
          <li>Page: /collections/${esc(slug || "")}</li>
        </ul>
        <p style="font-size:12px;color:#666;">
          Matthew Mulhall — Real Estate Agent — HomeLife Optimum Realty — Finally Home Agents
        </p>
        ${sig ? `<img alt="Signature" src="${sig}" style="max-width:420px;width:100%;margin-top:8px;border-radius:6px;" />` : ""}
      </div>
    `;

    await resend.emails.send({
      from,
      to: email,
      bcc: bcc ? [bcc] : undefined,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Email sending failed.");
  }
};