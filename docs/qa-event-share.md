# Event Share QA Checklist

The following real events were used to confirm share controls, metadata, and fallbacks:

1. **Finally Home Agents Golf Tournament**  
   Slug: `2025-10-04-finally-home-agents-golf-tournament-scramble-at-mill-run`  
   *Has hero image, onsite location, single-day.*
2. **Aurora Cultural Centre Fall Exhibition**  
   Slug: `aurora-cultural-centre-10002644-1758067200-1760572799-auroraculturalcentre.ca-20250916`  
   *No image (fallback cover used), multi-day date range, onsite.*
3. **Tourism Now Workshop (Discover Stouffville)**  
   Slug: `discover-stouffville-https-discoverstouffville.ca-event-tourism-now--20251023`  
   *Detailed description, includes postal code and organizer metadata.*

## Manual Verification Steps

- Load each `/events/:slug` page and ensure the Share button is visible beside “Add to calendar” on desktop and mobile breakpoints.
- Trigger the Share button:
  - On mobile (Web Share API available) verify the native share sheet opens with the correct title and URL.
  - On desktop verify the canonical URL is copied to the clipboard and the “Link copied” toast appears and dismisses automatically.
- Use the “Copy link” button in the social section to confirm the clipboard fallback also triggers the toast.
- Inspect the page `<head>` (or View Source) and verify:
  - `<title>` follows the `${event.title} | NorthSide GTA` format.
  - Canonical, Open Graph, and Twitter tags all point to `https://northsidegta.ca/events/:slug` with the event-specific description and image.
  - JSON-LD script contains `@type: "Event"` with start/end dates, attendance mode, location PostalAddress, and image array.
- Paste the event URL into Slack or iMessage to confirm the preview uses the event-specific metadata (title, description, and hero/fallback image).
- Validate the JSON-LD with [Google’s Rich Results Test](https://search.google.com/test/rich-results) for at least one event; ensure it passes as an Event.
- Confirm each slug appears in `public/sitemap.xml` under `/events/:slug` after running `npm run build` (or `node scripts/generate-sitemap.js`).

## Notes

- The Share toast uses an `aria-live="polite"` region so screen readers announce clipboard success without stealing focus.
- Fallback Open Graph art is `/Images/hero-desktop.jpg` at the required aspect ratio.
- Events without explicit province/country default to `ON` and `CA` in structured data.
