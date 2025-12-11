# Event Data Normalization

This project now ships with an automated normalizer that keeps all event JSON files aligned with the latest Decap CMS schema. Use it whenever you add or edit events to avoid breaking the admin UI.

## Quick start

```bash
npm run events:normalize
```

Running the command will:

1. Scan every `*.json` file in `public/data/events` (skipping helper files such as `_sync-summary.json`).
2. Apply structural fixes so each document matches the CMS schema (field names, allowed values, formats, and data types).
3. Normalise and reorder the JSON output so repeated runs produce no further changes.
4. Validate the result against the schema and report any files that still need manual intervention.

A typical run prints a summary showing the number of files scanned, changed, or flagged with errors. The command is idempotent—if you re-run it immediately, there should be zero changes.

## Dry-run and CI usage

The script supports two helpful flags:

- `npm run events:normalize -- --dry-run` — preview what _would_ change without touching the files.
- `npm run events:normalize -- --check` — run the dry-run and exit with a non-zero status when fixes are required. GitHub Actions uses this mode to fail pull requests that introduce non-compliant data.

You can also request a machine-readable report:

```bash
npm run events:normalize -- --report logs/events-normalize-report.json
```

The report contains the summary plus a per-file list of fixes that were applied or would be applied in dry-run/check mode.

## Feed health snapshot

When debugging upstream feeds, run a read/write health snapshot to see which sources are producing usable events and whether th
ey surface through the API:

```bash
npm run events:health -- --json logs/events-health.json
```

- The command fetches every enabled feed, applies the same normalization and filters as `ingest-events`, and writes the events 
to `public/data/events` unless `--dry-run` is passed.
- A console table shows counts plus earliest/latest dates per feed; the optional JSON report includes the raw records.
- With writes enabled, the script also checks `/api/events` to confirm ingested slugs are visible to the frontend.

## What gets normalised?

The tool enforces the authoritative schema defined in `public/config.yml` for the **Community Events** collection, including:

- Canonical ISO 8601 timestamps (`YYYY-MM-DDTHH:mm:ssZ`).
- Valid category and town options, with automatic mapping from older values.
- Daily schedule blocks (`use_daily_schedule`, `daily_schedule[]`) normalised to the current shape.
- Boolean fields coerced to true booleans, numeric fields parsed as numbers, and arrays filtered to the allowed options.
- Removal of deprecated feed metadata so the CMS only sees fields it understands.

Every change is tracked in the script output so you can see exactly why a file needed updating.

## Rolling back

If a normalisation pass produces unexpected results, run `git status` to inspect the touched files and use standard git tools to undo them. For example:

```bash
git restore public/data/events/<file>.json
```

Because all transformations are deterministic, once you confirm the output looks right you can commit the changes with a descriptive message (e.g., `chore: normalise event data`).

## Continuous enforcement

The repository now includes a CI workflow (`.github/workflows/events-normalize-check.yml`) that runs `npm run events:normalize -- --check` on every pull request and on pushes to `main`. Submissions that leave the data out of compliance will fail fast with a summary of the required fixes.

