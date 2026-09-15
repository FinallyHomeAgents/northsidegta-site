const SITE_URL = "https://northsidegta.ca";
const PROFILE_PATH = "/agents/matthew-mulhall";
const PROFILE_URL = `${SITE_URL}${PROFILE_PATH}`;
const profileSeo = require("../../components/seo/__generatedSiteSeo.json")[PROFILE_PATH];

// Identity consistency with the site-wide graph is covered by regression tests.
const MATTHEW_IDENTITY = {
  "@type": "Person",
  "@id": `${SITE_URL}/#matthew-mulhall`,
  name: "Matthew Mulhall",
  url: PROFILE_URL,
  image: `${SITE_URL}/assets/agents/matthew-mulhall-solo-portrait.jpg`,
  jobTitle: "Sales Representative",
  description:
    "NorthSide GTA real estate agent licensed since 2009, serving buyers, sellers, and Toronto-area households moving north.",
};

// Both prerendered HTML and client navigation consume the same SEO source.
function buildMatthewProfileMeta() {
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
      { property: "profile:first_name", content: "Matthew" },
      { property: "profile:last_name", content: "Mulhall" },
      { name: "author", content: "Matthew Mulhall" },
      { name: "publisher", content: "Finally Home Agents" },
    ],
    schema: buildMatthewProfileSchema(),
  };
}

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
    question: "Who is Matthew Mulhall?",
    answer:
      "Matthew Mulhall is a NorthSide GTA real estate agent with Finally Home Agents at HomeLife Optimum Realty, Brokerage. Licensed since 2009, he helps buyers and sellers make informed decisions across the communities north of Toronto.",
  },
  {
    question: "Does Matthew help people move north from Toronto?",
    answer:
      "Yes. Matthew helps Toronto-area buyers compare the NorthSide GTA by budget, commute, schools, home type, property size, amenities, and lifestyle so they can narrow seven communities to the two or three that fit them best.",
  },
  {
    question: "Which areas does Matthew Mulhall serve?",
    answer:
      "Matthew serves Georgina, East Gwillimbury, Newmarket, Aurora, Whitchurch-Stouffville, Uxbridge, and Scugog, including communities such as Keswick, Sutton, Sharon, Queensville, Holland Landing, Mount Albert, and Port Perry.",
  },
  {
    question: "Does Matthew work with local homeowners as well as relocating buyers?",
    answer:
      "Yes. Matthew represents current NorthSide GTA homeowners who are selling, buying, upsizing, downsizing, or moving within the area, as well as buyers relocating from farther south.",
  },
  {
    question: "What does the athlete-agent relationship mean in real estate?",
    answer:
      "It means the client remains the principal and Matthew acts as a prepared, loyal representative: understanding the goal, protecting the client's interests, building the strategy, coordinating specialists, and negotiating firmly on the client's behalf.",
  },
  {
    question: "How does Matthew use AI in real estate?",
    answer:
      "Matthew uses AI and modern technology to improve research, organization, property monitoring, marketing content, and distribution. Local judgment, honest advice, due diligence, and negotiation remain human responsibilities.",
  },
];

function buildMatthewProfileSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${PROFILE_URL}#profile-page`,
        url: PROFILE_URL,
        name: "Matthew Mulhall | NorthSide GTA Real Estate Agent",
        description:
          "Meet Matthew Mulhall, a NorthSide GTA real estate agent helping buyers and sellers compare communities, plan moves, and negotiate with confidence.",
        inLanguage: "en-CA",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${PROFILE_URL}#breadcrumb` },
        mainEntity: { "@id": `${SITE_URL}/#matthew-mulhall` },
      },
      Object.assign({}, MATTHEW_IDENTITY, {
        telephone: "+1-647-668-4646",
        email: "contact@finallyhomeagents.com",
        worksFor: { "@id": `${SITE_URL}/#finally-home-agents` },
        affiliation: [
          { "@id": `${SITE_URL}/#northside-gta` },
          { "@id": `${SITE_URL}/#homelife-optimum` },
        ],
        homeLocation: { "@id": `${SITE_URL}/#keswick` },
        areaServed: serviceAreas.map(([, slug]) => ({ "@id": `${SITE_URL}/#${slug}` })),
        knowsAbout: [
          "NorthSide GTA real estate",
          "Toronto-to-NorthSide GTA relocation",
          "Residential buyer representation",
          "Residential seller representation",
          "Real estate negotiation",
          "Real estate marketing",
          ...serviceAreas.map(([name]) => `${name} real estate`),
        ],
        award: [
          "#1 Individual Agent at HomeLife Optimum Realty, 2023",
          "#1 Individual Agent at HomeLife Optimum Realty, 2024",
          "#1 Individual Agent at HomeLife Optimum Realty, 2025",
        ],
        mainEntityOfPage: { "@id": `${PROFILE_URL}#profile-page` },
      }),
      {
        "@type": "BreadcrumbList",
        "@id": `${PROFILE_URL}#breadcrumb`,
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
            name: "About",
            item: `${SITE_URL}/about`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Matthew Mulhall",
            item: PROFILE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PROFILE_URL}#faq`,
        mainEntity: faqEntries.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };
}

module.exports = {
  PROFILE_PATH,
  PROFILE_URL,
  MATTHEW_IDENTITY,
  buildMatthewProfileMeta,
  faqEntries,
  buildMatthewProfileSchema,
};
