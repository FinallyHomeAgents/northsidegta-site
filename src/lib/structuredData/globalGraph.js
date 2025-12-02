// src/lib/structuredData/globalGraph.js
// Centralized, site-wide JSON-LD graph for NorthSide GTA

const BASE_URL = "https://northsidegta.ca";

const PLACE_IDS = {
  region: `${BASE_URL}/#northside-gta-region`,
  uxbridge: `${BASE_URL}/#uxbridge`,
  georgina: `${BASE_URL}/#georgina`,
  "east-gwillimbury": `${BASE_URL}/#east-gwillimbury`,
  newmarket: `${BASE_URL}/#newmarket`,
  aurora: `${BASE_URL}/#aurora`,
  stouffville: `${BASE_URL}/#stouffville`,
  scugog: `${BASE_URL}/#scugog`,
  keswick: `${BASE_URL}/#keswick`,
  sutton: `${BASE_URL}/#sutton`,
  pefferlaw: `${BASE_URL}/#pefferlaw`,
  sharon: `${BASE_URL}/#sharon`,
  "holland-landing": `${BASE_URL}/#holland-landing`,
  "mount-albert": `${BASE_URL}/#mount-albert`,
  queensville: `${BASE_URL}/#queensville`,
  "port-perry": `${BASE_URL}/#port-perry`,
  toronto: `${BASE_URL}/#toronto`,
  markham: `${BASE_URL}/#markham`,
  vaughan: `${BASE_URL}/#vaughan`,
  "richmond-hill": `${BASE_URL}/#richmond-hill`,
  pickering: `${BASE_URL}/#pickering`,
  ajax: `${BASE_URL}/#ajax`,
  whitby: `${BASE_URL}/#whitby`,
};

const CORE_TOWNS = [
  {
    slug: "uxbridge",
    name: "Uxbridge",
    description:
      "Uxbridge is a NorthSide GTA township known for its trails, charming main street, and rolling rural landscapes.",
  },
  {
    slug: "georgina",
    name: "Georgina",
    description:
      "Georgina delivers lakefront living on Lake Simcoe with marinas, beaches, and family neighbourhoods across the NorthSide GTA shoreline.",
  },
  {
    slug: "east-gwillimbury",
    name: "East Gwillimbury",
    description:
      "East Gwillimbury blends new master-planned communities with countryside space, offering quick access to the 404 and GO transit.",
  },
  {
    slug: "newmarket",
    name: "Newmarket",
    description:
      "Newmarket is a vibrant NorthSide GTA hub with historic Main Street, healthcare anchors, and transit-friendly neighbourhoods.",
  },
  {
    slug: "aurora",
    name: "Aurora",
    description:
      "Aurora mixes established neighbourhoods, parks, and commute-friendly access to the 404 for NorthSide GTA buyers and sellers.",
  },
  {
    slug: "stouffville",
    name: "Stouffville",
    description:
      "Stouffville offers small-town warmth, GO Train convenience, and a growing food scene within the NorthSide GTA.",
  },
  {
    slug: "scugog",
    name: "Scugog",
    description:
      "Scugog surrounds Lake Scugog with golf, boating, and rural space, giving NorthSide GTA residents a relaxed lakeside pace.",
  },
].map((place) => ({
  ...place,
  containedInPlace: { "@id": PLACE_IDS.region },
}));

const REGION_NODE = {
  "@type": "AdministrativeArea",
  "@id": PLACE_IDS.region,
  name: "NorthSide GTA",
  url: BASE_URL,
  description:
    "NorthSide GTA is the regional real estate and community hub connecting buyers, sellers, and locals across Uxbridge, Georgina, Newmarket, Aurora, East Gwillimbury, Stouffville, and Scugog.",
  hasPart: CORE_TOWNS.map((place) => ({ "@id": PLACE_IDS[place.slug] })),
};

const HAMLETS = [
  { slug: "keswick", name: "Keswick", parentSlug: "georgina" },
  { slug: "sutton", name: "Sutton", parentSlug: "georgina" },
  { slug: "pefferlaw", name: "Pefferlaw", parentSlug: "georgina" },
  { slug: "sharon", name: "Sharon", parentSlug: "east-gwillimbury" },
  { slug: "holland-landing", name: "Holland Landing", parentSlug: "east-gwillimbury" },
  { slug: "mount-albert", name: "Mount Albert", parentSlug: "east-gwillimbury" },
  { slug: "queensville", name: "Queensville", parentSlug: "east-gwillimbury" },
  { slug: "port-perry", name: "Port Perry", parentSlug: "scugog" },
];

const BORDER_CITIES = [
  { slug: "toronto", name: "Toronto" },
  { slug: "markham", name: "Markham" },
  { slug: "vaughan", name: "Vaughan" },
  { slug: "richmond-hill", name: "Richmond Hill" },
  { slug: "pickering", name: "Pickering" },
  { slug: "ajax", name: "Ajax" },
  { slug: "whitby", name: "Whitby" },
];

