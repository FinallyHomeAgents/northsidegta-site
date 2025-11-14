# TasteHub ranking infrastructure setup

Use this guide to wire up Upstash (or another compatible REST Redis instance) so TasteHub polls can read and write rankings.

## 1. Provision an Upstash Redis database

1. Sign in to [Upstash](https://console.upstash.com/) and create a new **Redis** database in the same region as your hosting provider when possible.
2. Once the database is created, copy these connection details from the **REST API** section:
   - **REST URL** – looks like `https://us1-polished-dog-12345.upstash.io`
   - **REST Token** – long token string shown beside the URL

> ℹ️ Any Redis service that exposes Upstash-compatible REST endpoints will work. The helper will also look for `KV_REST_API_URL` / `KV_REST_API_TOKEN` if your provider uses the Vercel KV naming.

## 2. Configure environment variables

Set the following variables wherever your app runs (local `.env`, Vercel project settings, etc.):

```bash
UPSTASH_REDIS_REST_URL="https://<your-upstash-rest-url>"
UPSTASH_REDIS_REST_TOKEN="<your-upstash-rest-token>"
```

Optional overrides that are also recognised:

- `KV_REST_API_URL` or `KV_URL`
- `KV_REST_API_TOKEN` or `KV_REST_TOKEN`

> ❗ Both the URL and token must be present or the ranking APIs will return `503`.

If you enable Cloudflare Turnstile on the community vote forms, include:

```bash
TURNSTILE_SECRET_KEY="<your-turnstile-secret>"
```

TasteHub polls do not require Turnstile today, but the API uses the same handler as the community pages so the variable remains optional.

## 3. Verify connectivity locally

1. Create a `.env.local` file at the repo root with the variables above and run `npm start`.
2. Visit `http://localhost:3000/api/rankings/leaderboard?rankingKey=tastehub_uxbridge_pizza_2025` to confirm you receive a JSON payload instead of an error.
3. Submit a test vote from `/tastehub` and confirm Redis now contains keys like `tastehub:tastehub_uxbridge_pizza_2025:score:<ballot-id>`.

If you see a `503` response, double check the variables and that the Upstash instance allows REST requests from your environment.

## 4. Managing poll keys

- Each poll’s **Ranking Key** (managed in the CMS) becomes the Redis key prefix: `tastehub:<ranking_key>:*`.
- Changing the ranking key after launch will create a fresh leaderboard because it points at a new set of Redis keys.
- To reset a poll, delete the keys with that prefix in Upstash (or change the ranking key in CMS).

## 5. Other operational notes

- Featured images for polls should be 1600×900 (16:9) JPG or PNG and will appear on cards, featured strips, and the modal background.
- Share buttons inside the poll modal generate social links automatically using the live site origin; no additional configuration is needed.
- The navigation bar intentionally omits TasteHub until the page is production ready. Link to `/tastehub` manually when you’re ready to launch.

With these variables in place, any new TasteHub poll created in the CMS will be wired to the Upstash-backed voting APIs automatically.
