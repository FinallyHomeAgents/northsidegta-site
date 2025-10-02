# NorthSide GTA Site

## Environment variables

- `RESEND_API_KEY` – API key used to send confirmation emails through Resend.
- `FROM_EMAIL` – Optional custom "from" address for Resend emails.
- `AGENT_EMAIL` – Optional BCC recipient for incoming leads.
- `SIGNATURE_IMG_URL` – Optional URL for a signature image embedded in the lead email.
- `FORMSPREE_ENDPOINT` – Optional Formspree endpoint that receives a copy of each lead submission. If unset, Formspree forwarding is skipped. Configure this to match your Formspree form URL (for example `https://formspree.io/f/xyzdokjk`).
- `BLOB_READ_WRITE_TOKEN` – Required when using the community event uploader. Create a Vercel Blob store and copy the read/write token so community images can be stored safely.
- `TURNSTILE_SECRET_KEY` / `REACT_APP_TURNSTILE_SITE_KEY` – Cloudflare Turnstile credentials for spam protection on `/community/submit-event`. If you prefer hCaptcha, use `HCAPTCHA_SECRET_KEY` and `REACT_APP_HCAPTCHA_SITE_KEY` instead.
- `SLACK_WEBHOOK_URL` – Optional incoming webhook to broadcast pending submissions to a Slack channel.

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

### Event source audit mode

- Inspect configured sources without mutating any output by running `npm run events:audit`.
- Restrict the audit to a single domain with `npm run events:audit -- --domain=aurora.ca`.
- Each run writes a JSONL file under `logs/` (for example `logs/audit_20240517_1430.jsonl`). Every line is a structured snapshot
  containing the fetch diagnostics, robots.txt verdict, detected content features, parse results, and failure categorisation.
- Use `jq` or any JSONL-friendly tool to filter or summarise findings. A single record looks like:
  ```json
  {
    "domain": "aurora.ca",
    "strategy": "ics",
    "audit": {
      "fetches": [{ "status": 200, "size": 12345 }],
      "robots": { "allowed": true },
      "parse": { "events_found": 12, "errors": [] }
    }
  }
  ```
- The CLI prints a console table at the end of each run so you can quickly scan the overall status.

## Moderating events (zero-config)

Use `/community/events-admin` to review events; click **Open in CMS** to publish or hide entries, and hidden items automatically disappear from public lists and the sitemap.

### Community event submissions

- Public route: `/community/submit-event`
- Pending submissions are stored as JSON files in `public/data/events-pending/` and listed automatically at the top of `/community/events-admin`.
- Use the **Approve & Publish** button in the admin panel to move an item into the live `public/data/events/` folder. The API flips the status to `approved`, notifies Slack/email, and deletes the pending entry.
- Community uploads rely on Vercel Blob; ensure the `BLOB_READ_WRITE_TOKEN` environment variable exists in Vercel before testing uploads.

## Managing event visibility

- **Hide from public lists & sitemap**: In Decap CMS, open the event entry and toggle the new **Hide from public lists & sitemap** checkbox, then publish. Hidden events stay accessible directly at `/community/events/<slug>` but disappear from the main listings and sitemap.
- **Move to Archive page**: In the same CMS form, toggle **Move to Archive page** and publish to remove the event from live listings and surface it on `/events/archive`. Archived items always bypass the main list and sitemap, and show an archive badge in the admin UI.



