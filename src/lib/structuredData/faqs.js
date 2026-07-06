const buyersFaq = [
  {
    question: "How do Finally Home Agents help first-time buyers in the NorthSide GTA?",
    answer:
      "We map out your top towns, set a budget-backed search, and guide you through offers so you avoid overpaying while you learn the process.",
  },
  {
    question: "Can you alert me to homes before they hit MLS?",
    answer:
      "Yes. We combine VIP alerts with local conversations so you hear about listings and private opportunities ahead of the crowd.",
  },
  {
    question: "What if I’m relocating from Toronto to the NorthSide GTA?",
    answer:
      "We compare commute times, schools, and neighbourhood vibes across each town and plan focused tours around your schedule.",
  },
  {
    question: "Do you handle negotiations and inspections?",
    answer:
      "We price-check every home, set a strategy, negotiate firmly, and bring vetted inspectors and lawyers when you need them.",
  },
  {
    question: "How do you keep me organized once I start touring?",
    answer:
      "We run the showings, recap the data, and keep offers, conditions, and timelines clear so you can decide with confidence.",
  },
];

const sellersFaq = [
  {
    question: "How early should we talk before listing?",
    answer:
      "Ideally, a few months before you plan to sell. That gives us time to review the property, discuss timing, and identify which improvements are worth doing before the home reaches the market. Some sellers contact us much earlier, and that is completely fine. A good plan is more useful than rushing into a listing.",
  },
  {
    question: "Do we need to renovate before selling?",
    answer:
      "Usually not. Most homes benefit more from targeted preparation than a major renovation. We look at the condition of the property, the likely buyer, and the current market, then recommend the repairs, cleaning, landscaping, or updates most likely to improve presentation and buyer confidence. We will also tell you when spending more is unlikely to produce a worthwhile return.",
  },
  {
    question: "Can we sell and buy at the same time?",
    answer:
      "Yes. Many of our clients need to coordinate both moves. We help compare the risks of buying first versus selling first, then build the offer, financing, closing-date, and condition strategy around your situation. The right order depends on your finances, the type of home you are selling, and how competitive the market is for the property you want to buy.",
  },
  {
    question: "Do you work across all NorthSide GTA communities?",
    answer:
      "Yes. Our primary service area includes Aurora, Newmarket, East Gwillimbury, Georgina, Whitchurch-Stouffville, Uxbridge, and Scugog. We also work throughout nearby York Region and Durham communities.\n\nIf your property is elsewhere in Ontario, we can still help. Where the market falls outside our direct area of expertise, we will connect you with a strong local agent we trust and remain available to help guide the process.\n\nEvery selling strategy is adjusted to the property, the local buyer pool, and the conditions in that specific market.",
  },
  {
    question: "Will we get pressured to list right away?",
    answer:
      "No. The first conversation is simply a chance to understand the property, your timing, and what you are trying to accomplish.\n\nIt also gives both sides an opportunity to determine whether the working relationship feels right before any commitment is made. We will explain your options, recommend the most sensible next steps, and leave the timing and decision with you.",
  },
  {
    question: "What happens after we submit the planning form?",
    answer:
      "Matthew or Landon will review the information personally and reach out within 24 hours. The first step is a straightforward conversation about the property, your timing, and what would be most helpful. From there, we may recommend a property visit, a pricing and market review, or a preparation plan. There is no automated valuation and no obligation to list.",
  },
  {
    question: "How do you determine the right list price?",
    answer:
      "We look at more than recent comparable sales. The property’s condition, location, unique features, current competition, buyer activity, and local market momentum all help determine the right strategy.\n\nOur goal is not simply to list your home. It is to position it to sell. The list price influences which buyers notice the property, how they interpret it, and how much activity the launch creates. We explain the available pricing options, the risks and advantages of each, and recommend the approach most likely to produce the strongest overall result.",
  },
  {
    question: "What is included in your marketing?",
    answer:
      "Every listing includes a strategy built around the property and the buyers most likely to respond to it. Depending on the home, that may include professional photography, video, drone footage, floor plans, listing copy, MLS exposure, social media, digital promotion, open houses, agent outreach, and property-specific web presentation.\n\nThe marketing is not treated as a checklist. The presentation, timing, and distribution should all work together to position the home properly.\n\nDo not add staging as a promised included service.",
  },
  {
    question: "What should we do before putting the home on the market?",
    answer:
      "We begin with a property review and identify what is worth addressing before the listing goes live. That may include repairs, decluttering, cleaning, paint, landscaping, exterior presentation, or minor updates.\n\nNot every home needs major work. We focus on the improvements most likely to strengthen buyer confidence and presentation, and we will also tell you where spending more is unlikely to make sense.",
  },
];

