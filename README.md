# NorthSide GTA Site

## Environment variables

- `RESEND_API_KEY` – API key used to send confirmation emails through Resend.
- `FROM_EMAIL` – Optional custom "from" address for Resend emails.
- `AGENT_EMAIL` – Optional BCC recipient for incoming leads.
- `SIGNATURE_IMG_URL` – Optional URL for a signature image embedded in the lead email.
- `FORMSPREE_ENDPOINT` – Optional Formspree endpoint that receives a copy of each lead submission. If unset, Formspree forwarding is skipped. Configure this to match your Formspree form URL (for example `https://formspree.io/f/xyzdokjk`).

## Soft-delete setup for events admin

To enable the soft-delete flow in `/community/events-admin`, configure Vercel KV:

1. In your Vercel project dashboard, open **Storage → KV** and create or attach a KV store.
2. Still in Vercel, go to **Settings → Environment Variables** and verify the KV variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, etc.) are present. Vercel adds them automatically once the store is attached.
3. Redeploy the site so the new environment variables are available to the API routes.

With KV available, deletions from Events Admin are reversible and the “Show deleted” toggle becomes available.

## GitHub automation for Events Admin

Publishing, unpublishing, and hard-delete fallbacks use the GitHub Content API. Provide these environment variables so the API routes can commit directly to the default branch (or raise a PR when requested):

- `GITHUB_REPO` – target repository in `owner/name` format.
- `GITHUB_TOKEN` – personal access token with `contents:write` on the repo.
- `EVENTS_ADMIN_USE_PR` – optional. Set to `true` to open a pull request instead of committing straight to the default branch.

If the GitHub variables are missing, publish/unpublish buttons will be disabled and hard deletes are unavailable.



