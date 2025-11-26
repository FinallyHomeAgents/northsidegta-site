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
    question: "How do you price homes for NorthSide GTA sellers?",
    answer:
      "We blend local comps, current buyer demand, and timing to set a price strategy that protects your equity and drives showings.",
  },
  {
    question: "What marketing do you include?",
    answer:
      "Professional photos, targeted digital ads, email, and neighbourhood outreach so buyers see your home online and in person.",
  },
  {
    question: "Can you help if I need to buy and sell at the same time?",
    answer:
      "Yes. We design a step-by-step plan that covers staging, offer timing, and bridge options so you never feel rushed.",
  },
  {
    question: "Do you manage showings and feedback?",
    answer:
      "We coordinate every showing, gather real feedback, and adjust quickly so your listing stays competitive.",
  },
  {
    question: "How do you negotiate offers?",
    answer:
      "We verify buyer strength, counter with clear terms, and protect your must-haves so you close on the right deal, not just the first one.",
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
