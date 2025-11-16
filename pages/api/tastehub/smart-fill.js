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

function buildTextSearchUrl({ town, category, nextPageToken }) {
  const params = new URLSearchParams({ key: GOOGLE_KEY });

  if (nextPageToken) {
    params.set("pagetoken", nextPageToken);
  } else {
    const query = `${category} in ${town}`;
    params.set("query", query);
    params.set("region", "ca");
    params.set("type", "restaurant");
  }

  return `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeResult(result) {
  if (!result || !result.name) {
    return null;
  }

  const name = result.name || "";
  const address = result.formatted_address || result.vicinity || "";
  const placeId = result.place_id || "";
  const website = result.website || "";
  const link = website
    ? website
    : placeId
    ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`
    : name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : "";

  return {
    name,
    address,
    link,
    placeId: placeId || null,
  };
}

async function fetchGoogleResults({ town, category, limit }) {
  const parsedLimit = parseInt(limit, 10);
  const requestedLimit = Number.isFinite(parsedLimit) ? parsedLimit : 20;
  const maxLimit = Math.min(Math.max(requestedLimit, 1), 30);
  const collected = [];
  let nextPageToken = null;
  let pageCount = 0;

  do {
    if (nextPageToken) {
      // Google requires a short delay before requesting the next page token
      await delay(2000);
    }

    const url = buildTextSearchUrl({ town, category, nextPageToken });
    const response = await fetch(url);

    if (!response.ok) {
      console.error("[tastehub:smart-fill] Google Places request failed", response.status);
      throw new Error("SMART_FILL_UNAVAILABLE");
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results)) {
      break;
    }

    if (data.status && data.status !== "OK") {
      console.warn("[tastehub:smart-fill] Google Places non-OK status", data.status, data.error_message);
    }

    data.results
      .filter((result) => result && result.business_status === "OPERATIONAL")
      .forEach((result) => {
        if (collected.length >= maxLimit) return;
        const normalized = normalizeResult(result);
        if (normalized) {
          collected.push(normalized);
        }
      });

    nextPageToken = data.next_page_token || null;
    pageCount += 1;
  } while (collected.length < maxLimit && nextPageToken && pageCount < 3);

  const deduped = [];
  const seen = new Set();
  for (const item of collected) {
    const key = `${(item.name || "").toLowerCase()}|${(item.address || "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, maxLimit);
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

  const { town, category, limit } = getRequestPayload(req);

  const trimmedTown = typeof town === "string" ? town.trim() : "";
  const trimmedCategory = typeof category === "string" ? category.trim() : "";

  if (!trimmedTown || !trimmedCategory) {
    return res.status(400).json({ error: "Town and category are required." });
  }

  try {
    const restaurants = await fetchGoogleResults({
      town: trimmedTown,
      category: trimmedCategory,
      limit: limit || 20,
    });

    if (!restaurants.length) {
      return res.status(404).json({ error: "No matching restaurants found." });
    }

    return res.status(200).json({ restaurants, count: restaurants.length });
  } catch (error) {
    console.error("[tastehub:smart-fill] Unexpected error", error);
    if (error && error.message === "SMART_FILL_UNAVAILABLE") {
      return res.status(502).json({ error: "Smart Fill is temporarily unavailable." });
    }
    return res.status(500).json({ error: "Smart Fill request failed." });
  }
}
