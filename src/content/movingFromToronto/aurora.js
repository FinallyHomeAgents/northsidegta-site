const { buildMovingGuideSchema } = require("./georgina");

const auroraMovingGuide = {
  town: "Aurora",
  slug: "aurora",
  route: "/moving-to-aurora-from-toronto",
  title: "Moving to Aurora from Toronto (2026 Guide) | Finally Home Agents",
  description:
    "Thinking of moving to Aurora from Toronto? Top schools including an IB program and St. Andrew's College, GO train access, and established tree-lined neighbourhoods — the honest guide.",
  heroImage: "/Images/aurora-banner.jpg",
  heroImageAlt: "Established tree-lined neighbourhood in Aurora, Ontario",
  badgeImage: "/assets/town-logos/aurora.webp",
  badgeImageAlt: "Aurora NorthSide GTA town badge",
  communityImage: "/Images/towns/aurora.jpg",
  communityImageAlt: "Mature residential streets in Aurora, Ontario",
  marketKey: "aurora",
  comparisonTowns: ["aurora", "newmarket", "stouffville"],
  crossGuideLinks: ["/moving-to-newmarket-from-toronto"],
  communityProfilePath: "/communities/aurora",
  tasteHubPath: "/tastehub?town=aurora",
  kicker: "Relocation Guide · Aurora",
  heading: "Moving to Aurora from Toronto: The Honest 2026 Guide",
  intro:
    "Aurora is the schools-and-established-streets move — mature tree-lined neighbourhoods, an IB high school, one of Canada's most storied private schools, and a GO train to Union. It's the priciest town we serve, and for the families who choose it, that's exactly the point.",
  money: {
    eyebrow: "Toronto budget, established Aurora",
    heading: "What your Toronto money buys in Aurora",
    body:
      "Aurora is where Toronto buyers land when they're not looking for the cheapest way north — they're looking for the finished product: mature streets, established schools, and neighbourhoods that already look the way new subdivisions hope to in thirty years.",
  },
  budgetCard: {
    eyebrow: "The $1.2M comparison",
    heading: "What does $1.2M buy in Aurora?",
    body:
      "A 4-bed detached on a mature, tree-canopied street in Aurora Highlands — or a newer executive home in Bayview Northeast near top-catchment schools. In Toronto, $1.2M is a semi in a good school district — with a fraction of the lot.",
  },
  landTransferTax: {
    headline: "Leaving Toronto means no municipal land transfer tax.",
    beforeSavings: "On a $1.2M purchase, that's roughly",
    savings: "$21,000 staying in your pocket",
    afterSavings:
      "— Toronto is the only municipality in Ontario that charges a second land transfer tax.",
  },
  communitiesSection: {
    eyebrow: "Choose your neighbourhood",
    heading: "Where should you look in Aurora?",
    intro:
      "Aurora's character changes street by street — this is a town where \"established\" is the selling feature.",
    miniCtaLead: "Catchment lines and street character change fast here.",
    miniCtaBody:
      "Tell us your budget and priorities — we'll shortlist streets, not just neighbourhoods.",
  },
  communities: [
    {
      heading: "Aurora Village & Town Park — the heritage heart",
      body:
        "Century homes, the historic Town Park (farmers market, concerts), and walking distance to the GO station and Yonge Street's old downtown. Aurora's most character-rich streets.",
    },
    {
      heading: "Aurora Highlands — the classic move",
      body:
        "The established southwest: mature trees, larger lots, quiet crescents, and the sort of streetscape that made Aurora's reputation. The default answer to \"where should we look?\"",
    },
    {
      heading: "Bayview Northeast & Aurora Grove — the newer chapter",
      body:
        "2000s-era executive homes, newer schools, parks, and easy 404 access on the east side. For buyers who want Aurora's address with modern layouts.",
    },
    {
      heading: "Aurora Estates — the stretch goal",
      body:
        "Estate lots and luxury builds toward the south end — Aurora's answer to King City, at a (slightly) friendlier number.",
    },
  ],
  familySection: {
    eyebrow: "Life beyond the listing",
    heading: "Raising kids in Aurora",
    intro: "This is the question behind most moves north, so here's the real picture.",
    tasteHubLead: "Looking for the places locals actually eat?",
    tasteHubLabel: "Explore Aurora on TasteHub →",
  },
  familyCards: [
    {
      icon: "🎓",
      heading: "The IB school",
      body:
        "Dr. G.W. Williams Secondary is a regional International Baccalaureate school — one of York Region's designated IB programs — plus five Specialist High Skills Major streams. Families relocate specifically for this.",
    },
    {
      icon: "🏫",
      heading: "St. Andrew's College & St. Anne's",
      body:
        "SAC is a 110-acre independent boys' school (grades 6–12, day and boarding) with its affiliated girls' school St. Anne's — private education without the Toronto commute. Having this in town shapes Aurora's family profile.",
    },
    {
      icon: "🏊",
      heading: "Recreation",
      body:
        "The Stronach Aurora Recreation Complex (pools, ice) and Aurora Family Leisure Complex anchor town programs — swim lessons, minor hockey, camps, and fitness.",
    },
    {
      icon: "🌳",
      heading: "Trails & parks",
      body:
        "Sheppard's Bush and the Case Woodlot connect into the Nokiidaa/Oak Ridges trail systems; Town Park hosts the farmers market and summer concerts. Green space here is mature, not promised.",
    },
    {
      icon: "🏥",
      heading: "Healthcare",
      body:
        "Southlake Regional Health Centre is 10 minutes up Yonge in Newmarket; clinics and specialists cluster along the Yonge corridor.",
    },
    {
      icon: "🛒",
      heading: "The honest trade-off",
      body: [
        "You pay for all of it — Aurora is the priciest town we serve, and inventory in the best pockets is tight. If the budget fights you here, ",
        { label: "Newmarket", href: "/moving-to-newmarket-from-toronto" },
        " delivers 90% of the convenience at a real discount; we'll tell you honestly which side of that line you're on.",
      ],
    },
  ],
  commute: {
    eyebrow: "The trade-off to pressure-test",
    heading: "The honest commute",
    intro: "",
    items: [
      {
        heading: "GO Transit",
        body:
          "Aurora GO station sits near the historic downtown on the Barrie line — roughly an hour to Union, with all-day service. Village-area residents walk to the train.",
      },
      {
        heading: "Driving",
        body:
          "About 50 km to the DVP/401 — roughly 45–50 minutes off-peak via the 404 from Wellington or Bloomington, longer at peak.",
      },
    ],
    honestRead: [
      "With ",
      { label: "Newmarket", href: "/moving-to-newmarket-from-toronto" },
      ", Aurora is the most realistic daily-downtown town we serve. Five-day commuters should still test the full door-to-door trip once — the train is the reliable half; the drive to the station at 7:40 a.m. is the variable.",
    ],
  },
  marketSection: {
    eyebrow: "Three-town comparison",
    heading: "Aurora market snapshot",
    conclusion:
      "Aurora carries the premium of the seven towns — buyers pay for established streets, schools, and scarcity. The current market's softness is the best negotiating window Aurora buyers have had in years.",
  },
  review: {
    quote:
      "What really stood out was that Matt understood our priorities as a family and ensured that these priorities were held in high regard throughout the whole process. He is ready to help in a heartbeat and will see you through from start to finish.",
    attribution: "Larissa Halko · Buyer & Seller · Google Reviews (5.0 rating)",
  },
  cta: {
    eyebrow: "Two minutes, no pressure",
    heading: "Is Aurora right for you?",
    body:
      "Not sure whether Aurora, Newmarket, or somewhere else north fits your family best? That's exactly what our Town Match Quiz figures out — two minutes, no contact info required to see your result.",
  },
  faqs: [
    {
      question: "Is Aurora a good place to live?",
      answer:
        "Aurora combines established tree-lined neighbourhoods, strong schools including a regional IB program, GO train service to Union, and a historic downtown — it's consistently ranked among the GTA's most desirable family towns, at the highest price point of the communities north of Toronto.",
    },
    {
      question: "How far is Aurora from Toronto?",
      answer:
        "About 50 km north. The GO train from Aurora station takes roughly an hour to Union; driving is about 45–50 minutes off-peak via Highway 404.",
    },
    {
      question: "Are Aurora schools good?",
      answer:
        "Schools are Aurora's calling card: Dr. G.W. Williams Secondary offers a regional International Baccalaureate program, public and Catholic options are strong, and St. Andrew's College (independent, boys, grades 6–12) with affiliated St. Anne's provides private education in town.",
    },
    {
      question: "Is Aurora expensive?",
      answer:
        "It's the priciest of the seven NorthSide GTA towns — buyers pay for mature neighbourhoods, schools, and scarcity. It still runs well below comparable Toronto neighbourhoods, and leaving Toronto saves roughly $21,000 in municipal land transfer tax on a typical Aurora purchase.",
    },
    {
      question: "What are the best neighbourhoods in Aurora?",
      answer:
        "Aurora Village and Town Park for heritage character near the GO station; Aurora Highlands for the classic mature-street experience; Bayview Northeast and Aurora Grove for newer executive homes; Aurora Estates for estate lots.",
    },
    {
      question: "Is Aurora good for families?",
      answer:
        "Built for them: the Stronach Recreation Complex and Family Leisure Complex, Sheppard's Bush trails, Town Park's market and concerts, top school options, and Southlake hospital 10 minutes away.",
    },
    {
      question: "Who can help me buy a home in Aurora?",
      answer:
        "Finally Home Agents (Matthew and Landon Mulhall, HomeLife Optimum Realty, Brokerage) live and work in the NorthSide GTA and guide Toronto buyers through Aurora street-by-street — including the honest conversation about whether Aurora or Newmarket is the right fit for the budget.",
    },
  ],
};

module.exports = {
  auroraMovingGuide,
  buildMovingGuideSchema,
};
