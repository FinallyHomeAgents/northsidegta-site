import React from "react";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import Navigation from "./Navigation";
import Footer from "./Footer";
import LeadForm from "./components/LeadForm";
import "./HomePage.css";
import "./CommunitiesPage.css";

const PAGE_URL = "https://northsidegta.ca/communities";
const PAGE_TITLE = "NorthSide GTA Communities | Compare Towns North of Toronto";
const PAGE_DESCRIPTION =
  "Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with Matthew and Landon Mulhall of Finally Home Agents.";
const OG_IMAGE = "https://northsidegta.ca/assets/homepage/northside-map.svg";
const TEAM_IMAGE = "/assets/homepage/matthew-landon-northside-gta.jpg";
const TEAM_IMAGE_ALT =
  "Matthew Mulhall and Landon Mulhall of Finally Home Agents — NorthSide GTA real estate";

const towns = [
  {
    name: "Georgina",
    slug: "georgina",
    logo: "/assets/town-logos/georgina.webp",
    alt: "Georgina official municipal logo",
    fit: "Lake Simcoe lifestyle, value, cottages, family neighbourhoods, and room to breathe.",
    bestFor: "Buyers who want waterfront access, more space, and a community feel without leaving the GTA orbit.",
    watch: "Commute patterns vary by village, so Keswick, Sutton, Jackson's Point, and Pefferlaw should be compared carefully.",
    highlights: ["Lake Simcoe", "More space", "Value"],
  },
  {
    name: "East Gwillimbury",
    slug: "east-gwillimbury",
    logo: "/assets/town-logos/east-gwillimbury.webp",
    alt: "East Gwillimbury official municipal logo",
    fit: "A growing north-of-Newmarket option with newer subdivisions, family demand, and GO/404 connectivity.",
    bestFor: "Move-up buyers who want newer homes, schools, parks, and a quieter pace near York Region employment routes.",
    watch: "New development pockets can feel very different from established Holland Landing, Sharon, and Mount Albert streets.",
    highlights: ["Newer homes", "Family growth", "GO access"],
  },
  {
    name: "Newmarket",
    slug: "newmarket",
    logo: "/assets/town-logos/newmarket.webp",
    alt: "Newmarket official municipal logo",
    fit: "The central NorthSide hub for walkability, healthcare, shopping, schools, trails, and commuter convenience.",
    bestFor: "Buyers who want a strong town centre, established neighbourhoods, and convenient access to the 404 and GO Transit.",
    watch: "Neighbourhood micro-markets matter; Bristol-London, Stonehaven, Armitage, and Old Newmarket can price differently.",
    highlights: ["Central hub", "Trails", "GO + 404"],
  },
  {
    name: "Aurora",
    slug: "aurora",
    logo: "/assets/town-logos/aurora.webp",
    alt: "Aurora official municipal logo",
    fit: "A premium York Region community with heritage streets, strong schools, ravines, golf, and executive homes.",
    bestFor: "Buyers seeking a polished community feel, long-term resale confidence, and an upscale north GTA lifestyle.",
    watch: "Entry price is often higher than neighbouring towns, so the lifestyle value needs to match the budget.",
    highlights: ["Premium", "Schools", "Ravines"],
  },
  {
    name: "Stouffville",
    slug: "stouffville",
    logo: "/assets/town-logos/stouffville.webp",
    alt: "Whitchurch-Stouffville official municipal logo",
    fit: "Main Street charm, family subdivisions, trails, and easy Markham/York Region access with a small-town edge.",
    bestFor: "Buyers moving north from Markham, Scarborough, or Toronto who still want strong everyday convenience.",
    watch: "Compare village, subdivision, and rural Whitchurch-Stouffville options because lifestyle and maintenance differ.",
    highlights: ["Main Street", "Trails", "Markham access"],
  },
  {
    name: "Uxbridge",
    slug: "uxbridge",
    logo: "/assets/town-logos/uxbridge.webp",
    alt: "Uxbridge official municipal logo",
    fit: "Trail capital energy, century homes, rural estates, golf, and a highly local community rhythm.",
    bestFor: "Lifestyle-led buyers who value trails, space, character, and a quieter daily pace north of the city.",
    watch: "Commute, snow routes, rural services, and property maintenance should be part of the buying plan.",
    highlights: ["Trails", "Character", "Rural options"],
  },
  {
    name: "Scugog",
    slug: "scugog",
    logo: "/assets/town-logos/scugog.webp",
    alt: "Scugog official municipal logo",
    fit: "Port Perry waterfront, Lake Scugog, heritage charm, rural properties, and a relaxed east-side NorthSide option.",
    bestFor: "Buyers who want lake-town lifestyle, small-town charm, and more space while staying connected to Durham Region.",
    watch: "Port Perry, waterfront, and rural pockets each carry different pricing, servicing, and lifestyle considerations.",
    highlights: ["Port Perry", "Waterfront", "Heritage"],
  },
];

