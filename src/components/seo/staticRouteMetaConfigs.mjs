const DEFAULT_GLOBAL_META_CONFIG = {
  route: "/",
  documentTitle: "NorthSide GTA | Real Estate Agents for Buyers & Sellers",
  title: "NorthSide GTA | Real Estate Agents for Buyers & Sellers",
  description:
    "Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.",
  canonicalUrl: "https://northsidegta.ca/",
  ogType: "website",
  ogImage: "/Images/og-home.jpg",
  ogImageAlt:
    "NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog",
  twitterCard: "summary_large_image",
  twitterImage: "/Images/og-home.jpg",
  twitterImageAlt:
    "NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog",
  siteName: "NorthSide GTA",
  additionalMeta: [
    {
      name: "keywords",
      content:
        "NorthSide GTA, real estate, homes for sale North GTA, sell my home, Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, Scugog",
    },
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
        "Browse current lower-priced homes in Keswick, Georgina. See price bands, local market notes, and get alerts for new opportunities near Lake Simcoe and north of Toronto.",
      canonicalUrl: "https://www.northsidegta.ca/keswick-lower-priced-homes",
      ogType: "website",
      ogImage: "https://www.northsidegta.ca/Images/seo/keswick-lower-priced-homes-og.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "https://www.northsidegta.ca/Images/seo/keswick-lower-priced-homes-og.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [
        {
          name: "keywords",
          content:
            "Keswick homes for sale, Keswick houses for sale, lower priced homes in Keswick, homes for sale in Keswick Ontario, Georgina homes for sale, affordable homes in Georgina, homes north of Toronto",
        },
      ],
    },
  },
  {
    route: "/buyers",
    meta: {
      route: "/buyers",
      documentTitle: "Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents",
      title: "Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents",
      description:
        "Ready to buy in the NorthSide GTA? Get a personalized town match, VIP listing alerts, and expert guidance from Finally Home Agents in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.",
      canonicalUrl: "https://northsidegta.ca/buyers",
      ogType: "website",
      ogImage: "https://northsidegta.ca/uploads/buyers-page-seo.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/uploads/buyers-page-seo.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { name: "robots", content: "index,follow" },
        {
          name: "keywords",
          content:
            "NorthSide GTA homes for sale, buy a home Georgina, buy a home East Gwillimbury, buy a home Newmarket, buy a home Aurora, buy a home Stouffville, buy a home Uxbridge, buy a home Scugog, town match, VIP listing alerts, Finally Home Agents",
        },
      ],
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
      documentTitle: "Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing",
      title: "Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing",
      description:
        "Thinking of selling in the NorthSide GTA? Get AI-backed pricing, pro staging, premium media, and negotiation that wins—serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog.",
      canonicalUrl: "https://northsidegta.ca/sellers",
      ogType: "website",
      ogImage: "https://northsidegta.ca/Images/northsidegta-map-bg.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "https://northsidegta.ca/Images/northsidegta-map-bg.jpg",
      siteName: "NorthSide GTA",
      additionalMeta: [
        { name: "robots", content: "index,follow" },
        {
          name: "keywords",
          content:
            "sell my home NorthSide GTA, list my home Georgina, list my home East Gwillimbury, sell house Newmarket, sell house Aurora, sell house Stouffville, sell house Uxbridge, sell house Scugog, home marketing, real estate agent",
        },
      ],
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
      additionalMeta: [
        {
          name: "keywords",
          content:
            "about Finally Home Agents, NorthSide GTA realtors, local real estate team, Newmarket, Aurora, Uxbridge",
        },
      ],
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

function cloneMeta(meta = {}) {
  return JSON.parse(JSON.stringify(meta));
}

export function getStaticRouteMeta(route) {
  if (!route) return null;
  const normalized = route === "/" ? "/" : `/${route.replace(/^\//, "")}`;
  const entry = STATIC_ROUTE_META_CONFIGS.find((item) => item.route === normalized);
  if (!entry) return null;
  return cloneMeta(entry.meta);
}

const CLONED_DEFAULT_GLOBAL_META_CONFIG = cloneMeta(DEFAULT_GLOBAL_META_CONFIG);
const CLONED_STATIC_ROUTE_META_CONFIGS = STATIC_ROUTE_META_CONFIGS.map((item) => ({
  route: item.route,
  meta: cloneMeta(item.meta),
}));

export { CLONED_DEFAULT_GLOBAL_META_CONFIG as DEFAULT_GLOBAL_META_CONFIG, CLONED_STATIC_ROUTE_META_CONFIGS as STATIC_ROUTE_META_CONFIGS };

export default {
  DEFAULT_GLOBAL_META_CONFIG: CLONED_DEFAULT_GLOBAL_META_CONFIG,
  STATIC_ROUTE_META_CONFIGS: CLONED_STATIC_ROUTE_META_CONFIGS,
  getStaticRouteMeta,
};
