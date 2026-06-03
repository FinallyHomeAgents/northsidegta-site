# Codex Implementation Notes — NorthSide GTA Homepage v4

---

## What This Package Is

This is the **exact approved homepage reference** for northsidegta.ca.

Every file in this package was extracted from the approved, reviewed, and SEO-optimised homepage HTML. Do not create a new or similar homepage — implement **this exact design** as closely as possible inside the existing repo.

---

## What To Implement

Replace the current homepage (`/` route) with this design.

The implementation must match:
- Visual design, layout, spacing, typography, and colours
- All copy, section order, and CTAs (see `homepage-content.md`)
- All SEO metadata, schema, and heading hierarchy (see `homepage-seo.md`)
- All internal links, town routes, buyer/seller routes
- The interactive map (see Map section below)
- The FAQ section (must be visible — FAQPage schema depends on it)
- Market data source/date visible in the UI

---

## What To Remove / Not Ship

Do **not** include in production:
- Browser-side Babel (`<script type="text/babel">`)
- React CDN scripts
- Base64 image blobs
- Bundler manifest / blob URL unpacking
- "Unpacking..." loader screen
- Standalone preview shell wrapper
- Any export-only artifacts

---

## Routing Corrections

All town/community pages use `/communities/[town]` routing — not root-level slugs.

| Town | Correct Route |
|------|--------------|
| Georgina | `/communities/georgina` |
| East Gwillimbury | `/communities/east-gwillimbury` |
| Newmarket | `/communities/newmarket` |
| Aurora | `/communities/aurora` |
| Whitchurch-Stouffville | `/communities/stouffville` |
| Uxbridge | `/communities/uxbridge` |
| Scugog | `/communities/scugog` |

Other key routes:
- Buyers: `/buyers`
- Sellers: `/sellers`
- Home Value / Seller CTA: `/homeanalysis`
- Contact: `/contact`
- Insights: `/insights`
- About: `/about`
- Videos: `/videos`

---

## SEO Requirements

Use `homepage-seo.md` as the complete SEO specification.

Critical items:
1. Exactly one `<h1>`: `NorthSide GTA Real Estate, Guided by Finally Home Agents.`
2. Title tag: `NorthSide GTA Real Estate | Buy & Sell North of Toronto | Finally Home Agents`
3. Canonical: `https://www.northsidegta.ca/`
4. No `meta keywords` tag
5. Full JSON-LD `@graph` schema (5 nodes: Organization, RealEstateAgent+LocalBusiness, WebSite, WebPage, FAQPage)
6. FAQPage schema only valid if FAQ section is **visibly rendered** on the page
7. All 7 town cards must link with descriptive anchor text (e.g. "Explore Aurora Real Estate")
8. `/buyers` must be a crawlable `<a>` link, not only a JS-scroll action

---

## Map Implementation

The homepage features an interactive SVG map of the NorthSide GTA region.

**Option A — Use the static SVG reference (simpler)**
- File: `homepage-map.svg` in this package
- Embed as `<img src="/assets/homepage/northside-map.svg" alt="...">` or inline SVG
- Add JS hover/click handlers for interactivity (optional enhancement)

**Option B — Implement the full interactive component (preferred)**
- viewBox: `0 0 1600 900`
- All path data is in `homepage-map.svg` (extracted from approved homepage)
- CSS for map in `homepage-styles.css` under `.nsmap` section
- Interactive behaviour:
  - Hover → region brightens (`filter: brightness(1.1)`), label sharpens, marker ring glows
  - Click → navigate to `/communities/[town]`
  - Active state → gold ring outline (`box-shadow: 0 0 0 2px #c9a465`)
  - Smooth transition: `260ms cubic-bezier(0.2, 0.8, 0.2, 1)`
- Map is in the hero's right panel (56% width on desktop)
- Panel has a framed header: "Explore the NorthSide GTA / Tap any community to learn more"
- Caption below map updates on hover to show hovered town name

**Map panel structure:**
```html
<div class="hero__map-panel">
  <div class="hero__map-header">
    <div>
      <p class="map-label">Explore the NorthSide GTA</p>
      <p class="map-sublabel">Tap any community to learn more</p>
    </div>
    <div class="map-interactive-badge">
      <span class="pulse-dot pulse-dot--green"></span>
      Interactive
    </div>
  </div>
  <div class="hero__map-frame">
    <!-- SVG map here -->
  </div>
  <div class="hero__map-footer" id="map-caption">
    Seven communities north of Toronto · hover to preview, click to explore
  </div>
</div>
```

---

## Section Order

Implement sections in this exact order:

