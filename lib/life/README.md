# NorthSide GTA Life — private photo pilot

## Routes

- `/life/studio/`: private, Home Screen-capable iPhone web app.
- `/life/`: public, server-rendered approved discoveries.
- `/life/posts/:id`: server-rendered individual story with canonical and Open Graph metadata.
- `/api/life`: authenticated operations and explicitly public feed/story/image operations.

## Run and verify

`npm run life:dev` starts a loopback-only development server at http://127.0.0.1:4317/life/studio/ . Local development uses an explicitly labelled sign-in bypass and stores data in ignored `.life-local/`. The bypass cannot run on Vercel. Local published images and posts never go to the production website. `npm run test:life` runs security, persistence, approval, and duplicate-prevention tests.

## Configuration (server only)

The existing site CMS username/password can sign both team members in. No GitHub token is sent to the client by this app.

- `CMS_LOGIN_USERNAME`, `CMS_LOGIN_PASSWORD`: reuse existing CMS sign-in.
- `LIFE_SESSION_SECRET`: optional separate high-entropy session secret; otherwise derived from the CMS password. Rotating it invalidates sessions.
- `LIFE_MATTHEW_PASSWORD`, `LIFE_LANDON_PASSWORD`: optional individual passwords. Configure LIFE_SESSION_SECRET if not reusing CMS credentials.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`): shared drafts, locks, and rate limits.
- `BLOB_READ_WRITE_TOKEN`: public approved-image storage. Original drafts stay in authenticated storage; only explicit publication uploads a rendered image publicly.
- `OPENAI_API_KEY`: enables photo-aware caption generation. Without it the UI clearly labels deterministic starter copy; it never claims to use AI.
- `LIFE_OPENAI_MODEL`: optional model override, default gpt-4.1-mini.
- `LIFE_META_GRAPH_VERSION`: explicitly selected supported Graph API version.
- `LIFE_NORTHSIDE_PAGE_ACCESS_TOKEN`, `LIFE_NORTHSIDE_PAGE_ID`, `LIFE_NORTHSIDE_IG_USER_ID`.
- `LIFE_FINALLYHOME_PAGE_ACCESS_TOKEN`, `LIFE_FINALLYHOME_PAGE_ID`, `LIFE_FINALLYHOME_IG_USER_ID`.

Use authorised Page access tokens with applicable Facebook photo publishing and Instagram professional-account publishing permissions. Never put credentials in browser code or commit them. Token presence is shown as configured, not proof permissions are valid. End-to-end social publishing needs an owner-approved real post after configuration. OAuth onboarding is not implemented in this pilot.

## Supported today

One photo per discovery; browser resizing and JPEG conversion; explicit location confirmation; three deterministic branded layouts; editable, destination-specific copy; optional photo-aware AI; shared drafts with optimistic concurrency; approval-based website/Facebook Page/Instagram image publishing; image download and caption copy; Web Share where supported; responsive layout and PWA shell. HEIC depends on browser decoding; if unsupported the user receives a JPEG conversion message.

## Publication semantics

Each destination is a separate request. Redis locks serialize saves/publishes. Publication saves an uncertain state before a social publishing mutation. A timeout or missing confirmation is never blindly retried; the UI asks the operator to check the account. Published content locks against editing. Website and social operations are not atomic: partial success remains visible and only unsent destinations may be retried. If the process crashes after an image upload but before saving, an orphan approved-image blob may remain. Durable queue/reconciliation and media cleanup are later hardening work.

## Deliberate limits

No video editing, carousel publishing, scheduling, native location tags, EXIF location lookup, public contributor registration, push notifications, or App Store distribution yet. Location text is manually confirmed. A Facebook Group share package requires final posting in Facebook. Public feed currently reads the most recent 100 draft records; pagination should precede a wider rollout. Local tests do not prove Meta token permissions, production storage configuration, Safari on a physical iPhone, or Apple installation behavior.

## Launch checks

1. Verify preview storage/auth/AI flags and sign in using existing credentials.
2. Verify Redis and Blob permissions using a private draft and explicitly approved sample.
3. Connect Meta server credentials and test one real approved post on each selected account.
4. Install from Safari on Matthew's and Landon's actual iPhones; test their camera photo formats and share sheet.
5. Review then merge the feature branch for production routes.

No sample posts or local test records are part of the deployable source.
