# Event sync recovery runbook

This runbook coordinates the steps required to restore the daily event ingestion pipeline after an outage. It is designed to be executed as a single task so that we can validate connectivity, audit sources, and repopulate the CMS in one pass.

## Overview of the recovery workflow

1. **Connectivity probe** – Confirms that GitHub Actions (or any automation runner) can reach every configured feed and records the responses under `logs/connectivity_*.json`.
2. **Source audit** – Re-runs the existing `events-cli` audit to capture detailed fetch/parse diagnostics for each source.
3. **Event sync** – Invokes `scripts/sync-events.mjs` with `EVENTS_SYNC_WRITE=true` to backfill missing events once connectivity is restored.
4. **Normalization** – Runs the JSON normalization pass to ensure all event payloads follow the latest formatting rules.

All four stages are orchestrated by `scripts/events-recover.mjs`, which accepts flags to opt-in/out of individual steps.

## Quick start

```sh
# Dry run: connectivity + audit only
npm run events:recover

# Full recovery against all feeds (writes to public/data/events)
npm run events:recover -- --sync

# Restrict to a single feed id
npm run events:recover -- --feed aurora-special-events --sync
```

By default the recovery script runs the connectivity probe and the audit. Passing `--sync` enables the write-mode sync and automatically follows up with normalization. Use `--normalize` to force the last step without re-syncing, and `--connectivity-only` if you just want to validate access without touching any other stage.

## Connectivity diagnostics

`scripts/events-connectivity.mjs` powers the first step. It performs lightweight HEAD/GET checks against every configured feed (and HTML fallback where defined) and exits non-zero if any primary feed URL fails. Results are printed as a table and optionally written to JSON when `--json <path>` is supplied – the recovery script handles this automatically.

Key flags:

- `--feed <id>` – Limit the probe to a specific `event-feeds.json` entry (repeatable).
- `--timeout <ms>` – Override the per-request timeout (defaults to 12 seconds).
- `--concurrency <n>` – Control how many feeds are checked in parallel.

If you only need the probe you can run it directly:

```sh
npm run events:connectivity -- --timeout 8000
```

## Networking safeguards

The sync, ingest, and HTTP helper modules now share a runtime shim (`lib/events/runtime.js`) that:

- Forces Node’s resolver to prefer IPv4 addresses (`dns.setDefaultResultOrder('ipv4first')`) to avoid `ENETUNREACH` failures on environments that expose IPv6 without routing.
- Installs a global Undici agent pinned to IPv4 with keep-alive enabled so repeated fetches reuse sockets.
- Detects standard proxy variables (`HTTPS_PROXY`, `HTTP_PROXY`, or `ALL_PROXY`) and automatically routes requests through the configured proxy. Supply `NO_PROXY` to list domains that should continue to bypass the proxy.

This configuration is loaded automatically by the long-running scripts (`sync-events.mjs`, `ingest-events.js`, `lib/events/http-client.js`, and transitively anything using the HTTP client), so no manual action is required beyond exporting the desired proxy variables before running the recovery workflow.

## Environment checks before syncing

Before executing `npm run events:recover -- --sync` ensure the following secrets are present in GitHub Actions and the Vercel project:

- `SYNC_SECRET`
- `NEXT_PUBLIC_SYNC_SECRET`
- `GH_TOKEN`
- `GITHUB_REPO`

If any secret is missing or rotated, update it in both locations so the daily automation and the `/api/sync-now` endpoint stay in sync.

## After the run

1. Inspect the generated connectivity JSON and the latest audit log under `logs/` for any lingering failures.
2. Spot check a handful of regenerated files in `public/data/events/` and verify `_sync-summary.json` reflects the expected counts.
3. Commit any URL discoveries recorded in `logs/events-url-updates.log` if the sync rewrote feed endpoints.
4. Monitor the next scheduled workflow run – consider wiring the connectivity probe into a scheduled check so network regressions surface before the main sync fails again.
