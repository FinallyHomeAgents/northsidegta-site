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
    route: "/choose-your-path",
    meta: {
      route: "/choose-your-path",
      documentTitle: "Choose Your Path | Buy With Clarity",
      title: "Choose Your Path | Buy With Clarity",
      description:
        "Choose how you’d like to start the conversation about buying a home — phone, video, coffee, or in person. No pressure, just support.",
      canonicalUrl: "https://northsidegta.ca/choose-your-path",
      ogType: "website",
      ogImage: "/uploads/buyers-page-seo.jpg",
      twitterCard: "summary_large_image",
      twitterImage: "/uploads/buyers-page-seo.jpg",
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
