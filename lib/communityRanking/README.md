# Community Ranking KV Keys

This directory documents the key structure for the community leaderboard + voting feature.

## Key Patterns

All keys normalize inputs to lowercase kebab-case (e.g., `Uxbridge` → `uxbridge`, `Pizza` → `pizza`).

- **Score tallies** – `rank:{category}:{town}:score:{slug}`
  - Stores the cumulative score for a place.
- **First-choice counts** – `rank:{category}:{town}:firsts:{slug}`
  - Stores how many ballots picked the place as the top choice (used for tie-breaking).
- **Per-device daily ballot hash** – `rank:{category}:{town}:ballot:{hash}`
  - Used to rate-limit voters to one ballot per device/IP per calendar day.
  - `hash = sha256(ip + userAgent + YYYY-MM-DD)`.
- **Cached leaderboard** – `rank:{category}:{town}:cache`
  - Holds the serialized leaderboard JSON for faster reads (short TTL).
- **Marketing consent log** – `consent:{sha256(email)}`
  - Stores opt-in metadata for CASL/PIPEDA compliance.

These keys live in Upstash/Vercel KV and are shared across towns and categories.
