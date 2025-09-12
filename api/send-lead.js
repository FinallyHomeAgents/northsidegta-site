// api/send-lead.js
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = async (req, res) => {
  console.log("send-lead hit", req.method);

  if (req.method === "GET") {
    return res.status(200).json({ ok: false, msg: "send-lead is up. Use POST." });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { name, email, phone, casl, notRepresented, slug, title, realmLink } = req.body || {};
    if (!name || !email || !title || !realmLink) return res.status(400).send("Missing required fields.");
    if (!casl || !notRepresented) return res.status(400).send("Consent required.");

    const from = process.env.FROM_EMAIL || "NorthSide GTA <no-reply@northsidegta.ca>";
    const bcc  = process.env.AGENT_EMAIL || "";
    const sig  = process.env.SIGNATURE_IMG_URL || "";

    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>As requested, here’s the link to <strong>${escapeHtml(title)}</strong>:</p>
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
          <li>Phone: ${escapeHtml(phone || "")}</li>
          <li>Page: /collections/${escapeHtml(slug || "")}</li>
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
      subject: `Your listings: ${title}`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Email sending failed.");
  }
};