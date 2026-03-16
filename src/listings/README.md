# Listing Inquiry Pages

This folder contains reusable pages for REALTOR.ca listing inquiries.

## Edit the existing 209 Barrie page

Update this file:

- `src/listings/listingInquiryConfig.js`

Main fields:

- `route`: URL slug for the page.
- `pageTitle`, `seoDescription`, `ogImage`: SEO/Open Graph values.
- `property.*`: address, location, MLS, and hero photo.
- `team.*`: contact info and team members.

### Add/update property photos

In the `property` object:

```js
imageSrc: "/Images/your-listing-photo.jpg",
imageAlt: "Front exterior of 123 Main Street.",
```

### Add/update team photos

For each person in `team.members`:

```js
{
  name: "Agent Name",
  role: "Real Estate Agent",
  imageSrc: "/Images/agent-headshot.jpg",
  imageAlt: "Headshot of Agent Name.",
}
```

> Put image files in `public/Images/` (or any path under `public/`) and reference them with a leading `/`.

## Create a new listing inquiry page

1. Add a new config object in `src/listings/listingInquiryConfig.js`.
2. Create a page wrapper (copy `Inquiry209BarrieStreetPage.js`) and pass your config into `ListingInquiryPage`.
3. Add a route in `src/App.js`:

```jsx
<Route path="/listings/your-new-slug" element={<YourNewListingInquiryPage />} />
```

4. Start the app and test the route.

## Compliance reminder

Before publishing, have broker/compliance review listing-specific wording for seller representation, disclosures, and consent language.
