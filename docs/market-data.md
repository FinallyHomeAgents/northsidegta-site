# Market data: what to pull and where it goes

Everything the buying-power page says about prices comes from `src/data/marketData.v2.json`.
Nothing else. If a number isn't in that file, the page doesn't claim it.

## The two sources

| | Publishes | Covers | Fills |
|---|---|---|---|
| **TRREB Market Watch** | Monthly, ~3rd working day | Every municipality + Toronto districts, split by home type | `monthly`, `municipalities[].byType`, `toronto` |
| **TRREB Community Housing Market Report** | Quarterly | Communities *within* each municipality, split by home type | `community`, `municipalities[].communities` |

Both are public. Neither requires IDX or VOW — they are published reports, not MLS® record data.
Attribution is required and already in the page footer.

## Monthly routine (~10 minutes)

1. Download the new Market Watch PDF from <https://trreb.ca/market-data/market-watch/>.
2. Find the **ALL HOME TYPES** section. For each of the seven towns copy: Sales, Average Price,
   Median Price, New Listings, Avg. LDOM. Year-over-year comes from the same table's comparison column.
3. Repeat for the **DETACHED**, **SEMI-DETACHED**, **ATT/ROW/TOWNHOUSE**, **CONDO TOWNHOUSE** and
   **CONDO APARTMENT** sections. Same seven towns each time.
4. In the same sections, copy the **City of Toronto district** rows listed in `toronto.districts`.
5. Update `monthly.period` (`YYYY-MM`), `monthly.periodLabel`, `monthly.source`.
6. Put your name in `monthly.verifiedBy` and today's date in `monthly.verifiedOn`.
   Only sign this once you have looked at the PDF yourself.
7. Run `npm run data:validate`. Fix anything it flags. It also runs on every build.

## Quarterly routine

Same, from the Community Housing Market Report for each municipality, into
`municipalities[].communities[].byType`. This is what powers the **entry point** line on each town
card — the "homes starting at roughly $X" figure. It comes from the cheapest *community*, not from
guessing a floor off an average.

## Why the validator exists

An automated extraction of the July 2026 Market Watch returned three municipalities at an identical
detached average to the dollar, and put Georgina's detached average at $1,996,141 — about 2.5x the
town's own all-types average. On a rendered page both look completely normal.

The validator blocks a build when it sees:

- two areas sharing an identical average (parsing artifact, never a coincidence)
- a home type wildly out of line with its own area's all-types average
- prices, days-on-market or year-over-year outside sane bounds
- a median implausibly far from its average
- monthly data more than two months old — the page states its date publicly, so stale figures
  are a misleading representation, not just an out-of-date page

It warns, without blocking, when a figure rests on fewer than 8 sales, and when nobody has signed
`verifiedBy`.

## The rule

**Never publish a figure you have not personally checked against the source PDF.** The validator
catches structural nonsense. It cannot catch a number that is merely wrong.
