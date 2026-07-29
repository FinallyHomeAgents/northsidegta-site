const { buildMovingGuideSchema } = require("./georgina");

const uxbridgeMovingGuide = {
  town: "Uxbridge",
  slug: "uxbridge",
  route: "/moving-to-uxbridge-from-toronto",
  title: "Moving to Uxbridge from Toronto (2026 Guide) | Finally Home Agents",
  description:
    "Thinking of moving to Uxbridge from Toronto? Trail Capital of Canada — acreage, heritage downtown, real prices, and the honest commute, compared for Toronto movers.",
  heroImage: "/Images/uxbridge-banner.jpg",
  heroImageAlt: "Heritage downtown streetscape in Uxbridge, Ontario",
  badgeImage: "/assets/town-logos/uxbridge.webp",
  badgeImageAlt: "Uxbridge NorthSide GTA town badge",
  communityImage: "/uploads/insights/uxbridge-aerial-neighbourhood-2026.jpg",
  communityImageAlt: "Aerial view of homes, countryside, and trails in Uxbridge, Ontario",
  marketKey: "uxbridge",
  comparisonTowns: ["uxbridge", "stouffville", "newmarket"],
  communityProfilePath: "/communities/uxbridge",
  tasteHubPath: "/tastehub?town=uxbridge",
  kicker: "Relocation Guide · Uxbridge",
  heading: "Moving to Uxbridge from Toronto: The Honest 2026 Guide",
  intro:
    "This is the \"we want land and quiet\" move. Uxbridge is the Trail Capital of Canada — a heritage downtown surrounded by forest, farms, and acreage properties that simply don't exist closer to the city. Here's what the move actually looks like: the good, the trade-offs, and the numbers.",
  money: {
    eyebrow: "Toronto budget, Uxbridge space",
    heading: "What your Toronto money buys in Uxbridge",
    body:
      "Uxbridge isn't primarily a lowest-price move — it's where your money buys a different kind of life. In-town heritage homes with mature trees, newer family subdivisions, and beyond the town line: acreage, workshops, barns, and privacy.",
  },
  budgetCard: {
    eyebrow: "The $1M comparison",
    heading: "What does $1M buy in Uxbridge?",
    body:
      "In town: a detached 4-bed family home near the trail network and a walkable heritage downtown. Outside town: a country property with real land — the kind of listing that makes Toronto visitors ask \"wait, for how much?\" In Toronto, $1M is a semi on a 20-foot lot.",
  },
  landTransferTax: {
    headline: "Leaving Toronto means no municipal land transfer tax.",
    beforeSavings: "On a $1M purchase, that's roughly",
    savings: "$16,500 staying in your pocket",
    afterSavings:
      "— Toronto is the only municipality in Ontario that charges a second land transfer tax.",
  },
  communitiesSection: {
    eyebrow: "Choose your corner",
    heading: "Town, hamlet, or rural Uxbridge?",
    intro:
      "\"Uxbridge\" means both a town and a township — and the difference matters to your search.",
    miniCtaLead: "Acreage buying has its own rules — wells, septic, zoning, conservation authority.",
    miniCtaBody: "Ask us anything before you fall for a listing.",
  },
  communities: [
    {
      heading: "Uxbridge town — heritage main street living",
      body:
        "A genuinely charming downtown (shops, cafés, the historic Roxy Theatre), established neighbourhoods, newer subdivisions on the edges, and trails from your doorstep. Small-town life with real culture.",
    },
    {
      heading: "The hamlets — Goodwood, Leaskdale, Zephyr, Sandford",
      body:
        "Village clusters surrounded by countryside. Leaskdale is literary Canada (Lucy Maud Montgomery's manse); Goodwood sits closest to Stouffville and the commuter routes.",
    },
    {
      heading: "Rural Uxbridge — the acreage move",
      body:
        "Rolling Oak Ridges Moraine country: horse farms, wooded lots, ponds, shops and outbuildings. This is where \"more space\" becomes an understatement — and where we spend a lot of time with Toronto buyers.",
    },
  ],
  familySection: {
    eyebrow: "Life beyond the listing",
    heading: "Raising kids in Uxbridge",
    intro: "This is the question behind most moves north, so here's the real picture.",
    tasteHubLead: "Looking for the places locals actually eat?",
    tasteHubLabel: "Explore Uxbridge on TasteHub →",
  },
  familyCards: [
    {
      icon: "🥾",
      heading: "Trail Capital of Canada",
      body:
        "220+ km of managed trails through the Oak Ridges Moraine, Durham Forest, and countryside — hiking, mountain biking, cross-country skiing. Kids here genuinely grow up in the woods.",
    },
    {
      icon: "🏊",
      heading: "Uxpool & the arena",
      body:
        "Uxpool has served the town since 1971 — six lanes, swim lessons, squash courts. The Uxbridge Arena & Community Centre runs minor hockey, lacrosse, and public skates.",
    },
    {
      icon: "🏫",
      heading: "Schools",
      body:
        "Durham District and Durham Catholic boards; Uxbridge Secondary School anchors the town, with elementary schools in town and the hamlets. (School catchment is one of the first things we map for rural properties — it changes at concession-road resolution.)",
    },
    {
      icon: "🌳",
      heading: "Elgin Park & the fairgrounds",
      body:
        "The town's gathering place — playgrounds, bandshell, ponds, and the Uxbridge Fall Fair, running since 1864. The York-Durham Heritage Railway runs vintage trains from the historic station.",
    },
    {
      icon: "🏥",
      heading: "Healthcare",
      body:
        "Uxbridge Cottage Hospital (Oak Valley Health) is right in town — rare for a town this size — with Markham Stouffville Hospital ~25 minutes south.",
    },
    {
      icon: "🛒",
      heading: "The honest trade-off",
      body:
        "One grocery run covers most needs, but big-box shopping means Stouffville or Newmarket (~25 min). Winter on rural roads is real — snow tires and a longer driveway to clear. That's the price of the view.",
    },
  ],
  commute: {
    eyebrow: "The trade-off to pressure-test",
    heading: "The honest commute",
    intro: "Uxbridge is the deepest-country move we serve, and the commute reflects it.",
    items: [
      {
        heading: "Driving",
        body:
          "About 60 km to the DVP/401 — roughly an hour off-peak via Highway 404 or 407 (the 407 ETR toll buys reliability). Markham/Scarborough workers do noticeably better than downtown workers here.",
      },
      {
        heading: "GO Transit",
        body:
          "No GO train in Uxbridge. The GO 71 bus runs from Toronto Street through Goodwood to Lincolnville GO at the top of the Stouffville line — train to Union from there. It works, but it's a two-leg trip; most commuters drive to Lincolnville or Old Elm and ride from there.",
      },
    ],
    honestRead:
      "Uxbridge is best for remote and hybrid workers, Durham/Markham commuters, and anyone whose downtown days are occasional. If you need Union Station daily, Stouffville gives you the small-town main street with the train — we'll tell you honestly which fits.",
  },
  marketSection: {
    eyebrow: "Three-town comparison",
    heading: "Uxbridge market snapshot",
    conclusion:
      "Uxbridge trades at a similar price point to its neighbours — the difference is what the money buys: land, trees, and privacy instead of proximity.",
  },
  review: {
    quote:
      "Matthew and the team really took the time and care to help us find the right place. He made the sometimes overwhelming burden of moving seem so smooth. I would greatly recommend that anyone looking for a home seek out Matthew and the team at Finally Home Agents.",
    attribution: "Devin Tappenden · Buyer · Uxbridge · Google Reviews (5.0 rating)",
  },
  cta: {
    eyebrow: "Two minutes, no pressure",
    heading: "Is Uxbridge right for you?",
    body:
      "Not sure whether Uxbridge, Stouffville, or somewhere else north fits your family best? That's exactly what our Town Match Quiz figures out — two minutes, no contact info required to see your result.",
  },
  faqs: [
    {
      question: "Is Uxbridge a good place to live?",
      answer:
        "Uxbridge offers a heritage downtown, a strong community culture, its own hospital, and unmatched access to nature — it's the Trail Capital of Canada with 220+ km of trails. It suits families and buyers seeking space, acreage, or small-town character, with a car-dependent lifestyle as the trade-off.",
    },
    {
      question: "How far is Uxbridge from Toronto?",
      answer:
        "About 60 km northeast. Driving takes roughly an hour off-peak via Highway 404 or the 407. There's no GO train in town; the GO 71 bus connects to Lincolnville GO station on the Stouffville line.",
    },
    {
      question: "Why is Uxbridge called the Trail Capital of Canada?",
      answer:
        "The township maintains one of Canada's largest managed trail networks — over 220 km through the Oak Ridges Moraine, Durham Forest, and countryside, used year-round for hiking, mountain biking, and cross-country skiing.",
    },
    {
      question: "Is Uxbridge cheaper than Toronto?",
      answer:
        "For what you get, dramatically. Toronto semi money buys an in-town detached near trails — or a rural property with acreage. Buyers leaving Toronto also avoid the municipal land transfer tax, saving roughly $16,500 on a typical purchase here.",
    },
    {
      question: "What should I know about buying rural property in Uxbridge?",
      answer:
        "Country properties involve wells, septic systems, zoning, and Oak Ridges Moraine conservation rules that city purchases never touch. Budget for inspections beyond the standard home inspection, and work with representation experienced in rural transactions.",
    },
    {
      question: "Is Uxbridge good for families?",
      answer:
        "Yes — Uxpool, the arena's minor hockey and lacrosse programs, Elgin Park, the fall fair, and the trail network give kids an outdoor childhood, and the town has its own hospital. Big-box shopping and some activities mean a 25-minute drive.",
    },
    {
      question: "Who can help me buy a home in Uxbridge?",
      answer:
        "Finally Home Agents (Matthew and Landon Mulhall, HomeLife Optimum Realty, Brokerage) live and work in the NorthSide GTA and guide Toronto buyers through Uxbridge — town, hamlet, and acreage — including the rural due diligence that catches buyers out.",
    },
  ],
};

module.exports = {
  uxbridgeMovingGuide,
  buildMovingGuideSchema,
};
