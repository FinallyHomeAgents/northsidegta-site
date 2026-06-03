import React, { useEffect } from "react";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import "./HomePage.css";

import { HOMEPAGE_MARKUP } from "./homepageMarkup";

const HOME_TITLE = "NorthSide GTA Real Estate | Buy & Sell North of Toronto | Finally Home Agents";
const HOME_DESCRIPTION = "Buy or sell north of Toronto with Finally Home Agents. Explore NorthSide GTA real estate, homes, market data, and community guidance across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog.";
const HOME_URL = "https://www.northsidegta.ca/";
const HOME_IMAGE = "https://www.northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg";
const HOME_IMAGE_ALT = "Interactive NorthSide GTA real estate map showing Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog";

const FAQS = [
  {
    question: "What is the NorthSide GTA?",
    answer: "The NorthSide GTA refers to communities north of Toronto including Aurora, Newmarket, Whitchurch-Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog — areas where buyers often find more space, established communities, and lifestyle options while staying connected to the Greater Toronto Area.",
  },
  {
    question: "Who helps buyers and sellers in the NorthSide GTA?",
    answer: "Finally Home Agents — Matthew Mulhall and Landon Mulhall — provide buyer and seller representation across the NorthSide GTA, operating under HomeLife Optimum Realty, Brokerage, and regulated by RECO (Real Estate Council of Ontario).",
  },
  {
    question: "Is the NorthSide GTA a good area for families moving out of Toronto?",
    answer: "Many buyers consider the NorthSide GTA for more living space, established neighbourhoods, trail access, lakes, strong schools, and a quieter pace of life — while maintaining reasonable access to York Region, Durham Region, and Toronto via Hwy 404 and GO Transit.",
  },
  {
    question: "Can Finally Home Agents help me sell my home north of Toronto?",
    answer: "Yes. Finally Home Agents provides full seller representation across all seven NorthSide GTA communities — market-informed pricing strategy, professional photography, video, and marketing, and coordinated support through to closing.",
  },
  {
    question: "Can I compare NorthSide GTA communities before buying?",
    answer: "Yes. The NorthSide GTA platform helps buyers compare communities by lifestyle, price point, commute, and local character. Finally Home Agents provides town-by-town guidance before the search begins, so buyers understand the real differences between Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${HOME_URL}#organization`,
      name: "Finally Home Agents",
      alternateName: "NorthSide GTA",
      url: HOME_URL,
      logo: HOME_IMAGE,
      image: HOME_IMAGE,
      telephone: "+16476684646",
      foundingDate: "2017",
      parentOrganization: {
        "@type": "Organization",
        name: "HomeLife Optimum Realty, Brokerage",
      },
      sameAs: [
        "https://www.instagram.com/finallyhomeagents/",
        "https://www.facebook.com/finallyhomeagents/",
      ],
    },
    {
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "@id": `${HOME_URL}#realestateagent`,
      name: "Finally Home Agents — NorthSide GTA",
      url: HOME_URL,
      image: HOME_IMAGE,
      telephone: "+16476684646",
      priceRange: "$$",
      parentOrganization: { "@id": `${HOME_URL}#organization` },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Newmarket",
        addressRegion: "ON",
        addressCountry: "CA",
      },
      areaServed: ["Aurora", "Newmarket", "Whitchurch-Stouffville", "Uxbridge", "Georgina", "East Gwillimbury", "Scugog"].map((name) => ({
        "@type": "Place",
        name,
        containedInPlace: { "@type": "AdministrativeArea", name: "Greater Toronto Area" },
      })),
      employee: [
        { "@type": "Person", name: "Matthew Mulhall", telephone: "+16476684646", jobTitle: "Sales Representative" },
        { "@type": "Person", name: "Landon Mulhall", telephone: "+14164554594", jobTitle: "Sales Representative" },
      ],
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "10:00", closes: "17:00" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "NorthSide GTA Real Estate Services",
        itemListElement: ["Buyer Representation", "Seller Representation", "Community Consultation", "Home Value Guidance", "Market Guidance"].map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name, provider: { "@id": `${HOME_URL}#realestateagent` } },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${HOME_URL}#website`,
      url: HOME_URL,
      name: "NorthSide GTA",
      publisher: { "@id": `${HOME_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.northsidegta.ca/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${HOME_URL}#webpage`,
      url: HOME_URL,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      isPartOf: { "@id": `${HOME_URL}#website` },
      about: { "@id": `${HOME_URL}#realestateagent` },
      primaryImageOfPage: { "@type": "ImageObject", url: HOME_IMAGE, caption: HOME_IMAGE_ALT },
      datePublished: "2017-01-01",
      dateModified: "2026-06-03",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 1, name: "NorthSide GTA", item: HOME_URL }],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${HOME_URL}#faq`,
      mainEntity: FAQS.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function HomePage() {
  useEffect(() => {
    const drawer = document.getElementById("mobile-drawer");
    const openButton = document.querySelector(".site-header__menu-toggle");
    const closeButton = document.querySelector(".mobile-drawer__close");
    const setDrawerOpen = (isOpen) => {
      if (!drawer || !openButton) return;
      drawer.hidden = !isOpen;
      openButton.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("mobile-drawer-open", isOpen);
    };
    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);
    const closeOnLink = (event) => {
      if (event.target.closest("a")) closeDrawer();
    };

    openButton?.addEventListener("click", openDrawer);
    closeButton?.addEventListener("click", closeDrawer);
    drawer?.addEventListener("click", closeOnLink);

    return () => {
      openButton?.removeEventListener("click", openDrawer);
      closeButton?.removeEventListener("click", closeDrawer);
      drawer?.removeEventListener("click", closeOnLink);
      document.body.classList.remove("mobile-drawer-open");
    };
  }, []);

  return (
    <>
      <DynamicMetaTags
        route="/"
        documentTitle={HOME_TITLE}
        title={HOME_TITLE}
        description={HOME_DESCRIPTION}
        canonicalUrl={HOME_URL}
        ogType="website"
        ogImage={HOME_IMAGE}
        ogImageAlt={HOME_IMAGE_ALT}
        twitterCard="summary_large_image"
        twitterImage={HOME_IMAGE}
        twitterImageAlt={HOME_IMAGE_ALT}
        siteName="NorthSide GTA"
        additionalMeta={[
          { name: "robots", content: "index, follow" },
          { property: "og:locale", content: "en_CA" },
          { name: "twitter:site", content: "@northsidegta" },
          { name: "facebook-domain-verification", content: "1tfwypal0s72obxs9238figl03nk5i" },
          { name: "geo.region", content: "CA-ON" },
          { name: "geo.placename", content: "Newmarket, Ontario, Canada" },
          { name: "language", content: "en-CA" },
          { name: "referrer", content: "strict-origin-when-cross-origin" },
        ]}
      >
        <meta httpEquiv="content-language" content="en-CA" />
        <link rel="alternate" hrefLang="en-CA" href={HOME_URL} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </DynamicMetaTags>
      <div className="homepage-v4" dangerouslySetInnerHTML={{ __html: HOMEPAGE_MARKUP }} />
    </>
  );
}
