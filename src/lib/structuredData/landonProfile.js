const SITE_URL = "https://northsidegta.ca";
const PROFILE_PATH = "/agents/landon-mulhall";
const PROFILE_URL = `${SITE_URL}${PROFILE_PATH}`;
const profileSeo = require("../../components/seo/__generatedSiteSeo.json")[PROFILE_PATH];

const LANDON_IDENTITY = {
  "@type": "Person",
  "@id": `${SITE_URL}/#landon-mulhall`,
  name: "Landon Mulhall",
  url: PROFILE_URL,
  image: `${SITE_URL}/assets/agents/landon-mulhall-solo-portrait.jpg`,
  jobTitle: "Real Estate Professional",
  description:
    "NorthSide GTA real estate professional and co-founder of Finally Home Agents, licensed since 2022 and serving buyers and sellers across communities north of Toronto.",
  sameAs: ["https://www.instagram.com/lando.realtor/"],
};

const serviceAreas = [
  ["Georgina", "georgina"],
  ["East Gwillimbury", "east-gwillimbury"],
  ["Newmarket", "newmarket"],
  ["Aurora", "aurora"],
  ["Whitchurch-Stouffville", "stouffville"],
  ["Uxbridge", "uxbridge"],
  ["Scugog", "scugog"],
];

const faqEntries = [
  {
    question: "Who is Landon Mulhall?",
    answer:
      "Landon Mulhall is a co-founder of Finally Home Agents with HomeLife Optimum Realty. Licensed since 2022, he combines real estate guidance with a background in digital marketing, client service, market research, and community management.",
  },
  {
    question: "Which NorthSide GTA communities does Landon know best?",
    answer:
      "Landon grew up in Uxbridge and lives in East Gwillimbury, giving him first-hand knowledge of both communities. He also helps clients compare Georgina, Newmarket, Aurora, Whitchurch-Stouffville, Scugog, and other communities north of Toronto.",
  },
  {
    question: "Does Landon help people move north from Toronto?",
    answer:
      "Yes. Landon helps Toronto-area buyers compare communities by budget, commute, schools, lot size, amenities, outdoor recreation, and the amount of small-town atmosphere they want.",
  },
  {
    question: "How does Landon work with buyers?",
    answer:
      "Landon uses an organized, patient process that narrows the search around the client's priorities. He points out potential advantages and drawbacks without trying to sell a client on a particular home.",
  },
  {
    question: "How does Landon's marketing background help sellers?",
    answer:
      "His marketing background shapes how he approaches property positioning, online presentation, content, and communication. Pricing recommendations remain grounded in current market evidence and the seller's goals.",
  },
  {
    question: "How does Landon use AI in real estate?",
    answer:
      "Landon uses AI and other technology to support research, planning, organization, writing, and content development. Professional judgment, local knowledge, due diligence, negotiation, and client decisions remain human responsibilities.",
  },
];

function buildLandonProfileSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${PROFILE_URL}#profile-page`,
        url: PROFILE_URL,
        name: profileSeo.seo_title,
        description: profileSeo.seo_description,
        inLanguage: "en-CA",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${PROFILE_URL}#breadcrumb` },
        mainEntity: { "@id": LANDON_IDENTITY["@id"] },
      },
      Object.assign({}, LANDON_IDENTITY, {
        telephone: "+1-416-455-4594",
        email: "LandoTheRealtor@gmail.com",
        worksFor: { "@id": `${SITE_URL}/#finally-home-agents` },
        affiliation: [
          { "@id": `${SITE_URL}/#northside-gta` },
          { "@id": `${SITE_URL}/#homelife-optimum` },
        ],
        homeLocation: { "@id": `${SITE_URL}/#east-gwillimbury` },
        areaServed: serviceAreas.map(([, slug]) => ({ "@id": `${SITE_URL}/#${slug}` })),
        knowsAbout: [
          "NorthSide GTA real estate",
          "Uxbridge real estate",
          "East Gwillimbury real estate",
          "Toronto-to-NorthSide GTA relocation",
          "Residential buyer representation",
          "Residential seller representation",
          "Digital real estate marketing",
          "Property positioning",
          "Community comparison",
        ],
        mainEntityOfPage: { "@id": `${PROFILE_URL}#profile-page` },
      }),
      {
        "@type": "BreadcrumbList",
        "@id": `${PROFILE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
          { "@type": "ListItem", position: 3, name: "Landon Mulhall", item: PROFILE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PROFILE_URL}#faq`,
        mainEntity: faqEntries.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}

function buildLandonProfileMeta() {
  const image = `${SITE_URL}${profileSeo.og_image}`;
  return {
    route: PROFILE_PATH,
    ignoreSiteSeo: true,
    documentTitle: profileSeo.seo_title,
    title: profileSeo.seo_title,
    description: profileSeo.seo_description,
    canonicalUrl: profileSeo.canonical_url,
    ogType: "profile",
    ogTitle: profileSeo.og_title,
    ogDescription: profileSeo.og_description,
    ogImage: image,
    ogImageAlt: profileSeo.og_image_alt,
    twitterCard: "summary_large_image",
    twitterTitle: profileSeo.og_title,
    twitterDescription: profileSeo.og_description,
    twitterImage: image,
    twitterImageAlt: profileSeo.og_image_alt,
    siteName: "NorthSide GTA",
    additionalMeta: [
      { name: "robots", content: "index, follow" },
      { property: "og:locale", content: "en_CA" },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "profile:first_name", content: "Landon" },
      { property: "profile:last_name", content: "Mulhall" },
      { name: "author", content: "Landon Mulhall" },
      { name: "publisher", content: "Finally Home Agents" },
    ],
    schema: buildLandonProfileSchema(),
  };
}

module.exports = {
  PROFILE_PATH,
  PROFILE_URL,
  LANDON_IDENTITY,
  faqEntries,
  buildLandonProfileSchema,
  buildLandonProfileMeta,
};
