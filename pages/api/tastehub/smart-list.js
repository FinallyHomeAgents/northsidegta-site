import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 20;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY is not set" });
  }

  const { town, category, limit } = req.body || {};

  const trimmedTown = typeof town === "string" ? town.trim() : "";
  const trimmedCategory = typeof category === "string" ? category.trim() : "";
  let parsedLimit = Number(limit);
  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    parsedLimit = DEFAULT_LIMIT;
  }
  parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

  if (!trimmedTown || !trimmedCategory) {
    return res.status(400).json({ error: "Town and category are required" });
  }

  const query = `${trimmedCategory} restaurants in ${trimmedTown} Ontario`;
  const params = new URLSearchParams({ query, key: GOOGLE_KEY });

  try {
    const response = await fetch(`${TEXT_SEARCH_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Google Places request failed with ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    const restaurants = results.slice(0, parsedLimit).map(place => ({
      name: place?.name ?? "",
      address: place?.formatted_address ?? "",
      link: place?.place_id
        ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
        : place?.website || ""
    }));

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("[tastehub/smart-list]", error);
    return res.status(502).json({ error: "Unable to fetch restaurants" });
  }
}
