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

## Daily Events Auto-Sync

- Runs at ~06:00 America/Toronto (cron set to 10:00 UTC).
- Script: `scripts/sync-events.mjs`.
- Outputs to `public/data/events/`.
- Preserves `status`, `hidden`, and `archived`; does not delete files.
- Commits only when changes exist (which triggers a redeploy).
- To change the time, edit `.github/workflows/daily-events-sync.yml`.
- When changes occur, the sync writes `public/data/events/_sync-summary.json` so the admin page and commit messages can surface
  +new/updated counts.

## Moderating events (zero-config)

Use `/community/events-admin` to review events; click **Open in CMS** to publish or hide entries, and hidden items automatically disappear from public lists and the sitemap.

## Managing event visibility

- **Hide from public lists & sitemap**: In Decap CMS, open the event entry and toggle the new **Hide from public lists & sitemap** checkbox, then publish. Hidden events stay accessible directly at `/community/events/<slug>` but disappear from the main listings and sitemap.
- **Move to Archive page**: In the same CMS form, toggle **Move to Archive page** and publish to remove the event from live listings and surface it on `/events/archive`. Archived items always bypass the main list and sitemap, and show an archive badge in the admin UI.



