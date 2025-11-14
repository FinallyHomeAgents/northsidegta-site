import fetch from "node-fetch";

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

const CATEGORY_MAP = {
  Pizza: ["restaurant", "pizza"],
  Wings: ["restaurant"],
  Coffee: ["cafe"],
  Burgers: ["restaurant"],
  Breakfast: ["restaurant"],
  Takeout: ["meal_takeaway"],
  "Ice Cream": ["ice_cream", "restaurant"],
  Bakery: ["bakery"],
  Tacos: ["restaurant"],
  Sushi: ["restaurant", "sushi"]
};

const TOWN_COORDS = {
  Uxbridge: { lat: 44.10, lng: -79.12 },
  Georgina: { lat: 44.30, lng: -79.45 },
  "East Gwillimbury": { lat: 44.12, lng: -79.43 },
  Newmarket: { lat: 44.05, lng: -79.47 },
  Aurora: { lat: 44.00, lng: -79.47 },
  Stouffville: { lat: 43.97, lng: -79.25 },
  Scugog: { lat: 44.10, lng: -78.95 }
};

export default async function handler(req, res) {
  const { town, category } = req.query;

  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: "Missing GOOGLE_PLACES_API_KEY" });
  }

  if (!town || !category) {
    return res.status(400).json([]);
  }

  const coords = TOWN_COORDS[town];
  if (!coords) return res.status(400).json([]);

  const types = CATEGORY_MAP[category] || ["restaurant"];
  const primaryType = types[0] || "restaurant";
  const keyword = types[1] || category.toLowerCase();

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=4500&type=${primaryType}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_KEY}`;

  const places = await fetch(url).then(r => r.json());

  if (!places.results) return res.status(200).json([]);

  const cleaned = places.results
    .filter(p => p.business_status === "OPERATIONAL")
    .map(p => ({
      name: p.name || "",
      address: p.vicinity || p.formatted_address || "",
      link: p.website || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json(cleaned);
}