const faqs = [
  {
    question: "Which NorthSide GTA community is best for moving north from Toronto?",
    answer:
      "There is no single best town. Newmarket and Aurora often appeal to buyers prioritizing established York Region convenience, East Gwillimbury and Georgina can offer more space, Stouffville balances small-town feel with Markham access, while Uxbridge and Scugog lean more lifestyle, trails, and lake-town living.",
  },
  {
    question: "Can Matthew and Landon help us compare towns before we start showings?",
    answer:
      "Yes. Matthew and Landon Mulhall help buyers compare commute, schools, trails, lake access, neighbourhood feel, home style, and market conditions before narrowing the search to specific listings.",
  },
  {
    question: "Are these communities still connected to the GTA?",
    answer:
      "Yes. The NorthSide GTA is positioned for buyers who want more space and community while staying connected through routes such as Highway 404, regional roads, GO Transit, and York or Durham employment corridors.",
  },
  {
    question: "Do you only work with buyers?",
    answer:
      "No. Finally Home Agents supports both buyers and sellers across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with local pricing, preparation, marketing, negotiation, and relocation guidance.",
  },
  {
    question: "What happens after I request my NorthSide Town Match?",
    answer:
      "You will be contacted by Finally Home Agents to review your budget, timing, lifestyle priorities, commute needs, and must-haves so the recommended towns feel useful rather than generic.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      about: {
        "@type": "RealEstateAgent",
        name: "Finally Home Agents — NorthSide GTA",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

function TownLogoRail() {
  return (
    <nav className="communities-logo-rail" aria-label="Official town logos for NorthSide GTA communities">
      {towns.map((town) => (
        <a key={town.slug} href={`/communities/${town.slug}`} className="communities-logo-rail__tile">
          <img src={town.logo} alt={town.alt} width="720" height="300" loading="lazy" decoding="async" />
        </a>
      ))}
    </nav>
  );
}

function CommunitiesPage() {
  return (
    <>
      <DynamicMetaTags
        route="/communities"
        documentTitle={PAGE_TITLE}
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        canonicalUrl={PAGE_URL}
        ogType="website"
        ogImage={OG_IMAGE}
        ogImageAlt="NorthSide GTA community comparison map"
        twitterCard="summary_large_image"
        twitterImage={OG_IMAGE}
        twitterImageAlt="NorthSide GTA community comparison map"
        siteName="NorthSide GTA"
        additionalMeta={[
          { name: "robots", content: "index, follow" },
          { property: "og:locale", content: "en_CA" },
          { name: "geo.region", content: "CA-ON" },
          { name: "geo.placename", content: "NorthSide GTA, Ontario, Canada" },
        ]}
      >
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </DynamicMetaTags>

      <Navigation />
      <main className="communities-page">
        <section className="communities-hero" aria-labelledby="communities-hero-heading">
          <div className="section-inner communities-hero__grid">
            <div className="communities-hero__copy">
              <p className="section-eyebrow">NorthSide GTA community guide</p>
              <h1 id="communities-hero-heading">Find the NorthSide town that fits your next chapter.</h1>
              <p className="communities-hero__lead">
                Compare Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with clear local guidance from Matthew and Landon Mulhall of Finally Home Agents.
              </p>
              <p className="communities-hero__body">
                If you are moving north from Toronto or the inner GTA, this guide helps you weigh more space, more community, trails, lakes, schools, commute, and market fit — without making the move feel disconnected from the GTA.
              </p>
              <div className="communities-hero__actions">
                <a className="btn btn--green" href="#town-match">Get Your NorthSide Town Match</a>
                <a className="btn btn--ghost-on-dark" href="#compare-communities">Compare the Communities</a>
              </div>
            </div>
            <aside className="communities-hero__card" aria-label="Finally Home Agents local guidance">
              <img src={TEAM_IMAGE} alt={TEAM_IMAGE_ALT} width="1484" height="1060" loading="eager" decoding="async" />
              <div>
                <p className="communities-hero__card-kicker">Finally Home Agents</p>
                <p className="communities-hero__card-title">Matthew &amp; Landon Mulhall</p>
                <p className="communities-hero__card-copy">Local buyer and seller guidance across the seven focus NorthSide GTA communities.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="communities-proof" aria-label="NorthSide GTA proof points">
          <div className="section-inner communities-proof__grid">
            <span>Seven focus communities</span>
            <span>Buyer comparison guidance</span>
            <span>Seller market strategy</span>
            <span>Toronto-connected lifestyle moves</span>
          </div>
        </section>

        <section className="communities-north" aria-labelledby="moving-north-heading">
          <div className="section-inner communities-north__grid">
            <div>
              <p className="section-eyebrow">Why buyers move north</p>
              <h2 className="section-heading" id="moving-north-heading">More space, more community, and a better lifestyle fit — still connected to the GTA.</h2>
            </div>
            <div className="communities-north__cards">
              {[
                ["Space to grow", "Detached homes, bigger lots, trails, and lake-country options can change daily life without cutting ties to the city."],
                ["Community rhythm", "Main streets, local schools, sports, golf, waterfronts, farmers markets, and neighbourhood pride make each town feel distinct."],
                ["Guided trade-offs", "The right town depends on commute, budget, home style, schools, servicing, resale, and the lifestyle you want after the move."],
              ].map(([title, copy]) => (
                <article className="communities-mini-card" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="communities-map-section" aria-labelledby="map-heading">
          <div className="section-inner">
            <div className="section-header section-header--center">
              <p className="section-eyebrow">Explore the region</p>
              <h2 className="section-heading" id="map-heading">Start with the map, then narrow by lifestyle.</h2>
              <p className="section-sub">Focus communities link to their town pages. Nearby guided areas are shown as contextual service areas only.</p>
            </div>
            <div className="communities-map-card">
              <object
                className="communities-map-card__object"
                data="/assets/homepage/northside-map.svg"
                type="image/svg+xml"
                aria-label="Interactive NorthSide GTA map with focus communities and nearby guided areas"
              >
                <img src="/assets/homepage/northside-map.svg" alt="NorthSide GTA map showing Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog" width="1600" height="900" loading="lazy" />
              </object>
              <div className="map-legend" aria-label="Map legend">
                <span className="map-legend__item"><span className="map-legend__dot map-legend__dot--focus" aria-hidden="true"></span>NorthSide GTA focus area</span>
                <span className="map-legend__item"><span className="map-legend__dot map-legend__dot--served" aria-hidden="true"></span>Guidance also available nearby</span>
              </div>
            </div>
            <TownLogoRail />
          </div>
        </section>

        <section className="communities-compare" id="compare-communities" aria-labelledby="compare-heading">
          <div className="section-inner">
            <div className="section-header section-header--center">
              <p className="section-eyebrow">Town comparison cards</p>
              <h2 className="section-heading" id="compare-heading">Compare the seven NorthSide GTA focus communities.</h2>
            </div>
            <div className="communities-town-grid">
              {towns.map((town) => (
                <article className="communities-town-card" key={town.slug}>
                  <div className="communities-town-card__logo-wrap">
                    <img src={town.logo} alt={town.alt} width="720" height="300" loading="lazy" decoding="async" />
                  </div>
                  <div className="communities-town-card__body">
                    <h3>{town.name}</h3>
                    <p>{town.fit}</p>
                    <ul className="pill-list" aria-label={`${town.name} highlights`}>
                      {town.highlights.map((item) => <li className="pill" key={item}>{item}</li>)}
                    </ul>
                    <a href={`/communities/${town.slug}`} className="communities-town-card__link">Explore {town.name} →</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="communities-matrix" aria-labelledby="matrix-heading">
          <div className="section-inner">
            <div className="section-header">
              <p className="section-eyebrow">Decision matrix</p>
              <h2 className="section-heading" id="matrix-heading">Use the town-by-town trade-offs before you chase listings.</h2>
            </div>
            <div className="communities-table-wrap">
              <table className="communities-table">
                <thead>
                  <tr>
                    <th>Community</th>
                    <th>Often fits</th>
                    <th>What to review with Matthew and Landon</th>
                  </tr>
                </thead>
                <tbody>
                  {towns.map((town) => (
                    <tr key={town.slug}>
                      <th scope="row"><a href={`/communities/${town.slug}`}>{town.name}</a></th>
                      <td>{town.bestFor}</td>
                      <td>{town.watch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="communities-lead" id="town-match" aria-labelledby="town-match-heading">
          <div className="section-inner communities-lead__grid">
            <div>
              <p className="section-eyebrow">Lead with fit, not guesswork</p>
              <h2 className="section-heading" id="town-match-heading">Get Your NorthSide Town Match.</h2>
              <p>
                Tell us what matters most — budget, commute, schools, trails, lake access, home style, timing, and what you are leaving behind. Matthew and Landon will help you narrow the communities that actually fit.
              </p>
              <ul className="communities-check-list">
                <li>Town shortlist based on lifestyle and market reality.</li>
                <li>Guidance on commute, schools, trails, lakes, and neighbourhood feel.</li>
                <li>Buyer or seller next steps from Finally Home Agents.</li>
              </ul>
            </div>
            <LeadForm
              slug="northside-town-match"
              title="NorthSide GTA Town Match"
              realmLink="https://northsidegta.ca/communities"
              ctaText="Get Your NorthSide Town Match"
              formHeader="Find your best-fit NorthSide GTA town"
              formSubheader="A simple, valuable next step for buyers comparing communities north of Toronto."
              trustLine="No generic drip campaign — just practical town guidance from Matthew and Landon."
              helperText="We will use your details to follow up about your NorthSide GTA community fit request."
            />
          </div>
        </section>

        <section className="communities-agents" aria-labelledby="agents-heading">
          <div className="section-inner section-inner--narrow communities-agents__grid">
            <figure className="communities-agents__photo">
              <img src={TEAM_IMAGE} alt={TEAM_IMAGE_ALT} width="1484" height="1060" loading="lazy" decoding="async" />
            </figure>
            <div>
              <p className="section-eyebrow">The team behind NorthSide GTA</p>
              <h2 className="section-heading" id="agents-heading">Finally Home Agents makes the move north feel clear.</h2>
              <p>
                Matthew and Landon connect the big-picture lifestyle decision to the details that matter in real estate: pricing, neighbourhoods, commute, schools, property type, preparation, negotiation, and long-term fit.
              </p>
              <div className="communities-agent-actions">
                <a href="https://wa.me/16476684646" className="btn btn--whatsapp">Talk With Finally Home Agents</a>
                <a href="tel:+16476684646" className="btn btn--outline-green">Matthew · 647-668-4646</a>
              </div>
            </div>
          </div>
        </section>

        <section className="communities-reviews" aria-labelledby="reviews-heading">
          <div className="section-inner">
            <div className="section-header section-header--center">
              <p className="section-eyebrow">Proof from clients</p>
              <h2 className="section-heading" id="reviews-heading">Guidance that helps people move with confidence.</h2>
            </div>
            <div className="communities-review-grid">
              <blockquote>
                <div aria-label="5 stars">★★★★★</div>
                <p>“Matt understood our priorities as a family and ensured that these priorities were held in high regard throughout the whole process.”</p>
                <cite>Larissa Halko · Buyer &amp; Seller</cite>
              </blockquote>
              <blockquote>
                <div aria-label="5 stars">★★★★★</div>
                <p>“Thanks to Matt we sold our home for much more than the market rate — higher than any comparable in the neighbourhood.”</p>
                <cite>Arron Breen · Buyer &amp; Seller</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="communities-faq" aria-labelledby="faq-heading">
          <div className="section-inner section-inner--faq">
            <div className="section-header section-header--center">
              <p className="section-eyebrow">Common questions</p>
              <h2 className="section-heading" id="faq-heading">NorthSide GTA communities FAQ</h2>
            </div>
            <dl className="faq__list">
              {faqs.map((faq) => (
                <div className="faq__item" key={faq.question}>
                  <dt className="faq__question">{faq.question}</dt>
                  <dd className="faq__answer">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="communities-final-cta" aria-labelledby="final-cta-heading">
          <div className="section-inner communities-final-cta__inner">
            <p className="section-eyebrow">Ready to compare towns?</p>
            <h2 id="final-cta-heading">Make your move north with a clearer plan.</h2>
            <p>Start with your NorthSide Town Match, then explore the community pages that fit your lifestyle, commute, and budget.</p>
            <div className="communities-final-cta__actions">
              <a className="btn btn--white-on-dark" href="#town-match">Get Your NorthSide Town Match</a>
              <a className="btn btn--ghost-on-dark" href="/contact">Talk With Finally Home Agents</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CommunitiesPage;
