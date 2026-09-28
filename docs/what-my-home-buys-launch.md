# What My Home Buys — launch and lead operations

## What ships

- All seven towns stay open. The calculator compares an estimated home value with all-home-type town averages, not net sale proceeds or a mortgage-qualified purchase budget.
- Optional comparison email; separate address-based home-value request with email, phone or text reply preference. No automatic marketing enrolment.
- Server calculates the emailed figures from `src/data/marketData.v2.json`; browser-supplied town prices are ignored.
- Server saves each lead before delivery, with selected towns, campaign tags, consent, owner, status and a 24-hour follow-up deadline.
- Existing Formspree integration receives the structured lead and notifies its configured recipients. Existing Resend sends the comparison/receipt email. Missing/failed automatic email produces an honest delayed-email message.
- Dedicated 1200×630 Facebook image, crawlable comparisons and FAQs, existing homepage/buyers/seven-town links retained.

## Required launch verification

The Vercel dashboard showed `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FORMSPREE_ENDPOINT` and `RESEND_API_KEY` in All Environments on 2026-09-28. An authorized preview submission to the team contact address returned HTTP 200 and confirmed durable receipt. Matthew confirmed that both the comparison email and the normal lead notification arrived.

Before publishing the Facebook post:

1. Delivery verification is complete: the authorized preview test used campaign `TEST_launch_verification`, and both emails arrived. Do not repeat it unnecessarily. Local form tests separately use simulated services.
2. Confirm who receives the existing Formspree notifications. Default recorded owner: Matthew Mulhall; backup: Landon Mulhall. Optional environment overrides: `BUYING_POWER_LEAD_OWNER`, `BUYING_POWER_LEAD_BACKUP`. These fields do not change Formspree account recipients.
3. Confirm the verified Resend sender (`FROM_EMAIL`, otherwise `Finally Home Agents <no-reply@northsidegta.ca>`). Replies go to `contact@finallyhomeagents.com`.
4. Provide GA4 and Meta IDs and connect the base tags/consent handling. The repo currently exposes tracking calls but no GA4 or Meta base installation was found. Do not claim dashboard tracking is live until receipt is observed in GA4 DebugView and Meta Test Events.
5. Refresh the URL in Facebook Sharing Debugger and verify the title/image. Then use the campaign link below.

## Lead follow-up

Formspree is the everyday inbox. Records also live in the existing private Redis store:

- `buying-power:leads`: sorted IDs by received timestamp.
- `buying-power:lead:<id>`: full record, including `status`, `owner`, `backup`, `followUpDueAt`, `emailStatus`, `notificationStatus`, `communities`, `attribution`, `comparison`.

Check new requests each working day, act before `followUpDueAt`, and use the selected contact method. For comparison-only requests, deliver the requested comparison; no sales call or nurture enrolment is authorized. Update the record status/outcome when contacted or booked. Failed `emailStatus` requires manual delivery; failed `notificationStatus` requires manual attention. Server logs identify failures by reference ID, never contact details. This release does not add a CRM interface or automatic delivery-retry job.

Rate limits: 10 submissions per IP/hour and 3 per email/hour, shared across server instances. Storage/rate-limit service failure returns an error rather than claiming the request was received. Customer emails contain server-owned data and fixed links, not user-supplied URLs.

## Events

- `buyingpower_interaction`: once per mounted page on the first value adjustment.
- `buyingpower_sort`: requested sort order.
- `generate_lead`: only after the server confirms durable receipt; `lead_type` distinguishes `comparison` and `valuation`. Meta receives standard `Lead` with the same distinction.

No name, email, phone, street address, home value or full URL is included in these event payloads. Where a GA4 tag exists, calls go directly to `gtag`; otherwise events enter `dataLayer` for a future GTM connection. No new advertising scripts are silently enabled.

## Market maintenance

After each published TRREB monthly update, verify the source and refresh the shared market-data file using the site's existing process. Run `npm run data:validate` and `npm run build`. The calculator, date labels and email comparisons read that same source. Keep the data month visible; do not imply that town averages are available properties or net cash left after a move.

## Facebook launch copy

What could your home buy north of Toronto?

We built a free comparison tool for anyone considering a move to Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge or Scugog.

Enter your estimated home value to compare town averages, lifestyle, transit access and the trade-offs. Explore all seven towns without signing up—or email yourself the comparison to revisit later.

Try it here:
https://northsidegta.ca/what-my-home-buys?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_buys_launch

Figures use the market-data month shown on the page. Town averages are a starting point, not a valuation of your home or a calculation of your purchase budget.

Matthew Mulhall & Landon Mulhall, Sales Representatives
Finally Home Agents Team | HomeLife Optimum Realty, Brokerage
