#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const markupSource = fs.readFileSync(path.join(process.cwd(), "src", "homepageMarkup.js"), "utf8");
const markupMatch = markupSource.match(/String\.raw`([\s\S]*)`;?\s*$/);
if (!markupMatch) {
  throw new Error("Unable to read homepage markup source");
}
const HOMEPAGE_MARKUP = markupMatch[1].replace(/\\`/g, "`").replace(/\\\$\{/g, "${");

const buildIndex = path.join(process.cwd(), "build", "index.html");
if (!fs.existsSync(buildIndex)) {
  console.warn("[inject-homepage-static-html] build/index.html not found; skipping");
  process.exit(0);
}

const homeUrl = "https://www.northsidegta.ca/";
const title = "NorthSide GTA Real Estate | Buy & Sell North of Toronto | Finally Home Agents";
const description = "Buy or sell north of Toronto with Finally Home Agents. Explore NorthSide GTA real estate, homes, market data, and community guidance across Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog.";
const image = "https://www.northsidegta.ca/uploads/northside-gta-finally-home-agents-hero.jpg";
const faq = [
  ["What is the NorthSide GTA?", "The NorthSide GTA refers to communities north of Toronto including Aurora, Newmarket, Whitchurch-Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog — areas where buyers often find more space, established communities, and lifestyle options while staying connected to the Greater Toronto Area."],
  ["Who helps buyers and sellers in the NorthSide GTA?", "Finally Home Agents — Matthew Mulhall and Landon Mulhall — provide buyer and seller representation across the NorthSide GTA, operating under HomeLife Optimum Realty, Brokerage, and regulated by RECO (Real Estate Council of Ontario)."],
  ["Is the NorthSide GTA a good area for families moving out of Toronto?", "Many buyers consider the NorthSide GTA for more living space, established neighbourhoods, trail access, lakes, strong schools, and a quieter pace of life — while maintaining reasonable access to York Region, Durham Region, and Toronto via Hwy 404 and GO Transit."],
  ["Can Finally Home Agents help me sell my home north of Toronto?", "Yes. Finally Home Agents provides full seller representation across all seven NorthSide GTA communities — market-informed pricing strategy, professional photography, video, and marketing, and coordinated support through to closing."],
  ["Can I compare NorthSide GTA communities before buying?", "Yes. The NorthSide GTA platform helps buyers compare communities by lifestyle, price point, commute, and local character. Finally Home Agents provides town-by-town guidance before the search begins, so buyers understand the real differences between Aurora, Newmarket, Stouffville, Uxbridge, Georgina, East Gwillimbury, and Scugog."],
];
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${homeUrl}#organization`, name: "Finally Home Agents", alternateName: "NorthSide GTA", url: homeUrl, telephone: "+16476684646", foundingDate: "2017", parentOrganization: { "@type": "Organization", name: "HomeLife Optimum Realty, Brokerage" }, sameAs: ["https://www.instagram.com/finallyhomeagents/", "https://www.facebook.com/finallyhomeagents/"] },
    { "@type": ["RealEstateAgent", "LocalBusiness"], "@id": `${homeUrl}#realestateagent`, name: "Finally Home Agents — NorthSide GTA", url: homeUrl, image, telephone: "+16476684646", areaServed: ["Aurora", "Newmarket", "Whitchurch-Stouffville", "Uxbridge", "Georgina", "East Gwillimbury", "Scugog"], employee: [{ "@type": "Person", name: "Matthew Mulhall", telephone: "+16476684646" }, { "@type": "Person", name: "Landon Mulhall", telephone: "+14164554594" }] },
    { "@type": "WebSite", "@id": `${homeUrl}#website`, url: homeUrl, name: "NorthSide GTA", publisher: { "@id": `${homeUrl}#organization` }, potentialAction: { "@type": "SearchAction", target: "https://www.northsidegta.ca/search?q={search_term_string}", "query-input": "required name=search_term_string" } },
    { "@type": "WebPage", "@id": `${homeUrl}#webpage`, url: homeUrl, name: title, description, isPartOf: { "@id": `${homeUrl}#website` }, about: { "@id": `${homeUrl}#realestateagent` }, datePublished: "2017-01-01", dateModified: "2026-06-03", breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "NorthSide GTA", item: homeUrl }] } },
    { "@type": "FAQPage", "@id": `${homeUrl}#faq`, mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ],
};

let html = fs.readFileSync(buildIndex, "utf8");
html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${HOMEPAGE_MARKUP}</div>`);
if (!html.includes('rel="alternate" hreflang="en-CA"')) {
  html = html.replace("</head>", `<meta http-equiv="content-language" content="en-CA"><link rel="alternate" hreflang="en-CA" href="${homeUrl}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script></head>`);
}
fs.writeFileSync(buildIndex, html, "utf8");
console.log("[inject-homepage-static-html] Injected crawlable homepage body and JSON-LD into build/index.html");
