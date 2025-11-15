import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_KEY) {
  console.warn(
    "[tastehub:smart-fill] GOOGLE_PLACES_API_KEY is not configured; smart fill API will respond with an error."
  );
}

function getRequestPayload(req) {
  if (req.method === "POST") {
    return req.body || {};
  }
  return req.query || {};
}

function buildTextSearchUrl({ town, category }) {
  const query = `${category} in ${town}`;
  const params = new URLSearchParams({
    query,
    region: "ca",
    type: "restaurant",
    key: GOOGLE_KEY,
  });
  return `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
}

export default async function handler(req, res) {
  const allowedMethods = ["GET", "POST", "HEAD"];

  if (!allowedMethods.includes(req.method || "")) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (req.method === "HEAD") {
    if (!GOOGLE_KEY) {
      return res.status(503).end("GOOGLE_PLACES_API_KEY is not configured");
    }
    return res.status(204).end();
  }

  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: "Missing GOOGLE_PLACES_API_KEY" });
  }

  const { town, category } = getRequestPayload(req);

  const trimmedTown = typeof town === "string" ? town.trim() : "";
  const trimmedCategory = typeof category === "string" ? category.trim() : "";

  if (!trimmedTown || !trimmedCategory) {
    return res.status(400).json({ error: "Town and category are required." });
  }

  try {
    const url = buildTextSearchUrl({ town: trimmedTown, category: trimmedCategory });
    const response = await fetch(url);

    if (!response.ok) {
      console.error("[tastehub:smart-fill] Google Places request failed", response.status);
      return res.status(502).json({ error: "Smart Fill is temporarily unavailable." });
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return res.status(404).json({ error: "No matching restaurants found." });
    }

    if (data.status && data.status !== "OK") {
      console.warn("[tastehub:smart-fill] Google Places non-OK status", data.status, data.error_message);
    }

    const items = data.results
      .filter((result) => result && result.business_status === "OPERATIONAL")
      .map((result) => {
        const name = result.name || "";
        const address = result.formatted_address || result.vicinity || "";
        const placeId = result.place_id || "";
        let googleMapsLink = "";
        if (placeId) {
          googleMapsLink = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
        } else if (name) {
          googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
        }

        return {
          name,
          address,
          link: googleMapsLink,
          placeId: placeId || null,
        };
      })
      .filter((item) => item.name)
      .slice(0, 10);

    if (!items.length) {
      return res.status(404).json({ error: "No matching restaurants found." });
    }

    return res.status(200).json({ items });
  } catch (error) {
    console.error("[tastehub:smart-fill] Unexpected error", error);
    return res.status(500).json({ error: "Smart Fill request failed." });
  }
}