const PLACE_NODES = [
  ...CORE_TOWNS,
  ...HAMLETS.map((hamlet) => ({
    slug: hamlet.slug,
    name: hamlet.name,
    containedInPlace: { "@id": PLACE_IDS[hamlet.parentSlug] },
  })),
  ...BORDER_CITIES,
].map((place) => ({
  "@type": "Place",
  "@id": PLACE_IDS[place.slug] || `${BASE_URL}/#${place.slug}`,
  name: place.name,
  description: place.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: place.name,
    addressRegion: "ON",
    addressCountry: "CA",
  },
  containedInPlace: place.containedInPlace,
}));

const REVIEW_TEMPLATE = {
  "@type": "Review",
  reviewRating: {
    "@type": "Rating",
    ratingValue: "5",
    bestRating: "5",
  },
  itemReviewed: { "@id": `${BASE_URL}/#finally-home-agents` },
};

const GOOGLE_REVIEWS = [
  {
    author: "Kevin Hickey",
    body:
      "Landon was fantastic—he toured dozens of homes with me, kept everything on budget, and was always available.",
    datePublished: "2025-07-01",
  },
  {
    author: "Glenn Tappenden",
    body:
      "Matthew and Landon handled multiple transactions for us with professionalism, quick replies, and great advice.",
    datePublished: "2025-07-01",
  },
  {
    author: "Ryan Porter",
    body: "Matt was always available and guided us smoothly into our new place. Thanks for the help!",
    datePublished: "2025-07-01",
  },
  {
    author: "Susan Booth",
    body:
      "The Finally Home Agents team made selling straightforward and stress-free with clear communication throughout.",
  },
  {
    author: "Logan Abernethy",
    body:
      "Responsive, knowledgeable, and friendly—Matthew made buying in the NorthSide GTA feel effortless.",
  },
  {
    author: "Jessica Le",
    body:
      "Landon made renting stress-free, easy to communicate with, and incredibly thoughtful about my needs.",
    datePublished: "2023-09-01",
  },
  {
    author: "Tessa Conway",
    body:
      "Moving to a brand-new city felt easy with Landon guiding the rental process from start to finish.",
    datePublished: "2024-01-01",
  },
  {
    author: "Olivia Oprea",
    body:
      "Matthew found my dream home in a challenging market and negotiated a winning offer.",
    datePublished: "2022-10-01",
  },
  {
    author: "Arron Breen",
    body:
      "Matt sold our house above market and negotiated our forever home for less—highly recommend.",
    datePublished: "2022-05-01",
  },
  {
    author: "Dawn Rouse",
    body:
      "Honest guidance, organized showings, and great marketing. We felt supported every step of the way.",
  },
  {
    author: "Glenn Tappenden",
    body: "Thoughtful follow-up and detailed advice kept every deal on track.",
  },
].map((review) => ({
  ...REVIEW_TEMPLATE,
  author: { "@type": "Person", name: review.author },
  reviewBody: review.body,
  datePublished: review.datePublished,
}));

const FACEBOOK_RECOMMENDATIONS = [
  "Sjeli Pearse",
  "Michelle Revell",
  "Sagen Pearse",
  "Raul Tec",
  "Tommy Hogan",
  "Mike Kloepfer",
  "Nickolas Goldring",
  "Shane Oliver",
  "Jordan Fontaine",
  "Sara Saloojee",
  "Nikki Moran",
  "Samantha Smith",
  "Reid Moran",
  "Pankil Shah",
  "Gary Semeniuk",
  "Shiraz Griffin",
  "Kyle Orlando",
].map((name) => ({
  ...REVIEW_TEMPLATE,
  author: { "@type": "Person", name },
  reviewBody:
    "Recommended the Finally Home Agents team for their responsiveness, marketing, and care for clients across the NorthSide GTA.",
}));

const REVIEWS = [...GOOGLE_REVIEWS, ...FACEBOOK_RECOMMENDATIONS];

