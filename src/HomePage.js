import React from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import Footer from "./Footer";
import ReviewCarousel from "./components/reviews/ReviewCarousel";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";

const HOME_REVIEWS = CANONICAL_TESTIMONIALS.slice(0, 8);

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navigation />
      <Helmet>
        <title>NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers</title>
        <meta
          name="description"
          content="Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge &amp; Scugog."
        />
        <meta
          name="keywords"
          content="NorthSide GTA real estate, homes for sale North GTA, sell my home, Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, Scugog, Finally Home Agents"
        />
        <link rel="canonical" href="https://www.northsidegta.ca/" />

        {/* Open Graph */}
        <meta property="og:title" content="NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers" />
        <meta property="og:description" content="Local team helping you buy and sell in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge &amp; Scugog." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/" />
        <meta property="og:image" content="https://www.northsidegta.ca/Images/og-home.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NorthSide GTA | Real Estate Agents for Buyers &amp; Sellers" />
        <meta name="twitter:description" content="Find your perfect home or sell for more in the NorthSide GTA with expert agents." />
        <meta name="twitter:image" content="https://www.northsidegta.ca/Images/og-home.jpg" />

        {/* JSON-LD: Organization + Website */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: "Finally Home Agents",
            url: "https://www.northsidegta.ca/",
            areaServed: [
              "Georgina",
              "East Gwillimbury",
              "Newmarket",
              "Aurora",
              "Whitchurch-Stouffville",
              "Uxbridge",
              "Scugog",
            ],
            sameAs: [
              "https://instagram.com/finallyhomeagents",
              "https://facebook.com/finallyhomeagents",
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NorthSide GTA",
            url: "https://www.northsidegta.ca/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.northsidegta.ca/search?q={query}",
              "query-input": "required name=query",
            },
          })}
        </script>
      </Helmet>

      <main>
        <section className="nsg-hero-bg" style={{ padding: "72px 0" }}>
          <div className="mx-auto max-w-6xl px-4">
            <div className="home-hero__layout">
              <div className="home-hero__copy">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100">
                  Finally Home Agents
                </div>
                <h1>Find Your Next Home in the NorthSide GTA</h1>
                <p>Bigger lots, easier 404 access, and a community-first lifestyle.</p>
                <div className="home-hero__actions">
                  <a href="/contact" className="nsg-btn">Talk to an Agent</a>
                  <a href="/buyers" className="nsg-btn nsg-btn--ghost">Buyer’s Guide</a>
                </div>
                <p className="hero-subnote">
                  Aurora • Uxbridge • Georgina • Scugog • Stouffville • East Gwillimbury • Newmarket
                </p>
              </div>

            </div>
          </div>
        </section>

        <section className="home-section" id="home-towns">
          <div className="mx-auto max-w-6xl px-4">
            <div className="nsg-card nsg-card--surface">
              <div className="p-6 sm:p-8">
                <h2 className="home-section__heading">Compare NorthSide GTA towns side by side</h2>
                <TownStrip />
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="mx-auto max-w-6xl px-4">
            <div className="nsg-card nsg-card--surface" style={{ padding: 0 }}>
              <MapHero />
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="mx-auto max-w-5xl px-4">
            <ReviewCarousel
              reviews={HOME_REVIEWS}
              disclaimer="Real Google reviews from Finally Home Agents clients."
              route="/"
            />
          </div>
        </section>

        <section className="home-section">
          <div className="mx-auto max-w-4xl px-4">
            <div className="nsg-card home-cta-card">
              <h2>Ready to explore the NorthSide GTA?</h2>
              <p>
                Let Finally Home Agents build your short list of communities, price ranges, and on-market opportunities.
              </p>
              <div className="home-hero__actions" style={{ justifyContent: "center" }}>
                <a href="/contact" className="nsg-btn">Talk to an Agent</a>
                <a href="/homeanalysis" className="nsg-btn nsg-btn--ghost">Get Your Home Analysis</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
