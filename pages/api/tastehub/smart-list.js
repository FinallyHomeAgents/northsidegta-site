const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 20;

async function getFetchImplementation() {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch.bind(globalThis);
  }

  const { default: nodeFetch } = await import("node-fetch");
  return nodeFetch;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!googleKey) {
    return res.status(500).json({ error: "GOOGLE_PLACES_API_KEY is not set" });
  }

  const { town, category, limit = DEFAULT_LIMIT } = req.body || {};

  const trimmedTown = typeof town === "string" ? town.trim() : "";
  const trimmedCategory = typeof category === "string" ? category.trim() : "";

  if (!trimmedTown || !trimmedCategory) {
    return res.status(400).json({ error: "town and category are required" });
  }

  let parsedLimit = Number(limit);
  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    parsedLimit = DEFAULT_LIMIT;
  }
  parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

  const query = encodeURIComponent(`${trimmedCategory} restaurants in ${trimmedTown} Ontario`);
  const url = `${TEXT_SEARCH_URL}?query=${query}&key=${googleKey}`;

  try {
    const fetchImpl = await getFetchImplementation();
    const response = await fetchImpl(url);
    const data = await response.json();
    const googleStatus = data?.status;
    const googleMessage = data?.error_message;

    if (googleStatus && googleStatus !== "OK") {
      console.error(
        "[tastehub/smart-list] Google error",
        googleStatus,
        googleMessage,
        { town: trimmedTown, category: trimmedCategory }
      );

      return res.status(502).json({
        error: "Google Places error",
        googleStatus,
        googleMessage: googleMessage ?? null,
      });
    }

    const results = Array.isArray(data?.results) ? data.results : [];

    const restaurants = results.slice(0, parsedLimit).map(place => ({
      name: place?.name || "",
      address: place?.formatted_address || "",
      link: place?.place_id
        ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
        : "",
    }));

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("[tastehub/smart-list]", error);
    return res.status(500).json({ error: "Smart List failed" });
  }
}
