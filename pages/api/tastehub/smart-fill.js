import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

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
  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: "Missing GOOGLE_PLACES_API_KEY" });
  }

  const { town, category } = getRequestPayload(req);

  const trimmedTown = typeof town === "string" ? town.trim() : "";
  const trimmedCategory = typeof category === "string" ? category.trim() : "";

  if (!trimmedTown || !trimmedCategory) {
    return res.status(400).json({ error: "Town and category are required." });
  }

  if (!["GET", "POST"].includes(req.method || "")) {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed." });
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

    const place = data.results[0] || {};

    if (data.status && data.status !== "OK") {
      console.warn("[tastehub:smart-fill] Google Places non-OK status", data.status, data.error_message);
    }

    const restaurantName = place.name || "";
    const restaurantAddress = place.formatted_address || place.vicinity || "";

    if (!restaurantName) {
      return res.status(502).json({ error: "Google Places returned an incomplete result." });
    }

    return res.status(200).json({
      restaurantName,
      restaurantAddress,
      placeId: place.place_id || null,
    });
  } catch (error) {
    console.error("[tastehub:smart-fill] Unexpected error", error);
    return res.status(500).json({ error: "Smart Fill request failed." });
  }
}
