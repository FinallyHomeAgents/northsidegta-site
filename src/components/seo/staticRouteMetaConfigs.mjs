import { BUYERS_SCHEMA } from "./buyersSchema.mjs";
import sellersSchemaModule from "../../lib/structuredData/sellersPage.js";
import movingGuideContentModule from "../../content/movingFromToronto/georgina.js";
import eastGwillimburyMovingGuideModule from "../../content/movingFromToronto/eastGwillimbury.js";
import uxbridgeMovingGuideModule from "../../content/movingFromToronto/uxbridge.js";
import newmarketMovingGuideModule from "../../content/movingFromToronto/newmarket.js";
import auroraMovingGuideModule from "../../content/movingFromToronto/aurora.js";
import stouffvilleMovingGuideModule from "../../content/movingFromToronto/stouffville.js";
import scugogMovingGuideModule from "../../content/movingFromToronto/scugog.js";

const { buildSellersPageSchema, SELLERS_PAGE_TITLE, SELLERS_PAGE_DESCRIPTION } = sellersSchemaModule;
const { georginaMovingGuide, buildMovingGuideSchema } = movingGuideContentModule;
const { eastGwillimburyMovingGuide } = eastGwillimburyMovingGuideModule;
const { uxbridgeMovingGuide } = uxbridgeMovingGuideModule;
const { newmarketMovingGuide } = newmarketMovingGuideModule;
const { auroraMovingGuide } = auroraMovingGuideModule;
const { stouffvilleMovingGuide } = stouffvilleMovingGuideModule;
const { scugogMovingGuide } = scugogMovingGuideModule;
const MOVING_GUIDES = [
  georginaMovingGuide,
  eastGwillimburyMovingGuide,
  uxbridgeMovingGuide,
  newmarketMovingGuide,
  auroraMovingGuide,
  stouffvilleMovingGuide,
  scugogMovingGuide,
];

const DEFAULT_GLOBAL_META_CONFIG = {
  route: "/",
  documentTitle: "NorthSide GTA Real Estate | Finally Home Agents",
  title: "NorthSide GTA Real Estate | Finally Home Agents",
  description:
    "Buy or sell north of Toronto with Finally Home Agents. Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.",
  canonicalUrl: "https://northsidegta.ca/",
  ogType: "website",
  ogImage: "https://northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg",
  ogImageAlt:
    "Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog",
  twitterCard: "summary_large_image",
  twitterImage: "https://northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg",
  twitterImageAlt:
    "Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog",
  siteName: "NorthSide GTA",
  additionalMeta: [
    { name: "robots", content: "index, follow" },
    { property: "og:locale", content: "en_CA" },
    { name: "author", content: "Finally Home Agents" },
    { name: "publisher", content: "Finally Home Agents" },
    { name: "twitter:site", content: "@northsidegta" },
    { name: "facebook-domain-verification", content: "1tfwypal0s72obxs9238figl03nk5i" },
    { name: "geo.region", content: "CA-ON" },
    { name: "geo.placename", content: "Newmarket, Ontario, Canada" },
    { name: "language", content: "en-CA" },
    { name: "referrer", content: "strict-origin-when-cross-origin" },
  ],
};

