# Homepage lead spam protection

Shared homepage form for all communities. Aurora is its first enabled dropdown option, not a distinct endpoint.

## Existing-setup implementation

No Cloudflare account, widget or keys required. Uses the project's existing writable `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or KV REST equivalents). Metadata verified present in all environments on November 17, 2026; preview must verify actual operation. Preserve `FORMSPREE_ENDPOINT` and HQ settings.

- Browser obtains a random 256-bit one-use first-party token from `/api/homepage-challenge`. Redis binds it to hashed IP, expires it after one hour, and atomically consumes it on submission. A one-second minimum age prevents instantaneous blind submissions. Browser refreshes at 55 minutes and after errors.
- This stops simple direct-POST/replay spam, not determined bots capable of loading the page, fetching a token and waiting. It is not CAPTCHA or proof of humanity. Origin/Referer checks are supplemental, not authentication.
- Redis limits issuance to 300/10min and submission attempts to 20/10min per IP; verified contact submissions to 5/hour. Shared networks and mobile IP changes may require a retry. Keys hash IP/contact values; TTL bounds retention.
- Atomic duplicate lock suppresses concurrent forwarding and repeated identical name/contact/community for 10 minutes after success. Known failure releases the 60-second lock; uncertain timeout retains it. Best effort, not exactly-once delivery.
- Honeypot, allowed community/contact validation, 8KiB maximum body and fetch timeouts.
- All three original inputs preserved. No blanket email/name mismatches or geographical blocks. JavaScript or storage failures show direct-contact fallback instead of silently discarding leads.

## Safe preview and rollout

`VERCEL_ENV=preview` always skips HQ capture and Formspree forwarding after checking protection, responds `preview:true`, and shows a clear test-only receipt. Redis keys are isolated by exact deployment hostname so tests cannot throttle production. Use exact `VERCEL_URL` for preview QA, not a branch alias.

Before merge: focused tests, production build, real preview browser success/refresh/retry, duplicate and missing/fabricated token rejection. Preview can safely submit synthetic `example.invalid` data; no real mail/CRM record is created. Production notification delivery remains unverified without an explicitly authorized synthetic live submission. Monitor real leads/spam after rollout; stronger managed bot verification remains a later option if adaptive spam continues.

Do not enable Formspree domain restriction blindly: current server forwarding does not send the Referer that setting relies on.

## Validation record

Prior full suite: unrelated ICS RRULE recurrence-time failure reproduced on untouched main `14ebbf8ad7e20b7b33412ec820090dbcb4704c50`. No event code changes. Local Chromium launch blocked by sandbox restrictions; signed-in browser preview QA required. No production leads submitted.
