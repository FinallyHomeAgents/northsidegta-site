# Homepage lead spam protection

This protects the shared homepage form, including all seven communities. Aurora is the first enabled dropdown option; it is not a separate notification endpoint.

## Required before rollout

- Verify `TURNSTILE_SECRET_KEY` and build-time `REACT_APP_TURNSTILE_SITE_KEY` are a matching production widget pair, restricted to northsidegta.ca / www.northsidegta.ca. Never commit secrets.
- Verify writable `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
- Preserve existing `FORMSPREE_ENDPOINT` and HQ capture settings. Preview testing must use isolated notification/storage destinations, not production recipients.
- A preview widget must authorize its exact `VERCEL_URL`; server permits that hostname only when `VERCEL_ENV=preview`.
- No bypass flag is provided. Missing keys, unavailable verification or storage fail closed with a direct-contact fallback. Do not deploy until configuration and a genuine browser verification flow pass.

## Behavior

- Server verifies Turnstile success, hostname and `homepage_lead` action. Client refreshes expired/consumed tokens.
- Shared Redis IP limit: 20 attempts / 10-minute fixed window. Contact limit: 5 verified requests / hour. Keys contain SHA256 digests, not raw contact/IP values. These are operational limits, not identity verification; shared networks need monitoring.
- Atomic duplicate lock prevents concurrent forwarding. Successfully accepted identical name/contact/community payloads are acknowledged without forwarding for 10 minutes. Known failure releases the lock; ambiguous upstream timeout retains the 60-second lease. This is bounded duplicate suppression, not exactly-once delivery across downstream outages.
- Honeypot retained; contacts and allowed communities validated server-side; 8 KiB body limit.
- Original three input fields retained. No mandatory phone/email confirmation or blanket name/email mismatch rules.

## Validation before production

Run focused tests and full build. In isolated preview test human success, bot/missing/forged/expired tokens, duplicate clicks, retries, refresh/navigation, no-JS fallback, storage/verification/upstream failures, and one explicitly authorized synthetic end-to-end notification. Confirm mobile layout and real recipient delivery only after authorization. Do not enable Formspree domain restriction blindly: current server forwarding does not send Referer, which that setting relies upon.

At implementation time Vercel env metadata access returned 403; production widget/secret/storage readiness was not verified. No live leads were submitted.

## Local verification (2026-11-17)

- 23 focused tests passed: token validation, origin rejection, dependency/config failures, rate and duplicate branches, handler integration, frontend expiry/retry/cleanup.
- `CI=true npm run build` passed, including prerender/SEO verification.
- Full `npm test`: 318 total, 314 passed, 3 skipped, 1 failed. The unrelated ICS RRULE recurrence time test also fails on untouched base commit `14ebbf8ad7e20b7b33412ec820090dbcb4704c50`; no event code changed.
- Chromium local QA was attempted but browser launch was blocked by sandbox socket restrictions. No real widget or end-to-end form submission has been verified.
- Vercel CLI fallback had no existing credentials. No environment values were read or changed; no code was pushed/deployed.
