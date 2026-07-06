# NorthSide GTA Events — Editor Guide

Use this quick reference inside the CMS when reviewing or adding Community events. The workflow supports both automatic feed imports (which land as **Pending**) and fully manual entries.

## Approving Events from Feeds
1. Open the **Community Events** collection.
2. Switch the **Status** filter to **Pending**. Items ingested from municipal feeds appear here. Use the quick filters (**Pending**, **This Month**, **Featured**, **By Source**) to narrow the review queue fast.
3. Review the title, date, town and summary. Click the filename to see the full details.
4. If it looks good, change **Status** to **Published** and hit **Save**. The event goes live instantly on the Community page.
5. Not relevant? Set **Status** to **Archived** so it doesn’t show again.

## Adding a New Event Manually
1. Click **New Event**.
2. Complete the basics:
   - Title, start/end date (or toggle **All day**)
   - Town, category, location name & address
   - Summary (140–180 characters) plus the full description
   - Upload an image (optional but recommended)
   - Event website link
3. Set **Source = Manual** (default) and optionally mark **Featured** for spotlight picks.
4. Save with **Status = Published** to make it visible immediately. Use **Pending** if you want to review before publishing.

## Tips for Great Listings
- Keep titles short enough to fit on one line in cards.
- Use badges (Family-friendly, Seasonal, etc.) to improve filter results.
- Add price notes whenever tickets or registrations are required.
- Feature big draws (major festivals, golf tournaments, signature seasonal events) by toggling **Featured This Week**.

## Maintenance & Hygiene
- Past events disappear automatically unless **Show past events** is toggled in the UI.
- Archive events you don’t plan to publish to keep the queue clean.
- Duplicate entries to adjust recurring series quickly—update the dates and summary.
- The **ingest:events** script checks configured municipal feeds and drops new items into Pending. Never auto-publish without review.