1. Hero (H1 + subheading + CTAs + Google reviews + map)
2. Social Proof Bar (5 metrics with icons)
3. Buyer / Seller Pathway Panels
4. Community Cards (7 towns, grid)
5. Market Snapshot (TRREB data + visible source/date)
6. Why Work With Finally Home Agents (3 cards)
7. Proof Section: Recent Client Moves + Reviews (combined)
8. Agent Intro (Matthew + Landon)
9. FAQ (visible — matches FAQPage schema)
10. Final CTA
11. Insights Preview (3 articles)

---

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| H1, H2, town names, map labels | Newsreader (serif) | 400, 500 | Load from Google Fonts |
| Nav, body, pills, labels, data | Blinker (sans) | 400, 600, 700 | Load from Google Fonts |

Font sizes use `clamp()` for fluid scaling — see `homepage-styles.css`.

---

## Colour Tokens

```css
--ns-green-dark:  #173f08
--ns-green:       #235c0d
--ns-green-light: #3f7a22
--ns-cream:       #f4efe5
--ns-paper:       #e8e3d7
--ns-navy:        #1c2c4c
--ns-gold:        #c9a465
--ns-muted:       #7d7d70
--ns-water:       #cfe4f3
```

---

## Static Pre-rendering Requirement

The homepage must be statically rendered (SSG or SSR) so that the following are present in the initial HTML before JavaScript runs:

- H1 text
- Hero intro paragraph
- All 7 town links (`/communities/[town]`)
- `/buyers`, `/sellers`, `/contact`, `/homeanalysis` links
- FAQ section (all 5 Q&A pairs)
- Market source/date text
- Navigation links

This is required for Googlebot crawlability. Use Next.js `getStaticProps`, static export, or equivalent.

---

## Assets

See `homepage-assets.md` for the complete asset list, paths, alt text, and optimisation requirements.

Key points:
- All community images: WebP, 16:10 ratio, `loading="lazy"`, with `width`/`height`
- Team photo: WebP, `loading="lazy"`, `width="800" height="600"`
- Map: critical path, do not lazy-load
- Hero OG image: 1200×630 JPEG

---

## After Implementation

1. Run `npm run build` (or equivalent) and confirm no errors
2. Run `npm run lint` and fix any issues
3. Run `npm run typecheck` if TypeScript is used
4. Run any existing tests
5. Validate JSON-LD at https://validator.schema.org
6. Check Open Graph tags with https://developers.facebook.com/tools/debug/
7. Verify canonical URL resolves correctly
8. Confirm all 7 town card links resolve (even if pages are stubs)
9. Confirm `/buyers`, `/sellers`, `/homeanalysis`, `/contact` links resolve
10. Delete this `/docs/homepage-v4-reference/` folder unless needed for documentation

---

## Ready-to-Paste Codex Prompt

```
Implement the approved NorthSide GTA homepage (v4) as described in /docs/homepage-v4-reference/.

This package contains the exact approved design, copy, SEO, and structure. Do not create a new design — implement this one.

Steps:
1. Read all files in /docs/homepage-v4-reference/ before making any changes.
2. Replace the current homepage (/ route) with the structure in homepage-structure.html.
3. Apply all styles from homepage-styles.css (integrate into the project's CSS system or Tailwind config as appropriate).
4. Use all copy exactly as written in homepage-content.md.
5. Implement all SEO metadata, JSON-LD schema, and heading hierarchy from homepage-seo.md.
6. Use /communities/[town] routes for all community page links (not root-level slugs).
7. Use /buyers for the buyer CTA — this must be a crawlable <a> link.
8. Implement or embed the interactive map from homepage-map.svg. Add hover/click interactivity targeting /communities/[town].
9. Ensure the page is statically rendered (SSG) so H1, intro copy, town links, FAQ, and market data are in the initial HTML before JS.
10. Place all assets under /public/assets/ per homepage-assets.md. Use real project photography for community cards.
11. Validate JSON-LD, check all internal links resolve, run build/lint/tests.
12. Do not ship browser-side Babel, React CDN scripts, base64 image blobs, or bundler preview artifacts.
13. Remove /docs/homepage-v4-reference/ after implementation unless needed for documentation.
```

---

## Notes

- The original exported HTML file (`NorthSide_GTA_Homepage.html`) is a bundled preview export — it uses browser-side Babel and a custom blob-unpacking bundler. It is **not** suitable for production deployment. This reference package replaces it for implementation purposes.
- The approved homepage scored **88/100** in design review with a clear path to 95/100 through content refinement. The design, copy, SEO, and structure in this package represent the final approved v4 state.
- Market data (TRREB April 2026) must be updated monthly. Build a mechanism to update the 7 price/DOM/YoY values without a code deploy.
- The Google Reviews strip shows "5.0 Google Rating / Based on client reviews" — do not hardcode the review count. Wire to live data or leave as "Based on client reviews" to avoid staleness.
- RECO compliance: the footer disclaimer "Not intended to solicit clients already under contract with a brokerage." must appear on every page.