function buildGlobalGraph() {
  const logoUrl = `${BASE_URL}/Images/newtoolbar.png`;
  const northsideLogo = logoUrl;

  const finallyHomeAgents = {
    "@type": ["LocalBusiness", "RealEstateAgent"],
    "@id": `${BASE_URL}/#finally-home-agents`,
    name: "Finally Home Agents",
    url: BASE_URL,
    telephone: "647-668-4646",
    email: "contact@finallyhomeagents.com",
    logo: logoUrl,
    image: logoUrl,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "9131 Keele St #A4",
      addressLocality: "Vaughan",
      addressRegion: "ON",
      postalCode: "L4K 0G7",
      addressCountry: "CA",
    },
    areaServed: [
      { "@id": PLACE_IDS.region },
      ...CORE_TOWNS.map((place) => ({ "@id": PLACE_IDS[place.slug] })),
    ],
    knowsAbout: [
      { "@id": PLACE_IDS.region },
      ...CORE_TOWNS.map((place) => ({ "@id": PLACE_IDS[place.slug] })),
      ...HAMLETS.map((hamlet) => ({ "@id": PLACE_IDS[hamlet.slug] })),
    ],
    sameAs: [
      "https://www.facebook.com/NorthSideGTA",
      "https://www.facebook.com/FinallyHomeAgents",
      "https://www.instagram.com/finallyhomeagents/",
      "https://www.instagram.com/northsidegta",
      "https://www.youtube.com/@FinallyHomeAgents",
      "https://www.tiktok.com/@northsidegta",
      "https://www.facebook.com/MGLMREALESTATE",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: 11,
      bestRating: "5",
    },
    review: REVIEWS,
  };

  const homelifeOptimum = {
    "@type": "Organization",
    "@id": `${BASE_URL}/#homelife-optimum`,
    name: "HomeLife Optimum Realty",
    address: finallyHomeAgents.address,
    sameAs: [],
  };

  const northsideBrand = {
    "@type": "Organization",
    "@id": `${BASE_URL}/#northside-gta`,
    name: "NorthSide GTA",
    url: BASE_URL,
    description:
      "NorthSide GTA is the regional real estate and community hub connecting buyers, sellers, and locals across Uxbridge, Georgina, Newmarket, Aurora, East Gwillimbury, Stouffville, and Scugog.",
    logo: northsideLogo,
    areaServed: [
      { "@id": PLACE_IDS.region },
      ...CORE_TOWNS.map((place) => ({ "@id": PLACE_IDS[place.slug] })),
    ],
    knowsAbout: [
      { "@id": PLACE_IDS.region },
      ...CORE_TOWNS.map((place) => ({ "@id": PLACE_IDS[place.slug] })),
      ...HAMLETS.map((hamlet) => ({ "@id": PLACE_IDS[hamlet.slug] })),
    ],
    sameAs: [
      "https://www.facebook.com/NorthSideGTA",
      "https://www.instagram.com/northsidegta",
      "https://www.tiktok.com/@northsidegta",
      "https://www.youtube.com/@FinallyHomeAgents",
    ],
  };

  const matthewMulhall = {
    "@type": "Person",
    "@id": `${BASE_URL}/#matthew-mulhall`,
    name: "Matthew Mulhall",
    jobTitle: "Realtor®, Real Estate Agent",
    worksFor: { "@id": `${BASE_URL}/#finally-home-agents` },
    affiliation: [{ "@id": northsideBrand["@id"] }, { "@id": homelifeOptimum["@id"] }],
    image: `${BASE_URL}/Images/matthew.jpg`,
    description:
      "Matthew Mulhall is a NorthSide GTA Realtor® focused on strategic pricing, negotiation, and community-first service for buyers and sellers.",
    sameAs: ["https://www.facebook.com/MGLMREALESTATE"],
  };

  const landonMulhall = {
    "@type": "Person",
    "@id": `${BASE_URL}/#landon-mulhall`,
    name: "Landon Mulhall",
    jobTitle: "Realtor®, Real Estate Agent",
    worksFor: { "@id": `${BASE_URL}/#finally-home-agents` },
    affiliation: [{ "@id": northsideBrand["@id"] }, { "@id": homelifeOptimum["@id"] }],
    image: `${BASE_URL}/Images/landon.jpg`,
    description:
      "Landon Mulhall helps NorthSide GTA clients navigate buying, selling, and renting with clear communication and local insight.",
    sameAs: [],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "NorthSide GTA",
    url: BASE_URL,
    publisher: { "@id": finallyHomeAgents["@id"] },
    inLanguage: "en-CA",
  };

  const tasteHub = {
    "@type": "WebApplication",
    "@id": `${BASE_URL}/#tastehub`,
    name: "NorthSide TasteHub",
    url: `${BASE_URL}/tastehub`,
    description:
      "NorthSide TasteHub is a community-powered food voting hub for NorthSide GTA towns, ranking favourites based on real votes.",
    operatingSystem: "All",
    applicationCategory: "Food & Drink",
    publisher: { "@id": finallyHomeAgents["@id"] },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      finallyHomeAgents,
      homelifeOptimum,
      northsideBrand,
      website,
      matthewMulhall,
      landonMulhall,
      REGION_NODE,
      ...PLACE_NODES,
      tasteHub,
    ],
  };
}

function getGlobalGraphJson() {
  return JSON.stringify(buildGlobalGraph(), null, 2);
}

module.exports = {
  PLACE_IDS,
  getGlobalGraphJson,
  buildGlobalGraph,
};
module.exports.default = module.exports;
