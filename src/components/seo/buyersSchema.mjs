const BUYERS_SEO_IMAGE = "https://northsidegta.ca/uploads/buyers-page-seo.jpg";
const SITE_URL = "https://northsidegta.ca";
const BUYERS_URL = `${SITE_URL}/buyers`;

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

export const BUYERS_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#realestateagent`,
      name: "Finally Home Agents",
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
      name: "Buying a Home North of Toronto | Finally Home Agents | NorthSide GTA",
      description:
        "Buying a home north of Toronto? Finally Home Agents guides buyers across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog.",
      inLanguage: "en-CA",
      image: BUYERS_SEO_IMAGE,
      about: { "@id": `${SITE_URL}/#realestateagent` },
      provider: { "@id": `${SITE_URL}/#realestateagent` },
      mainEntity: { "@id": `${BUYERS_URL}#service` },
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
