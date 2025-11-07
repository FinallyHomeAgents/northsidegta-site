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
    route: "/community",
    meta: {
      route: "/community",
      documentTitle: "NorthSide GTA Events | What's On Across Aurora, Uxbridge & Beyond",
      title: "NorthSide GTA Events | What's On Across Aurora, Uxbridge & Beyond",
      description:
        "Always-updated guide to NorthSide GTA events across Aurora, Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket and Scugog.",
      canonicalUrl: "https://northsidegta.ca/community",
      ogType: "website",
      ogImage: "/Images/hero-desktop.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/hero-desktop.jpg",
      siteName: "NorthSide GTA",
    },
  },
  {
    route: "/community/events",
    meta: {
      route: "/community/events",
      documentTitle: "NorthSide GTA Events | What's On Across Aurora, Uxbridge & Beyond",
      title: "NorthSide GTA Events | What's On Across Aurora, Uxbridge & Beyond",
      description:
        "Always-updated guide to NorthSide GTA events across Aurora, Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket and Scugog.",
      canonicalUrl: "https://northsidegta.ca/community/events",
      ogType: "website",
      ogImage: "/Images/hero-desktop.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/Images/hero-desktop.jpg",
      siteName: "NorthSide GTA",
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
];

function cloneMeta(meta = {}) {
  return JSON.parse(JSON.stringify(meta));
}

function getStaticRouteMeta(route) {
  if (!route) return null;
  const normalized = route === "/" ? "/" : `/${route.replace(/^\//, "")}`;
  const entry = STATIC_ROUTE_META_CONFIGS.find((item) => item.route === normalized);
  if (!entry) return null;
  return cloneMeta(entry.meta);
}

module.exports = {
  DEFAULT_GLOBAL_META_CONFIG: cloneMeta(DEFAULT_GLOBAL_META_CONFIG),
  STATIC_ROUTE_META_CONFIGS: STATIC_ROUTE_META_CONFIGS.map((item) => ({
    route: item.route,
    meta: cloneMeta(item.meta),
  })),
  getStaticRouteMeta,
};