const TOWN_FAQS = {
  uxbridge: [
    {
      question: "What draws buyers to Uxbridge?",
      answer:
        "Trails, main street shops, and a calm pace close to Durham and York Region make Uxbridge a balanced move-up option.",
    },
    {
      question: "How is commuting from Uxbridge?",
      answer:
        "Most residents head to the 407 or 404; we map routes and GO options so your daily drive stays predictable.",
    },
    {
      question: "Where should I start when touring Uxbridge neighbourhoods?",
      answer:
        "We prioritize your budget and lifestyle, then preview key pockets like Quaker Village and historic streets to save you time.",
    },
  ],
  georgina: [
    {
      question: "Why consider Georgina for a move?",
      answer:
        "Lake Simcoe access, marinas, and family-friendly communities give Georgina a vacation feel with year-round convenience.",
    },
    {
      question: "Is Georgina only for waterfront buyers?",
      answer:
        "No. We mix in inland neighbourhoods, newer builds, and cottage-style streets so you see options that fit your budget.",
    },
    {
      question: "How busy is the commute from Georgina?",
      answer:
        "We review Hwy 404 timing, park-and-ride options, and express GO buses so you know what to expect on weekdays.",
    },
  ],
  "east-gwillimbury": [
    {
      question: "What’s unique about East Gwillimbury?",
      answer:
        "Master-planned communities, parks, and quick 404 access make it popular for families who want space without losing commutes.",
    },
    {
      question: "Are there newer homes available?",
      answer:
        "Yes. We track the latest releases in Sharon, Queensville, and Holland Landing and flag incentives or assignments when they appear.",
    },
    {
      question: "How do schools and amenities compare?",
      answer:
        "We outline local school catchments, trails, and shopping so you can compare East Gwillimbury to nearby towns easily.",
    },
  ],
  newmarket: [
    {
      question: "Why do buyers like Newmarket?",
      answer:
        "Historic Main Street, healthcare anchors, and GO connectivity make Newmarket a go-to hub with steady demand.",
    },
    {
      question: "Is there a mix of housing types?",
      answer:
        "Condos, semis, and detached homes cluster around different neighbourhoods; we guide you to the right pockets quickly.",
    },
    {
      question: "How competitive are offers?",
      answer:
        "We monitor weekly stats and set offer plans so you stay realistic on price and timing without chasing every listing.",
    },
  ],
  aurora: [
    {
      question: "What makes Aurora stand out?",
      answer:
        "Parks, established streets, and quick 404 access give Aurora strong resale potential and a calm residential feel.",
    },
    {
      question: "How can I pick between Aurora neighbourhoods?",
      answer:
        "We compare school zones, commute routes, and lot sizes across Aurora Heights, Bayview areas, and more to narrow choices fast.",
    },
    {
      question: "Does Aurora work for move-up buyers?",
      answer:
        "Yes. We line up detached options with room to grow and help time your sale so you move once, not twice.",
    },
  ],
  stouffville: [
    {
      question: "Why choose Stouffville?",
      answer:
        "GO Train access, a lively main street, and newer subdivisions make Stouffville attractive for commuters and families.",
    },
    {
      question: "Are there quiet pockets in Stouffville?",
      answer:
        "Absolutely. We highlight trails, park access, and low-traffic streets so you can balance convenience with calm.",
    },
    {
      question: "How does Stouffville pricing compare nearby?",
      answer:
        "We benchmark against Markham, Aurora, and Uxbridge so you see what your budget delivers in each market.",
    },
  ],
  scugog: [
    {
      question: "What’s appealing about Scugog?",
      answer:
        "Lake views, golf, and historic Port Perry give Scugog a relaxed feel while staying within reach of Durham employment hubs.",
    },
    {
      question: "How seasonal is the market in Scugog?",
      answer:
        "Waterfront interest spikes in spring and summer; we prep strategies that keep you competitive without overbidding.",
    },
    {
      question: "Can I balance rural space with services?",
      answer:
        "Yes. We compare rural roads and in-town options so you get the space you want without sacrificing everyday needs.",
    },
  ],
};

function getTownFaq(townSlug) {
  const key = String(townSlug || "").toLowerCase();
  return TOWN_FAQS[key] ? [...TOWN_FAQS[key]] : [];
}

module.exports = { buyersFaq, sellersFaq, getTownFaq };