const STATIC_ROUTE_META_CONFIGS = [
  {
    route: "/",
    meta: {
      ...DEFAULT_GLOBAL_META_CONFIG,
      additionalMeta: [
        ...DEFAULT_GLOBAL_META_CONFIG.additionalMeta,
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
      ],
    },
  },

  {
    route: "/keswick-lower-priced-homes",
    meta: {
      route: "/keswick-lower-priced-homes",
      documentTitle: "Keswick Homes for Sale at Lower Price Points | NorthSide GTA",
      title: "Lower-Priced Keswick Homes | NorthSide GTA",
      description:
        "Browse current lower-priced homes in Keswick and Georgina. See price bands, local market notes, and get alerts for new opportunities north of Toronto.",
      canonicalUrl: "https://northsidegta.ca/keswick-lower-priced-homes",
      ogType: "website",
      ogImage: "https://northsidegta.ca/Images/seo/keswick-lower-priced-homes-og.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/Images/seo/keswick-lower-priced-homes-og.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/buyers",
    meta: {
      route: "/buyers",
      documentTitle: "Buying a Home North of Toronto | Buyers Guide | Finally Home Agents | NorthSide GTA",
      title: "Buying a Home North of Toronto | Finally Home Agents | NorthSide GTA",
      description:
        "Buying a home north of Toronto? Finally Home Agents guides buyers across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog. Local expertise, town-by-town guidance, and a free strategy call.",
      canonicalUrl: "https://northsidegta.ca/buyers",
      ogType: "website",
      ogImage: "https://northsidegta.ca/uploads/buyers-page-seo.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/uploads/buyers-page-seo.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { name: "robots", content: "index,follow" },
        { name: "author", content: "Finally Home Agents" },
        { name: "publisher", content: "Finally Home Agents" },
      ],
      schema: BUYERS_SCHEMA,
    },
  },
  {
    route: "/choose-your-path",
    meta: {
      route: "/choose-your-path",
      documentTitle: "Find the Right Buyer Agent | Finally Home Agents – NorthSide GTA",
      title: "Find the Right Buyer Agent | Finally Home Agents – NorthSide GTA",
      description:
        "Looking for an agent to help you buy a home in the NorthSide GTA? Connect with Finally Home Agents for a human, priority-first buying experience.",
      canonicalUrl: "https://northsidegta.ca/choose-your-path",
      ogType: "website",
      ogImage: "/uploads/insights/uxbridge-aerial-neighbourhood-2026.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/insights/uxbridge-aerial-neighbourhood-2026.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/sellers",
    meta: {
      route: "/sellers",
      documentTitle: SELLERS_PAGE_TITLE,
      title: SELLERS_PAGE_TITLE,
      description: SELLERS_PAGE_DESCRIPTION,
      canonicalUrl: "https://northsidegta.ca/sellers",
      ogType: "website",
      ogImage: "https://northsidegta.ca/uploads/sellers-page-seo.jpg",
      ogImageAlt: "Bright living room with NorthSide GTA and Finally Home Agents branding",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/uploads/sellers-page-seo.jpg",
      twitterImageAlt: "Bright living room with NorthSide GTA and Finally Home Agents branding",
      siteName: "NorthSide GTA",
      additionalMeta: [{ name: "robots", content: "index, follow" }],
      schema: buildSellersPageSchema(),
    },
  },
  {
    route: "/recommended",
    meta: {
      route: "/recommended",
      documentTitle: "Sell Your Home in the NorthSide GTA | Start with a Local Plan",
      title: "Sell Your Home in the NorthSide GTA | Start with a Local Plan",
      description:
        "Start your home sale with Matthew & Landon Mulhall, Sales Representatives at HomeLife Optimum Realty. Complimentary listing prep consult, clear plan, and local NorthSide GTA expertise.",
      canonicalUrl: "https://northsidegta.ca/recommended",
      ogType: "website",
      ogImage: "/uploads/og-launch-home-sale-northside-gta.webp",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/og-launch-home-sale-northside-gta.webp",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/communities",
    meta: {
      route: "/communities",
      documentTitle: "NorthSide GTA Communities | Compare Towns North of Toronto",
      title: "NorthSide GTA Communities | Compare Towns North of Toronto",
      description:
        "Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with Matthew and Landon Mulhall of Finally Home Agents.",
      canonicalUrl: "https://northsidegta.ca/communities",
      ogType: "website",
      ogImage: "https://northsidegta.ca/assets/homepage/northside-map.svg",
      ogImageAlt: "NorthSide GTA community comparison map",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/assets/homepage/northside-map.svg",
      twitterImageAlt: "NorthSide GTA community comparison map",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { name: "robots", content: "index, follow" },
        { property: "og:locale", content: "en_CA" },
        { name: "geo.region", content: "CA-ON" },
        { name: "geo.placename", content: "NorthSide GTA, Ontario, Canada" },
      ],
    },
  },
  {
    route: "/community",
    meta: {
      route: "/community",
      documentTitle: "NorthSide Events Guide | What’s Happening Across the NorthSide GTA",
      title: "NorthSide Events Guide | What’s Happening Across the NorthSide GTA",
      description:
        "See what's happening across Uxbridge, Georgina, Stouffville, Newmarket, Aurora and the rest of the NorthSide GTA this week. The NorthSide Events Guide brings local community events together in one place.",
      canonicalUrl: "https://northsidegta.ca/community",
      ogType: "website",
      ogImage: "/uploads/community-page-seo.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/community-page-seo.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/community/events",
    meta: {
      route: "/community/events",
      documentTitle: "NorthSide Events Guide | What’s Happening Across the NorthSide GTA",
      title: "NorthSide Events Guide | What’s Happening Across the NorthSide GTA",
      description:
        "See what's happening across Uxbridge, Georgina, Stouffville, Newmarket, Aurora and the rest of the NorthSide GTA this week. The NorthSide Events Guide brings local community events together in one place.",
      canonicalUrl: "https://northsidegta.ca/community/events",
      ogType: "website",
      ogImage: "/uploads/community-page-seo.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/community-page-seo.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/community/submit-event",
    meta: {
      route: "/community/submit-event",
      documentTitle: "Submit a Community Event | NorthSide GTA",
      title: "Submit a Community Event | NorthSide GTA",
      description:
        "Share your local event with the NorthSide GTA community. Submit your event details and we’ll help get the word out across our community calendar.",
      canonicalUrl: "https://northsidegta.ca/community/submit-event",
      ogType: "website",
      ogImage: "/Images/hero-desktop.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/hero-desktop.jpg",
      siteName: "NorthSide GTA",
    },
  },

  {
    route: "/listings/5670-thomas-drive-baldwin",
    meta: {
      route: "/listings/5670-thomas-drive-baldwin",
      documentTitle: "5670 Thomas Drive, Baldwin ON | Detached Bungalow for Sale",
      title: "5670 Thomas Drive, Baldwin ON | Detached Bungalow for Sale",
      description:
        "Explore 5670 Thomas Drive in Baldwin, Georgina. View the walkthrough video, photos, floor plans, listing details, and request a showing with Finally Home Agents.",
      canonicalUrl: "https://northsidegta.ca/listings/5670-thomas-drive-baldwin",
      ogType: "website",
      ogImage: "https://northsidegta.ca/Images/5670-thomas-drive-og.jpg",
      ogImageAlt: "5670 Thomas Drive in Baldwin, Georgina",
      twitterCard: "summary_large_image",
      twitterTitle: "5670 Thomas Drive, Baldwin ON | Detached Bungalow for Sale",
      twitterDescription:
        "Explore 5670 Thomas Drive in Baldwin, Georgina. View the walkthrough video, photos, floor plans, listing details, and request a showing with Finally Home Agents.",
      twitterImage: "https://northsidegta.ca/Images/5670-thomas-drive-og.jpg",
      twitterImageAlt: "5670 Thomas Drive in Baldwin, Georgina",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { property: "og:image:secure_url", content: "https://northsidegta.ca/Images/5670-thomas-drive-og.jpg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: "https://northsidegta.ca/listings/5670-thomas-drive-baldwin" }
      ],
    },
  },

  {
    route: "/listings/33-st-augustine-drive-brooklin",
    meta: {
      route: "/listings/33-st-augustine-drive-brooklin",
      documentTitle: "33 St Augustine Drive, Brooklin ON | 2020-Built Family Home for Sale",
      title: "33 St Augustine Drive, Brooklin ON | 2020-Built Family Home for Sale",
      description:
        "Explore 33 St Augustine Drive in Brooklin, Whitby. View the walkthrough video, photos, floor plans, listing details, and request a showing with Finally Home Agents.",
      canonicalUrl: "https://northsidegta.ca/listings/33-st-augustine-drive-brooklin",
      ogType: "website",
      ogImage: "https://northsidegta.ca/Images/33-st-augustine-drive-og.jpg",
      ogImageAlt: "33 St Augustine Drive in Brooklin, Whitby",
      twitterCard: "summary_large_image",
      twitterTitle: "33 St Augustine Drive, Brooklin ON | 2020-Built Family Home for Sale",
      twitterDescription:
        "Explore 33 St Augustine Drive in Brooklin, Whitby. View the walkthrough video, photos, floor plans, listing details, and request a showing with Finally Home Agents.",
      twitterImage: "https://northsidegta.ca/Images/33-st-augustine-drive-og.jpg",
      twitterImageAlt: "33 St Augustine Drive in Brooklin, Whitby",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { property: "og:image:secure_url", content: "https://northsidegta.ca/Images/33-st-augustine-drive-og.jpg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: "https://northsidegta.ca/listings/33-st-augustine-drive-brooklin" }
      ],
    },
  },
  {
    route: "/media",
    meta: {
      route: "/media",
      documentTitle: "Videos + Reels — NorthSide GTA & Finally Home Agents",
      title: "Videos + Reels — NorthSide GTA & Finally Home Agents",
      description:
        "Watch our latest NorthSide GTA and Finally Home Agents videos and Instagram Reels — listings, community, and brand stories.",
      canonicalUrl: "https://northsidegta.ca/media",
      ogType: "website",
      ogImage: "/uploads/hero-poster.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/hero-poster.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/about",
    meta: {
      route: "/about",
      documentTitle: "About Finally Home Agents | Local NorthSide GTA Realtors®",
      title: "About Finally Home Agents | Local NorthSide GTA Realtors®",
      description:
        "We’re a local, relationship-first real estate team serving the NorthSide GTA—Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog.",
      canonicalUrl: "https://northsidegta.ca/about",
      ogType: "profile",
      ogImage: "/Images/northsidegta-map-bg.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/northsidegta-map-bg.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/coffee",
    meta: {
      route: "/coffee",
      documentTitle: "Book a Coffee | Finally Home Agents",
      title: "Book a Coffee | Finally Home Agents",
      description:
        "Book a coffee with Finally Home Agents. Pick a day and start time from 9am to 9pm and we'll confirm the time and location.",
      canonicalUrl: "https://northsidegta.ca/coffee",
      ogType: "website",
      ogImage: "/Images/northsidegta-map-bg.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/northsidegta-map-bg.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/contact",
    meta: {
      route: "/contact",
      documentTitle: "Contact Finally Home Agents | NorthSide GTA Real Estate Experts",
      title: "Contact Finally Home Agents | NorthSide GTA Real Estate Experts",
      description:
        "Talk to NorthSide GTA real estate experts for buying and selling guidance across Uxbridge, Georgina, Scugog, Stouffville, East Gwillimbury, and Newmarket.",
      canonicalUrl: "https://northsidegta.ca/contact",
      ogType: "website",
      ogImage: "/Images/northsidegta-map-bg.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/northsidegta-map-bg.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/insights",
    meta: {
      route: "/insights",
      documentTitle: "NorthSide GTA Insights — Stories, Market Updates & Local Highlights",
      title: "NorthSide GTA Insights — Stories, Market Updates & Local Highlights",
      description:
        "Discover the latest stories, market updates, and community insights from the NorthSide GTA. Learn what’s happening across Uxbridge, Stouffville, Georgina, East Gwillimbury, and beyond — powered by Finally Home Agents.",
      canonicalUrl: "https://northsidegta.ca/insights",
      ogType: "website",
      ogImage: "https://northsidegta.ca/uploads/insights/northside-insights-hero.png",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/uploads/insights/northside-insights-hero.png",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/tastehub",
    meta: {
      route: "/tastehub",
      documentTitle: "NorthSide TasteHub™ | Community Food Rankings Across the NorthSide GTA",
      title: "NorthSide TasteHub™ | Community Food Rankings Across the NorthSide GTA",
      description:
        "NorthSide TasteHub™ is where locals rank the best pizza, wings, date night spots and more across Uxbridge, Georgina, Stouffville, Aurora, Newmarket and the rest of the NorthSide GTA. Check live rankings or cast your vote today.",
      canonicalUrl: "https://northsidegta.ca/tastehub",
      ogType: "website",
      ogImage: "/seo/tastehub-default-poll-share.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/seo/tastehub-default-poll-share.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/tastehub/request-tabletop-sign",
    meta: {
      route: "/tastehub/request-tabletop-sign",
      documentTitle: "Request a Tabletop Sign | NorthSide TasteHub",
      title: "Request a Tabletop Sign | NorthSide TasteHub",
      description:
        "Featured restaurants on NorthSide TasteHub receive priority visibility — plus a tabletop sign that makes it easy for guests to vote. Limited to 50 this round.",
      canonicalUrl: "https://northsidegta.ca/tastehub/request-tabletop-sign",
      ogType: "website",
      ogImage: "/seo/tastehub-default-poll-share.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/seo/tastehub-default-poll-share.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/power-of-sale-support",
    meta: {
      route: "/power-of-sale-support",
      documentTitle: "Power of Sale Listing Support | NorthSide GTA",
      title: "Power of Sale Listing Support | NorthSide GTA",
      description:
        "Structured real estate support for power of sale and lender-directed listings across the NorthSide GTA.",
      canonicalUrl: "https://northsidegta.ca/power-of-sale-support",
      ogType: "website",
      ogImage: "/uploads/detachedhomesnorthsidelink.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/detachedhomesnorthsidelink.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [{ name: "robots", content: "noindex,nofollow" }],
    },
  },
  {
    route: "/cms/tastehub",
    meta: {
      route: "/cms/tastehub",
      documentTitle: "TasteHub CMS | NorthSide GTA",
      title: "TasteHub CMS | NorthSide GTA",
      description:
        "Access the TasteHub CMS to manage polls, ballots, and community-powered content for the NorthSide GTA.",
      canonicalUrl: "https://northsidegta.ca/cms/tastehub",
      ogType: "website",
      ogImage: "/Images/og-home.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/og-home.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { name: "robots", content: "noindex,nofollow" },
      ],
    },
  },
];

const SITE_URL = "https://northsidegta.ca";
const AUTHOR_PUBLISHER_META = [
  { name: "author", content: "Finally Home Agents" },
  { name: "publisher", content: "Finally Home Agents" },
];
const INDEX_META = [{ name: "robots", content: "index, follow" }, ...AUTHOR_PUBLISHER_META];
const NOINDEX_META = [{ name: "robots", content: "noindex, follow" }, ...AUTHOR_PUBLISHER_META];
const CORE_TOWNS = ["Georgina", "East Gwillimbury", "Newmarket", "Aurora", "Stouffville", "Uxbridge", "Scugog"];
const COMMUNITY_IMAGE = `${SITE_URL}/uploads/community-page-seo.jpg`;
const HOME_IMAGE = `${SITE_URL}/uploads/northside-gta-finally-home-agents-hero.jpg`;
const SELLERS_IMAGE = `${SITE_URL}/uploads/sellers-page-seo.jpg`;
const SELLERS_IMAGE_ALT = "Bright living room with NorthSide GTA and Finally Home Agents branding";

function areaServedPlaces(townNames = CORE_TOWNS) {
  return townNames.map((name) => ({ "@type": "Place", name: `${name}, Ontario` }));
}

function breadcrumbSchema(path, label) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }];
  if (path !== "/") {
    if (path.startsWith("/communities/")) {
      items.push({ "@type": "ListItem", position: 2, name: "Communities", item: `${SITE_URL}/communities` });
      items.push({ "@type": "ListItem", position: 3, name: label, item: url });
    } else {
      items.push({ "@type": "ListItem", position: 2, name: label, item: url });
    }
  }
  return { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: items };
}

function baseAgentNode() {
  return {
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${SITE_URL}/#finally-home-agents`,
    name: "Finally Home Agents",
    alternateName: "NorthSide GTA",
    url: SITE_URL,
    brand: { "@type": "Brand", name: "NorthSide GTA", url: SITE_URL },
    parentOrganization: { "@type": "Organization", name: "HomeLife Optimum Realty, Brokerage" },
    telephone: "+1-647-668-4646",
    email: "finallyhomeagents@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Newmarket",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    employee: [
      { "@type": "Person", name: "Matthew Mulhall", jobTitle: "Real Estate Agent" },
      { "@type": "Person", name: "Landon Mulhall", jobTitle: "Real Estate Agent" },
    ],
    areaServed: areaServedPlaces(),
  };
}

function makePageSchema({ path, title, description, pageType = "WebPage", image, serviceType, collectionItems, town }) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const label = town || (path === "/" ? "Home" : title.split("|")[0].trim());
  const graph = [baseAgentNode(), {
    "@type": path === "/" ? "WebSite" : pageType,
    "@id": path === "/" ? `${SITE_URL}/#website` : `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: "en-CA",
    publisher: { "@id": `${SITE_URL}/#finally-home-agents` },
    image,
  }];
  if (path !== "/") graph.push(breadcrumbSchema(path, label));
  if (serviceType) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: serviceType,
      serviceType,
      url,
      provider: { "@id": `${SITE_URL}/#finally-home-agents` },
      areaServed: areaServedPlaces(town ? [town] : CORE_TOWNS),
      description,
    });
  }
  if (town) {
    graph.push({
      "@type": "Place",
      "@id": `${url}#place`,
      name: `${town}, Ontario`,
      url,
      containedInPlace: { "@type": "AdministrativeArea", name: "Ontario" },
    });
  }
  if (collectionItems) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      name: "NorthSide GTA Communities",
      itemListElement: collectionItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}${item.path}`,
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

function routeMeta({ route, title, description, image, imageAlt, robots = "index, follow", pageType = "WebPage", schema, serviceType, collectionItems, town }) {
  const canonicalUrl = `${SITE_URL}${route === "/" ? "/" : route}`;
  return {
    route,
    ignoreSiteSeo: true,
    documentTitle: title,
    title,
    description,
    canonicalUrl,
    ogType: pageType === "Article" ? "article" : "website",
    ogImage: image,
    ogImageAlt: imageAlt,
    twitterCard: "summary_large_image",
    twitterImage: image,
    twitterImageAlt: imageAlt,
    siteName: "NorthSide GTA",
    additionalMeta: [
      { name: "robots", content: robots },
      { property: "og:locale", content: "en_CA" },
      ...AUTHOR_PUBLISHER_META,
    ],
    schema: schema || makePageSchema({ path: route, title, description, pageType, image, serviceType, collectionItems, town }),
  };
}

const COMMUNITY_ITEMS = [
  { name: "Georgina", path: "/communities/georgina" },
  { name: "East Gwillimbury", path: "/communities/east-gwillimbury" },
  { name: "Newmarket", path: "/communities/newmarket" },
  { name: "Aurora", path: "/communities/aurora" },
  { name: "Stouffville", path: "/communities/stouffville" },
  { name: "Uxbridge", path: "/communities/uxbridge" },
  { name: "Scugog", path: "/communities/scugog" },
];

const TOWN_REMEDIATION = [
  ["/communities/georgina", "Georgina", "Georgina Real Estate & Homes | Moving to Georgina | Finally Home Agents", "Explore Georgina real estate north of Toronto, including homes in Keswick, Sutton, and Jackson's Point, with local guidance from Finally Home Agents."],
  ["/communities/east-gwillimbury", "East Gwillimbury", "East Gwillimbury Real Estate & Homes | Moving to East Gwillimbury | Finally Home Agents", "Explore East Gwillimbury real estate north of Toronto, including Holland Landing, Sharon, Queensville, and Mount Albert, with Finally Home Agents."],
  ["/communities/newmarket", "Newmarket", "Newmarket Real Estate & Homes | Moving to Newmarket | Finally Home Agents", "Explore Newmarket real estate north of Toronto, from Main Street and established neighbourhoods to GO Transit access, with Finally Home Agents."],
  ["/communities/aurora", "Aurora", "Aurora Real Estate & Homes | Moving to Aurora | Finally Home Agents", "Explore Aurora real estate north of Toronto, including established neighbourhoods, luxury homes, schools, and GO Transit access, with Finally Home Agents."],
  ["/communities/stouffville", "Stouffville", "Stouffville Real Estate & Homes | Moving to Stouffville | Finally Home Agents", "Explore Stouffville real estate north of Toronto, including Main Street, family neighbourhoods, newer homes, and GO Transit, with Finally Home Agents."],
  ["/communities/uxbridge", "Uxbridge", "Uxbridge Real Estate & Homes | Moving to Uxbridge | Finally Home Agents", "Explore Uxbridge real estate north of Toronto, including family neighbourhoods, rural properties, trails, and golf, with Finally Home Agents."],
  ["/communities/scugog", "Scugog", "Scugog Real Estate & Homes | Moving to Scugog | Finally Home Agents", "Explore Scugog real estate north of Toronto, including Port Perry, Lake Scugog, waterfront homes, and small-town living, with Finally Home Agents."],
];

const SEO_REMEDIATION_ROUTE_META_CONFIGS = [
  { route: "/", meta: routeMeta({ route: "/", title: "NorthSide GTA Real Estate | Finally Home Agents", description: "Buy or sell north of Toronto with Finally Home Agents. Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.", image: HOME_IMAGE, pageType: "WebSite" }) },
  { route: "/buyers", meta: routeMeta({ route: "/buyers", title: "Buying a Home North of Toronto | Finally Home Agents", description: "Buying north of Toronto? Compare Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog with local buyer guidance.", image: `${SITE_URL}/uploads/buyers-page-seo.jpg`, schema: BUYERS_SCHEMA }) },
  ...MOVING_GUIDES.map((guide) => ({
    route: guide.route,
    meta: routeMeta({
      route: guide.route,
      title: guide.title,
      description: guide.description,
      image: `${SITE_URL}${guide.heroImage}`,
      imageAlt: guide.heroImageAlt,
      pageType: "Article",
      schema: buildMovingGuideSchema(guide),
    }),
  })),
  { route: "/sellers", meta: routeMeta({ route: "/sellers", title: SELLERS_PAGE_TITLE, description: SELLERS_PAGE_DESCRIPTION, image: SELLERS_IMAGE, imageAlt: SELLERS_IMAGE_ALT, schema: buildSellersPageSchema(), serviceType: "Seller representation" }) },
  { route: "/communities", meta: routeMeta({ route: "/communities", title: "NorthSide GTA Communities | Compare Towns North of Toronto", description: "Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with Finally Home Agents.", image: COMMUNITY_IMAGE, pageType: "CollectionPage", collectionItems: COMMUNITY_ITEMS }) },
  { route: "/contact", meta: routeMeta({ route: "/contact", title: "Contact Finally Home Agents | NorthSide GTA Real Estate", description: "Contact Matthew and Landon Mulhall for buying, selling, and local real estate guidance across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.", image: `${SITE_URL}/uploads/og-contact-northsidegta.jpg`, pageType: "ContactPage" }) },
  { route: "/about", meta: routeMeta({ route: "/about", title: "About Finally Home Agents | NorthSide GTA Real Estate", description: "Meet Matthew and Landon Mulhall of Finally Home Agents, helping buyers and sellers across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.", image: `${SITE_URL}/uploads/og-about-northsidegta.jpg` }) },
  { route: "/homeanalysis", meta: routeMeta({ route: "/homeanalysis", title: "Get a Home Value Opinion | NorthSide GTA | Finally Home Agents", description: "Find out what your home in Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, or Scugog could sell for today.", image: SELLERS_IMAGE, serviceType: "Home value opinion" }) },
  { route: "/neighbourhood-guide", meta: routeMeta({ route: "/neighbourhood-guide", title: "NorthSide GTA Neighbourhood Guide | Finally Home Agents", description: "Compare home prices, commute times, schools, lifestyle, and local favourites across Aurora, Newmarket, Stouffville, East Gwillimbury, Georgina, Uxbridge, and Scugog.", image: HOME_IMAGE, pageType: "CollectionPage", collectionItems: COMMUNITY_ITEMS }) },
  { route: "/sign", meta: routeMeta({ route: "/sign", title: "Work With Finally Home Agents | NorthSide GTA", description: "Share your buying or selling goals with Finally Home Agents for NorthSide GTA real estate guidance.", image: SELLERS_IMAGE, robots: "noindex, follow", serviceType: "Real estate consultation" }) },
  { route: "/vip", meta: routeMeta({ route: "/vip", title: "VIP Listing Access | NorthSide GTA", description: "Private NorthSide GTA listing access for registered clients and invited buyers.", image: `${SITE_URL}/vip-hero.png`, robots: "noindex, follow", serviceType: "Private listing alerts" }) },
  ...TOWN_REMEDIATION.map(([route, town, title, description]) => ({
    route,
    meta: routeMeta({ route, title, description, image: COMMUNITY_IMAGE, serviceType: `${town} real estate guidance`, town }),
  })),
];

function mergeRouteMetaConfigs(baseConfigs, overrideConfigs) {
  const routeToEntry = new Map();
  [...baseConfigs, ...overrideConfigs].forEach((entry) => {
    if (!entry || !entry.route || !entry.meta) return;
    routeToEntry.set(entry.route, { route: entry.route, meta: entry.meta });
  });
  return Array.from(routeToEntry.values());
}

function cloneMeta(meta = {}) {
  return JSON.parse(JSON.stringify(meta));
}

export function getStaticRouteMeta(route) {
  if (!route) return null;
  const normalized = route === "/" ? "/" : `/${route.replace(/^\//, "")}`;
  const entry = EFFECTIVE_STATIC_ROUTE_META_CONFIGS.find((item) => item.route === normalized);
  if (!entry) return null;
  return cloneMeta(entry.meta);
}

const CLONED_DEFAULT_GLOBAL_META_CONFIG = cloneMeta(DEFAULT_GLOBAL_META_CONFIG);
const EFFECTIVE_STATIC_ROUTE_META_CONFIGS = mergeRouteMetaConfigs(STATIC_ROUTE_META_CONFIGS, SEO_REMEDIATION_ROUTE_META_CONFIGS);

const CLONED_STATIC_ROUTE_META_CONFIGS = EFFECTIVE_STATIC_ROUTE_META_CONFIGS.map((item) => ({
  route: item.route,
  meta: cloneMeta(item.meta),
}));

export { CLONED_DEFAULT_GLOBAL_META_CONFIG as DEFAULT_GLOBAL_META_CONFIG, CLONED_STATIC_ROUTE_META_CONFIGS as STATIC_ROUTE_META_CONFIGS };

export default {
  DEFAULT_GLOBAL_META_CONFIG: CLONED_DEFAULT_GLOBAL_META_CONFIG,
  STATIC_ROUTE_META_CONFIGS: CLONED_STATIC_ROUTE_META_CONFIGS,
  getStaticRouteMeta,
};
