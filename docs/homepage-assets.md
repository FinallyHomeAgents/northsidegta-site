# NorthSide GTA Homepage — Asset Manifest (v4)

All assets required to match the approved homepage design exactly.

---

## Fonts

Both fonts are available on Google Fonts. Add to project via `<link>` or `next/font`.

| Font | Weights | Usage |
|------|---------|-------|
| **Newsreader** | 400, 500 (italic + normal) | Serif — H1, H2s, town names, map labels, agent intro |
| **Blinker** | 400, 600, 700, 800 | UI sans — nav, body, pills, subtitles, market data |

```html
<!-- Google Fonts import -->
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400;1,500&family=Blinker:wght@400;600;700;800&display=swap" rel="stylesheet">
```

---

## Logos

| Asset | Path | Type | Used In | Alt Text | Notes |
|-------|------|------|---------|----------|-------|
| NorthSide GTA toolbar badge | `public/assets/logos/northsidegta-toolbar-badge.png` | PNG/WebP | Header (nav), footer | NorthSide GTA | 160×160px recommended |
| Finally Home Agents badge | `public/assets/logos/finally-home-agents-badge.png` | PNG/WebP | Header (nav), footer | Finally Home Agents | 160×80px recommended |
| Google logo | `public/assets/logos/google-logo.png` | PNG/WebP | Hero reviews strip | Google | Use official Google G logo, ~60×20px |

> **Note:** In v4, the header uses a pure text lockup (no logo images). These are only needed if the design reverts to image logos. The current approved design uses CSS typography for the brand lockup.

---

## Hero / OG Image

| Asset | Path | Type | Used In | Alt Text | Load | Size |
|-------|------|------|---------|----------|------|------|
| Homepage hero / OG image | `public/assets/homepage/northside-gta-hero.jpg` | JPEG → WebP | OG:image, Twitter:image | Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog | Critical (OG) | 1200×630px minimum |

---

## Interactive Map

| Asset | Path | Type | Used In | Alt Text | Load | Notes |
|-------|------|------|---------|----------|------|-------|
| NorthSide GTA map SVG | `public/assets/homepage/northside-map.svg` | SVG | Hero map panel | Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog | **Critical — do not lazy-load** (LCP candidate) | See homepage-map.svg for static version. Production version is interactive React component. |

**Map implementation notes:**
- The approved map is a custom SVG with interactive hover/click states rendered via React
- viewBox: `0 0 1600 900`
- Static fallback: use `homepage-map.svg` from this package
- Interactive version: implement using the map-data paths in `homepage-map.svg` with JS hover/click handlers
- Map CSS: extracted in `homepage-styles.css` under `.nsmap` section
- Town links on the production site use `/communities/[town]` routing

---

## Community Photography (7 towns)

Each image appears in the community card grid. Use real photography of each area.
All images: **16:10 aspect ratio**. Recommended: 480×300px minimum, WebP format.

| Asset | Path | Alt Text | Lazy Load |
|-------|------|----------|-----------|
| Georgina | `public/assets/communities/georgina.webp` | Lake Simcoe lifestyle in Georgina — NorthSide GTA real estate north of Toronto | Yes |
| East Gwillimbury | `public/assets/communities/east-gwillimbury.webp` | East Gwillimbury homes and growing communities in the NorthSide GTA | Yes |
| Newmarket | `public/assets/communities/newmarket.webp` | Newmarket neighbourhoods and real estate north of Toronto | Yes |
| Aurora | `public/assets/communities/aurora.webp` | Aurora neighbourhoods and parks in the NorthSide GTA | Yes |
| Whitchurch-Stouffville | `public/assets/communities/stouffville.webp` | Stouffville community and real estate north of Toronto | Yes |
| Uxbridge | `public/assets/communities/uxbridge.webp` | Uxbridge trails and green space in the NorthSide GTA | Yes |
| Scugog | `public/assets/communities/scugog.webp` | Scugog and Port Perry lakeside lifestyle in the NorthSide GTA | Yes |

---

## Team Photography

| Asset | Path | Alt Text | Size | Lazy Load |
|-------|------|----------|------|-----------|
| Matthew & Landon | `public/assets/team/matthew-landon.webp` | Matthew Mulhall and Landon Mulhall of Finally Home Agents — NorthSide GTA real estate | 800×600px min | Yes |

---

## Image Optimisation Requirements

- **Format:** WebP (AVIF where supported) for all photography. SVG for logos and map.
- **Sizes:** Use `srcset` with at least two breakpoints (e.g. 480w, 960w) for community cards.
- **Lazy loading:** All images below the fold (`loading="lazy"`). Hero/map: eager.
- **Width/height:** Always specify `width` and `height` attributes to prevent layout shift (CLS).
- **Alt text:** Every image must have descriptive, keyword-natural alt text as listed above.
- **No base64:** Do not inline images as base64. Serve from `/public/assets/`.

---

## WhatsApp / Social Icons

These are inline SVGs in the approved implementation — no image files needed:
- WhatsApp icon (in agent contact button): `#25D366` green
- Arrow right: used in all CTA buttons
- Star: used in Google reviews strip and review cards
- Location pin, grid, checkmark: used in Why FHA cards

---

## Asset Checklist for Launch

- [ ] Google logo (`google-logo.png`)
- [ ] OG/Twitter hero image (`northside-gta-hero.jpg`, 1200×630)
- [ ] Map SVG or interactive component
- [ ] Georgina community photo
- [ ] East Gwillimbury community photo
- [ ] Newmarket community photo
- [ ] Aurora community photo
- [ ] Whitchurch-Stouffville community photo
- [ ] Uxbridge community photo
- [ ] Scugog community photo
- [ ] Matthew + Landon team photo
- [ ] Newsreader + Blinker fonts loaded
