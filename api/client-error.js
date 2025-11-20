export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  let body = req.body || {};

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = {};
    }
  }

  const { message, stack, userAgent, url } = body || {};

  console.log(
    "[client-error]",
    message || "unknown message",
    "| url=",
    url || "n/a",
    "| ua=",
    userAgent || "n/a"
  );

  res.status(200).json({ ok: true });
}
