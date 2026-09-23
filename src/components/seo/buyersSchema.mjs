const BUYERS_SEO_IMAGE = "https://northsidegta.ca/uploads/buyers-page-seo.jpg";
const SITE_URL = "https://northsidegta.ca";
const BUYERS_URL = `${SITE_URL}/buyers`;

export const BUYERS_SEO = Object.freeze({
  title: "Buying a Home North of Toronto | Finally Home Agents",
  description:
    "Compare Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog with local buyer guidance from Finally Home Agents.",
  image: BUYERS_SEO_IMAGE,
  imageAlt: "Finally Home Agents buyer guidance for communities north of Toronto",
  url: BUYERS_URL,
});

const PRIMARY_SERVICE_AREAS = [
  "Aurora, Ontario",
  "Newmarket, Ontario",
  "Stouffville, Ontario",
  "Uxbridge, Ontario",
  "Georgina, Ontario",
  "East Gwillimbury, Ontario",
  "Scugog, Ontario",
];

const areaServed = PRIMARY_SERVICE_AREAS.map((name) => ({
  "@type": "Place",
  name,
}));

export const BUYER_FAQS = [
  {
    "question": "What are the best towns to buy in north of Toronto?",
    "answer": "The best town depends on your budget, commute, lifestyle, and the type of home you want. Aurora and Newmarket are strong fits for buyers who want established amenities, schools, and GO Transit access. Stouffville and East Gwillimbury work well for buyers who want family neighbourhoods with York Region convenience. Uxbridge, Georgina, and Scugog are often better fits for buyers who want more space, trails, lakes, golf, and a quieter pace while still staying connected to the GTA."
  },
  {
    "question": "Is moving north of Toronto a good option for Toronto buyers?",
    "answer": "For many buyers, yes. Moving north of Toronto can offer more space, quieter streets, larger lots, stronger community feel, and better lifestyle value than many similarly priced options in the city. The tradeoff is that commute, transit access, schools, local amenities, and town fit matter much more. That is why choosing the right community first is often more important than chasing individual listings."
  },
  {
    "question": "Which NorthSide GTA towns are best for commuting to Toronto?",
    "answer": "Aurora, Newmarket, East Gwillimbury, and Stouffville are often strong options for commuters because of GO Transit access and major road connections. The best choice depends on where you work, how often you commute, and whether you prefer train access, Highway 404 access, or a quieter setting with more space."
  },
  {
    "question": "Should I choose the town first or the house first?",
    "answer": "Most buyers should narrow the town first. A great house in the wrong community can still become the wrong move. We help buyers compare towns based on budget, commute, schools, lifestyle, lot size, amenities, resale considerations, and long-term fit before building a focused home search."
  },
  {
    "question": "Could my budget get me more space north of Toronto?",
    "answer": "It may open up options you have not considered. We help you compare communities, home types and everyday life alongside your budget. We have helped first-time buyers who initially expected to buy a Toronto condo find detached homes in the NorthSide GTA. What is possible for you depends on your budget, priorities and the homes available when you search."
  },
  {
    "question": "Do I need a local buyer agent if I already found homes online?",
    "answer": "Yes. Online listings show the property, but they do not always show the full picture. A local buyer agent helps evaluate location, pricing, neighbourhood context, resale risk, offer strategy, inspection concerns, and whether the home actually fits your goals once you see it in person."
  },
  {
    "question": "Can you help me find a larger home without leaving my neighbourhood?",
    "answer": "We can help you focus your search around the things you want to keep, as well as the space you need. For one family, that meant a larger home and yard within the same subdivision. We stayed in touch over an extended search, and they made their move when a suitable home became available."
  },
  {
    "question": "What should buyers know before leaving Toronto for a smaller town?",
    "answer": "The biggest shift is lifestyle. Many buyers gain space, quieter streets, trails, lakes, golf, and a stronger community feel, but they also need to think carefully about commute patterns, school zones, winter driving, local services, restaurants, activities, and how often they still need to be in the city."
  },
  {
    "question": "Can you help us decide whether to buy first or sell first?",
    "answer": "Yes. The right order depends on your finances, current home, target area, market conditions, timing, and risk tolerance. We help buyers and sellers compare both paths clearly so they understand the tradeoffs before making a move. We start with your next-home priorities and discuss preparation and timing for your current home alongside the purchase."
  },
  {
    "question": "What is the Town Match quiz for?",
    "answer": "The Town Match quiz helps buyers think through lifestyle, pace, commute, and community fit before they start chasing listings. It is not a replacement for a real strategy conversation, but it gives buyers a useful starting point for comparing NorthSide GTA towns."
  }
];

const buyerFaqSchema = {
  "@type": "FAQPage",
  "@id": `${BUYERS_URL}#faq`,
  url: BUYERS_URL,
  name: "Buyer Questions We Hear Most Often",
  inLanguage: "en-CA",
  mainEntity: BUYER_FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export const BUYERS_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#realestateagent`,
      name: "Finally Home Agents",
      alternateName: "NorthSide GTA",
      url: SITE_URL,
      image: BUYERS_SEO_IMAGE,
      telephone: "+16476684646",
      brand: {
        "@type": "Brand",
        "@id": `${SITE_URL}/#brand`,
        name: "NorthSide GTA",
        url: SITE_URL,
      },
      parentOrganization: {
        "@type": "Organization",
        name: "HomeLife Optimum Realty, Brokerage",
      },
      employee: [
        { "@type": "Person", name: "Matthew Mulhall" },
        { "@type": "Person", name: "Landon Mulhall" },
      ],
      areaServed,
      description:
        "Finally Home Agents — Matthew and Landon Mulhall — provide buyer representation across the NorthSide GTA, operating under HomeLife Optimum Realty, Brokerage.",
    },
    {
      "@type": "WebPage",
      "@id": `${BUYERS_URL}#webpage`,
      url: BUYERS_URL,
      name: BUYERS_SEO.title,
      description: BUYERS_SEO.description,
      inLanguage: "en-CA",
      image: BUYERS_SEO_IMAGE,
      about: { "@id": `${SITE_URL}/#realestateagent` },
      provider: { "@id": `${SITE_URL}/#realestateagent` },
      mainEntity: [{ "@id": `${BUYERS_URL}#service` }, { "@id": `${BUYERS_URL}#faq` }],
      breadcrumb: { "@id": `${BUYERS_URL}#breadcrumb` },
    },
    {
      "@type": "Service",
      "@id": `${BUYERS_URL}#service`,
      name: "Home buyer representation north of Toronto",
      serviceType: "Buyer representation",
      url: BUYERS_URL,
      provider: { "@id": `${SITE_URL}/#realestateagent` },
      brand: { "@id": `${SITE_URL}/#brand` },
      areaServed,
      description:
        "Buyer representation and town-by-town home search guidance across the NorthSide GTA communities north of Toronto.",
    },
    buyerFaqSchema,
    {
      "@type": "BreadcrumbList",
      "@id": `${BUYERS_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NorthSide GTA", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Buyers", item: BUYERS_URL },
      ],
    },
  ],
};

export default BUYERS_SCHEMA;
