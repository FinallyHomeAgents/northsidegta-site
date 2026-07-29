const { buildMovingGuideSchema } = require("./georgina");

const scugogMovingGuide = {
  town: "Scugog",
  slug: "scugog",
  route: "/moving-to-port-perry-scugog-from-toronto",
  title: "Moving to Port Perry & Scugog from Toronto (2026 Guide) | Finally Home Agents",
  description:
    "Thinking of moving to Port Perry or Scugog from Toronto? Lake Scugog waterfront, a heritage main street, real prices, and the honest commute for Toronto movers.",
  heroImage: "/Images/scugog-banner.jpg",
  heroImageAlt: "Lake Scugog waterfront in Port Perry, Ontario",
  badgeImage: "/assets/town-logos/scugog.webp",
  badgeImageAlt: "Scugog NorthSide GTA town badge",
  communityImage: "/Images/towns/scugog.jpg",
  communityImageAlt: "Port Perry waterfront and heritage downtown in Scugog, Ontario",
  marketKey: "scugog",
  comparisonTowns: ["scugog", "uxbridge", "georgina"],
  crossGuideLinks: [
    "/moving-to-stouffville-from-toronto",
    "/moving-to-newmarket-from-toronto",
    "/moving-to-georgina-from-toronto",
  ],
  communityProfilePath: "/communities/scugog",
  tasteHubPath: "/tastehub?town=scugog",
  kicker: "Relocation Guide · Scugog · Port Perry",
  heading: "Moving to Port Perry & Scugog from Toronto: The Honest 2026 Guide",
  intro:
    "Port Perry might be the prettiest main street within 90 minutes of Toronto — Victorian storefronts running straight down to the Lake Scugog waterfront. This is the small-town-by-the-water move, and it's more attainable than most Toronto buyers assume.",
  money: {
    eyebrow: "Toronto budget, Port Perry waterfront",
    heading: "What your Toronto money buys in Scugog",
    body:
      "Scugog is among the more affordable towns we serve — and unlike many accessible markets, the value comes with a waterfront and one of Ontario's most loved heritage downtowns, not instead of them.",
  },
  budgetCard: {
    eyebrow: "The $900K comparison",
    heading: "What does $900K buy in Scugog?",
    body:
      "A detached family home walking distance to Port Perry's main street and waterfront — or, further out, a rural property with land toward Scugog Island and the townships. In Toronto, $900K doesn't buy a semi.",
  },
  landTransferTax: {
    headline: "Leaving Toronto means no municipal land transfer tax.",
    beforeSavings: "On a $900K purchase, that's roughly",
    savings: "$13,500 staying in your pocket",
    afterSavings:
      "— Toronto is the only municipality in Ontario that charges a second land transfer tax.",
  },
  communitiesSection: {
    eyebrow: "Choose your corner",
    heading: "Port Perry, Scugog Island, or rural Scugog?",
    intro:
      "Scugog is a township wrapped around a lake — three different moves share the name.",
    miniCtaLead: "Waterfront, walking-distance-to-Queen-Street, or acreage — they're very different purchases.",
    miniCtaBody:
      "Tell us which pull is strongest and we'll show you what's realistic.",
  },
  communities: [
    {
      heading: "Port Perry — the heritage waterfront town",
      body:
        "Queen Street's Victorian downtown runs to the lake: gazebo, park, playground, tennis courts, and the 5 km waterfront trail. Established neighbourhoods sit within walking distance of all of it. This is the postcard.",
    },
    {
      heading: "Scugog Island — the lake-all-around move",
      body:
        "Across the causeway: waterfront homes, cottages-turned-year-round houses, and quiet roads circled by Lake Scugog. Boating from your own shoreline is realistic here.",
    },
    {
      heading: "The hamlets & rural Scugog — Blackstock, Seagrave, Nestleton and beyond",
      body:
        "Farm country, acreage, and village clusters east and north of the lake — the deepest-value land in the towns we serve.",
    },
  ],
  familySection: {
    eyebrow: "Life beyond the listing",
    heading: "Raising kids in Scugog",
    intro: "This is the question behind most moves north, so here's the real picture.",
    tasteHubLead: "Looking for the places locals actually eat?",
    tasteHubLabel: "Explore Scugog on TasteHub →",
  },
  familyCards: [
    {
      icon: "🌊",
      heading: "The waterfront is the backyard",
      body:
        "The lakefront park, playground, and 5 km trail anchor daily life — kids fish off the docks in summer and skate in winter. Lake Scugog's shallow water makes it one of Ontario's best bass and ice-fishing lakes.",
    },
    {
      icon: "🏫",
      heading: "Schools",
      body:
        "Durham District and Durham Catholic boards; Port Perry High School anchors the township with elementary schools in town and the hamlets. Small-school community feel is the norm here.",
    },
    {
      icon: "🏒",
      heading: "Arena & rec life",
      body:
        "Minor hockey and skating run deep in Port Perry's identity, with community programs through the township's parks and rec department and the Scugog Community Recreation Centre.",
    },
    {
      icon: "🎭",
      heading: "A real downtown",
      body:
        "Queen Street isn't a tourist prop — bookstores, bakeries, restaurants, the Town Hall 1873 theatre, and festivals year-round. Kids grow up in a town with a middle.",
    },
    {
      icon: "🏥",
      heading: "Healthcare",
      body:
        "Rare for a town this size — Lakeridge Health Port Perry is a full-service community hospital with a 24/7 emergency department, right in town.",
    },
    {
      icon: "🛒",
      heading: "The honest trade-off",
      body:
        "This is the furthest move we serve — commuting downtown daily isn't realistic, big-box shopping means Oshawa or Whitby (~25–30 min), and winter around the lake is a real season. Scugog rewards people who are done needing the city weekly.",
    },
  ],
  commute: {
    eyebrow: "The trade-off to pressure-test",
    heading: "The honest commute",
    intro: "We'll be blunt: Scugog is the lifestyle end of our map, not the commuter end.",
    items: [
      {
        heading: "Driving",
        body:
          "Roughly 80–90 minutes to downtown Toronto in normal traffic via the 407/401 — and the 407 ETR tolls add up if it's daily. Oshawa, Whitby, and the eastern GTA are the realistic job market: 25–40 minutes.",
      },
      {
        heading: "GO Transit",
        body:
          "No GO train in Scugog. Durham Region Transit connects Port Perry toward Oshawa's GO station on the Lakeshore East line.",
      },
    ],
    honestRead: [
      "Scugog works for remote workers, Durham-employed families, business owners, and the semi-retired. If you need Union Station more than once a week, read our ",
      { label: "Stouffville", href: "/moving-to-stouffville-from-toronto" },
      " or ",
      { label: "Newmarket guides", href: "/moving-to-newmarket-from-toronto" },
      " — and if it's the lake you're after with a shorter drive, compare ",
      { label: "Georgina", href: "/moving-to-georgina-from-toronto" },
      ".",
    ],
  },
  marketSection: {
    eyebrow: "Three-town comparison",
    heading: "Scugog market snapshot",
    conclusion: [
      "Scugog and Uxbridge both deliver countryside living — the practical difference is drive time. For lake-town value, its closest counterpart in our seven is ",
      { label: "Georgina", href: "/moving-to-georgina-from-toronto" },
      ", an hour closer to the city on the 404 side.",
    ],
  },
  review: {
    quote:
      "Matthew and the team really took the time and care to help us find the right place. He made the sometimes overwhelming burden of moving seem so smooth. I would greatly recommend that anyone looking for a home seek out Matthew and the team at Finally Home Agents.",
    attribution: "Devin Tappenden · Buyer · Google Reviews (5.0 rating)",
  },
  cta: {
    eyebrow: "Two minutes, no pressure",
    heading: "Is Scugog right for you?",
    body:
      "Not sure whether Scugog, Georgina, or somewhere else north fits your family best? That's exactly what our Town Match Quiz figures out — two minutes, no contact info required to see your result.",
  },
  faqs: [
    {
      question: "Is Port Perry a good place to live?",
      answer:
        "Port Perry offers one of Ontario's most celebrated heritage main streets, a lakefront park and trail system, its own full-service hospital, and small-town community life — at one of the more accessible price points of the seven NorthSide GTA towns. The trade-off is distance: it's the furthest of our communities from Toronto.",
    },
    {
      question: "How far is Port Perry from Toronto?",
      answer:
        "About 85 km northeast — roughly 80–90 minutes' drive to downtown via the 407/401. Oshawa and the eastern GTA are 25–40 minutes. There is no GO train in Scugog; Durham Region Transit connects toward Oshawa GO.",
    },
    {
      question: "Is Port Perry cheaper than Toronto?",
      answer:
        "Dramatically. Money that doesn't buy a Toronto semi buys a detached home walking distance to Port Perry's waterfront, and buyers leaving Toronto avoid the municipal land transfer tax — roughly $13,500 saved on a typical Scugog purchase.",
    },
    {
      question: "What's the difference between Port Perry, Scugog Island, and rural Scugog?",
      answer:
        "Port Perry is the heritage town with the waterfront, shops, schools, and hospital. Scugog Island, across the causeway, is lake-surrounded living with true waterfront homes. Rural Scugog — Blackstock, Seagrave, Nestleton — offers farms, acreage, and village life.",
    },
    {
      question: "Can you live on the water in Scugog?",
      answer:
        "Yes — Lake Scugog waterfront on Scugog Island and around the township remains among the most attainable true-waterfront living in the GTA's orbit. Waterfront purchases carry extra due diligence (shoreline, septic, flood mapping) that we walk buyers through.",
    },
    {
      question: "Is Port Perry good for families?",
      answer:
        "Yes, for families suited to small-town life: a walkable downtown with a theatre and festivals, the lakefront park and trail, minor hockey culture, local schools, and — rare for a town this size — a full hospital with 24/7 emergency in town.",
    },
    {
      question: "Who can help me buy a home in Port Perry or Scugog?",
      answer:
        "Finally Home Agents (Matthew and Landon Mulhall, HomeLife Optimum Realty, Brokerage) live and work in the NorthSide GTA and guide Toronto buyers through Scugog — town, island, and rural — including waterfront due diligence and the honest Georgina-vs-Scugog lake-town comparison.",
    },
  ],
};

module.exports = {
  scugogMovingGuide,
  buildMovingGuideSchema,
};
