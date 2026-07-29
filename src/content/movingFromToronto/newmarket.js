const { buildMovingGuideSchema } = require("./georgina");

const newmarketMovingGuide = {
  town: "Newmarket",
  slug: "newmarket",
  route: "/moving-to-newmarket-from-toronto",
  title: "Moving to Newmarket from Toronto (2026 Guide) | Finally Home Agents",
  description:
    "Thinking of moving to Newmarket from Toronto? Main Street, GO train, Southlake hospital, and real neighbourhood-by-neighbourhood advice for Toronto movers.",
  heroImage: "/Images/newmarket-banner.jpg",
  heroImageAlt: "Historic Main Street in Newmarket, Ontario",
  badgeImage: "/assets/town-logos/newmarket.webp",
  badgeImageAlt: "Newmarket NorthSide GTA town badge",
  communityImage: "/Images/towns/newmarket.jpg",
  communityImageAlt: "Established family neighbourhood in Newmarket, Ontario",
  marketKey: "newmarket",
  comparisonTowns: ["newmarket", "aurora", "east-gwillimbury"],
  crossGuideLinks: ["/moving-to-aurora-from-toronto"],
  communityProfilePath: "/communities/newmarket",
  tasteHubPath: "/tastehub?town=newmarket",
  kicker: "Relocation Guide · Newmarket",
  heading: "Moving to Newmarket from Toronto: The Honest 2026 Guide",
  intro:
    "Newmarket is the easiest landing north of Toronto — a walkable Main Street, a GO train to Union, a hospital in town, and neighbourhoods where kids bike to school. If you want city-level convenience without the city price, start here.",
  money: {
    eyebrow: "Toronto budget, Newmarket convenience",
    heading: "What your Toronto money buys in Newmarket",
    body:
      "Newmarket is one of York Region's higher-volume markets — with a broad mix of listings, steady sales, and meaningful choice. That works both ways: you'll find the right house faster, but well-priced homes in strong school zones move quickly. Preparation matters here more than anywhere else we serve.",
  },
  budgetCard: {
    eyebrow: "The $1M comparison",
    heading: "What does $1M buy in Newmarket?",
    body:
      "A 4-bed detached in Stonehaven-Wyndham or Armitage — typically a 2000s build with a double garage, finished basement, and a solid school catchment; often with a pool. In Toronto, $1M is a semi that needs work — before land transfer tax.",
  },
  landTransferTax: {
    headline: "Leaving Toronto means no municipal land transfer tax.",
    beforeSavings: "On a $1M purchase, that's roughly",
    savings: "$16,500 staying in your pocket",
    afterSavings:
      "— Toronto is the only municipality in Ontario that charges a second land transfer tax.",
  },
  communitiesSection: {
    eyebrow: "Choose your neighbourhood",
    heading: "Where should you look in Newmarket?",
    intro:
      "Newmarket's neighbourhoods have genuinely different personalities — this choice shapes your daily life more than the town choice did.",
    aside:
      "Also worth knowing: Glenway Estates, Gorham-College Manor, and Huron Heights-Leslie Valley — each with its own price point and feel.",
    miniCtaLead: "Well-priced homes in the right school zones here can move in days.",
    miniCtaBody: "Want to be ready before the right one lists?",
  },
  communities: [
    {
      heading: "Stonehaven-Wyndham — the school-zone favourite",
      body:
        "Consistently in demand for its catchment (Stonehaven PS rates 8.1) and quick 404 access. Executive 2000s homes on family streets; the classic Toronto-mover destination.",
    },
    {
      heading: "Central Newmarket & Old Main — the walkable life",
      body:
        "Heritage homes and mature trees within walking distance of Main Street's shops, restaurants, Fairy Lake, and the farmers market. The closest thing to a Toronto neighbourhood feel north of the city.",
    },
    {
      heading: "Armitage & Bristol-London — the family value play",
      body:
        "Established family subdivisions with parks, schools, and more house per dollar than Stonehaven — where we send buyers who want Newmarket without stretching.",
    },
  ],
  familySection: {
    eyebrow: "Life beyond the listing",
    heading: "Raising kids in Newmarket",
    intro: "This is the question behind most moves north, so here's the real picture.",
    tasteHubLead: "Looking for the places locals actually eat?",
    tasteHubLabel: "Explore Newmarket on TasteHub →",
  },
  familyCards: [
    {
      icon: "🏫",
      heading: "Schools",
      body:
        "The strongest lineup in the towns we serve — Newmarket High rates 8.5 (Fraser), Stonehaven PS 8.1, plus Cardinal Carter Catholic (7.5) and Huron Heights' French Immersion and Arts programs. School catchment drives buying decisions here, and we map it first.",
    },
    {
      icon: "🏊",
      heading: "The Magna Centre",
      body:
        "One of York Region's best rec complexes — an Olympic-size rink plus three NHL pads, a 25-metre 8-lane pool and learning pool, gymnasium, and walking track. Swim lessons to rep hockey, all under one roof.",
    },
    {
      icon: "⛸️",
      heading: "Ray Twinney Complex",
      body:
        "Two more arenas and a pool with a 100-foot waterslide, diving well, and sauna — the weekend-swim spot.",
    },
    {
      icon: "🌳",
      heading: "Fairy Lake & the Main Street life",
      body:
        "Paddle Fairy Lake, Saturday farmers market, festivals on Main Street year-round. Kids here are often independent on foot or bike — the pedestrian culture is real.",
    },
    {
      icon: "🏥",
      heading: "Healthcare",
      body:
        "Southlake Regional Health Centre is in town — a full regional hospital minutes away, not a highway drive. For families, this matters more than they expect.",
    },
    {
      icon: "🛒",
      heading: "The honest trade-off",
      body:
        "Newmarket is the busiest, most built-up town we serve. If your dream is quiet roads and a big lot, East Gwillimbury or Uxbridge will fit better — Newmarket trades acreage for convenience.",
    },
  ],
  commute: {
    eyebrow: "The trade-off to pressure-test",
    heading: "The honest commute",
    intro: "Newmarket has the most commute options of any town we serve.",
    items: [
      {
        heading: "GO Transit",
        body:
          "Newmarket GO station sits near downtown on the Barrie line — roughly 55–60 minutes to Union. Many Central Newmarket residents walk to the station; that's a lifestyle, not just a commute.",
      },
      {
        heading: "Driving",
        body:
          "About 55 km to the DVP/401 — roughly 45 minutes off-peak via the 404, longer at peak. Highway 400 is reachable west via Davis Drive for west-end workers.",
      },
      {
        heading: "Local transit",
        body:
          "YRT/Viva bus rapid transit runs along Yonge and Davis — kids can actually get around without a parent driving.",
      },
    ],
    honestRead: [
      "If you must be downtown daily, Newmarket (with ",
      { label: "Aurora", href: "/moving-to-aurora-from-toronto" },
      ") is the most realistic town we serve. The train is the difference-maker.",
    ],
  },
  marketSection: {
    eyebrow: "Three-town comparison",
    heading: "Newmarket market snapshot",
    conclusion: [
      "Newmarket runs meaningfully below ",
      { label: "Aurora", href: "/moving-to-aurora-from-toronto" },
      " at similar convenience — that gap is why it's consistently one of York Region's busier markets.",
    ],
  },
  review: {
    quote:
      "Thanks to Matt we sold our home for much more than the market rate — higher than any comparable in the neighbourhood. We were able to close on our forever home for much lower than we ever thought possible.",
    attribution: "Arron Breen · Buyer & Seller · Google Reviews (5.0 rating)",
  },
  cta: {
    eyebrow: "Two minutes, no pressure",
    heading: "Is Newmarket right for you?",
    body:
      "Not sure whether Newmarket, Aurora, or somewhere else north fits your family best? That's exactly what our Town Match Quiz figures out — two minutes, no contact info required to see your result.",
  },
  faqs: [
    {
      question: "Is Newmarket a good place to live?",
      answer:
        "Newmarket is one of York Region's most connected communities — a walkable heritage Main Street, direct GO train service to Union, Southlake Regional Health Centre in town, and strong schools. It's the most practical landing spot for Toronto families moving north.",
    },
    {
      question: "How far is Newmarket from Toronto?",
      answer:
        "About 55 km north. The GO train from Newmarket station takes roughly 55–60 minutes to Union; driving is about 45 minutes off-peak via Highway 404, longer at peak.",
    },
    {
      question: "Is Newmarket cheaper than Toronto?",
      answer:
        "Meaningfully. The money that buys a Toronto semi buys a 4-bed detached with a garage and yard in Newmarket, and buyers leaving Toronto avoid the municipal land transfer tax — roughly $16,500 saved on a typical purchase here.",
    },
    {
      question: "What are the best neighbourhoods in Newmarket?",
      answer:
        "Stonehaven-Wyndham leads for schools and 404 access; Central Newmarket and Old Main offer walkable heritage character near Main Street; Armitage and Bristol-London deliver established family streets at better value.",
    },
    {
      question: "Are Newmarket schools good?",
      answer:
        "Among the strongest in the area — Newmarket High School rates 8.5 and Stonehaven Public School 8.1 on Fraser Institute rankings, with Catholic and French Immersion options. School catchment is a major driver of home prices here.",
    },
    {
      question: "Is Newmarket good for families?",
      answer:
        "Yes — the Magna Centre (four rinks, two pools), Ray Twinney Complex, Fairy Lake, the farmers market, walkable neighbourhoods, and a full hospital in town make it the most complete family package north of Toronto.",
    },
    {
      question: "Who can help me buy a home in Newmarket?",
      answer:
        "Finally Home Agents (Matthew and Landon Mulhall, HomeLife Optimum Realty, Brokerage) live and work in the NorthSide GTA and guide Toronto buyers through Newmarket neighbourhood-by-neighbourhood — including being offer-ready in a market where good homes move in days.",
    },
  ],
};

module.exports = {
  newmarketMovingGuide,
  buildMovingGuideSchema,
};
