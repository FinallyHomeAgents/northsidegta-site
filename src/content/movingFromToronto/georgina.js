const SITE_URL = "https://northsidegta.ca";

const georginaMovingGuide = {
  town: "Georgina",
  slug: "georgina",
  route: "/moving-to-georgina-from-toronto",
  title: "Moving to Georgina from Toronto (2026 Guide) | Finally Home Agents",
  description:
    "Thinking of moving to Georgina from Toronto? Keswick, Sutton & Jackson's Point compared — real prices, the honest commute, and what your Toronto money buys on Lake Simcoe.",
  heroImage: "/Images/georgina-banner.jpg",
  heroImageAlt: "Lake Simcoe shoreline at Jackson's Point, Georgina",
  badgeImage: "/assets/town-logos/georgina.webp",
  badgeImageAlt: "Georgina NorthSide GTA town badge",
  communityImage: "/uploads/insights/georgina-keswick-lakefront-aerial-2026.jpg",
  communityImageAlt: "Aerial view of Keswick homes along the Lake Simcoe shoreline in Georgina",
  kicker: "Relocation Guide · Georgina",
  heading: "Moving to Georgina from Toronto: The Honest 2026 Guide",
  intro:
    "Sell a Toronto condo, buy a detached house on the Lake Simcoe side of the GTA — that's the trade more Toronto families are making every year. Here's what that move actually looks like: the good, the trade-offs, and the numbers.",
  budgetCard: {
    heading: "What does $800K buy in Georgina?",
    body:
      "A detached 3–4 bed family home in Keswick with a garage and real backyard — or a renovated bungalow near the lake in Sutton or Jackson's Point. In Toronto, $800K is a two-bed condo with maintenance fees.",
  },
  communities: [
    {
      heading: "Keswick — the practical choice",
      body:
        "The largest community, closest to Highway 404, with the most amenities, newer subdivisions, and the widest selection of family homes. Home to the MURC and the ROC. If you're commuting or want the easiest transition from city life, start here.",
    },
    {
      heading: "Sutton — small-town Ontario",
      body:
        "A historic main street, slower pace, and quick access to Sibbald Point Provincial Park. More house and lot for your money than Keswick, a few minutes further from the highway.",
    },
    {
      heading: "Jackson's Point — the lake life",
      body:
        "Steps to Lake Simcoe, marinas, beaches, and cottage-country character in a year-round community. Waterfront living here is still attainable in a way that stopped being true in most of Ontario years ago.",
    },
  ],
  familyCards: [
    {
      icon: "🏊",
      heading: "The MURC (opened 2024)",
      body:
        "Keswick's new Multi-Use Recreation Complex: six-lane 25-metre pool, leisure and therapy pools, swim lessons, drop-in programs, and fitness classes — the kind of facility Toronto families assume they're giving up by leaving.",
    },
    {
      icon: "⚽",
      heading: "The ROC",
      body:
        "A year-round outdoor campus: 10 sports fields for soccer, lacrosse and field hockey, six free pickleball courts, plus winter tubing and skiing on the hill. Town-run camps and child/youth programs cover preschool through age 14.",
    },
    {
      icon: "🏫",
      heading: "Schools",
      body:
        "York Region public and Catholic boards. Keswick High School, Sutton District High, and elementary options in every community — school catchment is one of the first things we map for families.",
    },
    {
      icon: "🏒",
      heading: "Small-town sports culture",
      body:
        "Minor hockey, soccer leagues, and lake life: swimming and beach days all summer, ice fishing and tubing in winter. Kids here grow up outside.",
    },
    {
      icon: "🏥",
      heading: "Healthcare",
      body:
        "Southlake Regional Health Centre in Newmarket is about 20–25 minutes away; family clinics and pharmacies operate in Keswick and Sutton.",
    },
    {
      icon: "🛒",
      heading: "The honest trade-off",
      body:
        "Fewer restaurants and big-box stores than Newmarket or Aurora — you'll drive 20 minutes for some errands. Most families call it a fair trade for the mortgage payment and the lake.",
    },
  ],
  faqs: [
    {
      question: "Is Georgina a good place to live?",
      answer:
        "Georgina offers the most affordable homeownership in the GTA's northern communities, with Lake Simcoe beaches, ice fishing, trails, and new recreation facilities like the MURC. It suits families wanting space and lake access, and hybrid workers who don't commute downtown daily.",
    },
    {
      question: "Is Georgina a good place to raise kids?",
      answer:
        "Yes, for families who value outdoor life and space. The MURC (opened 2024) offers swim lessons and youth programs, the ROC has 10 sports fields plus winter tubing, town-run camps cover preschool to age 14, and schools fall under York Region's public and Catholic boards. The trade-off is fewer urban amenities than Newmarket or Aurora.",
    },
    {
      question: "How far is Georgina from Toronto?",
      answer:
        "About 60–80 km depending on your end of town. Driving takes roughly an hour via Highway 404. The GO 67 bus serves the corridor, and East Gwillimbury GO station is about 20–25 minutes away by car.",
    },
    {
      question: "Is Georgina cheaper than Toronto?",
      answer:
        "Significantly. Detached-house money in Georgina is condo money in Toronto, and buyers leaving Toronto also avoid Toronto's municipal land transfer tax — roughly $11,000+ saved on a typical purchase.",
    },
    {
      question: "What's the difference between Keswick, Sutton, and Jackson's Point?",
      answer:
        "Keswick is the largest and most convenient, with the MURC and ROC. Sutton offers small-town character and more property for the money. Jackson's Point is the lakeside community with beaches and marinas. Pefferlaw and Udora offer rural properties.",
    },
    {
      question: "Does Georgina have a GO train station?",
      answer:
        "No. The nearest GO train stations are East Gwillimbury GO and Newmarket GO on the Barrie line, about 20–25 minutes' drive from Keswick. GO's route 67 bus connects the Keswick area toward North York via Highway 404.",
    },
    {
      question: "Who can help me buy a home in Georgina?",
      answer:
        "Finally Home Agents (Matthew and Landon Mulhall, HomeLife Optimum Realty, Brokerage) live and work in the NorthSide GTA and guide Toronto buyers through Georgina town-by-town — starting with whether it's the right town for you at all.",
    },
  ],
};

function buildMovingGuideSchema(content = georginaMovingGuide) {
  const url = `${SITE_URL}${content.route}`;
  const publisher = {
    "@type": "Organization",
    name: "Finally Home Agents",
    alternateName: "NorthSide GTA",
    url: SITE_URL,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: content.heading,
        description: content.description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: `${SITE_URL}${content.heroImage}`,
        datePublished: "2026-07-29",
        dateModified: "2026-07-29",
        author: {
          "@type": "Person",
          name: "Matthew Mulhall",
          jobTitle: "Sales Representative",
          worksFor: publisher,
        },
        publisher,
        about: {
          "@type": "Place",
          name: `${content.town}, Ontario`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: content.faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Moving North",
            item: `${SITE_URL}/buyers`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.town,
            item: url,
          },
        ],
      },
    ],
  };
}

module.exports = {
  SITE_URL,
  georginaMovingGuide,
  buildMovingGuideSchema,
};
