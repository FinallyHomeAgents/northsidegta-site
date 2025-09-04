// src/HomePage.js
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import QuickContactCard from "./QuickContactCard";
import Footer from "./Footer";

/* ────────────────────────────────────────────────────────────
   Google-style rotating review slider
   ──────────────────────────────────────────────────────────── */
function ReviewSlider() {
  const reviews = [
    {
      name: "Susan Booth",
      quote:
        "“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”",
    },
    {
      name: "Logan Abernethy",
      quote:
        "“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”",
    },
    {
      name: "Jessica Le",
      quote:
        "“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”",
    },
    {
      name: "Tessa Conway",
      quote:
        "“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”",
    },
    {
      name: "Olivia Oprea",
      quote:
        "“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”",
    },
    {
      name: "Arron Breen",
      quote:
        "“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”",
    },
  ];

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-[#4285F4] h-1" />
      <div className="relative px-4 sm:px-8 py-6 min-h-[180px] sm:min-h-[150px]">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <img
                src="/Images/google-logo.png"
                alt="Google"
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              />
              <span className="font-semibold text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                Finally&nbsp;Home&nbsp;Agents
              </span>
              <div className="flex text-[#FBBC05] text-xs sm:text-sm leading-none">
                {"★★★★★".split("").map((_, s) => (
                  <span key={s}>★</span>
                ))}
              </div>
            </div>
            <p className="italic max-w-xs sm:max-w-md text-xs sm:text-sm">{r.quote}</p>
            <p className="mt-1 sm:mt-2 font-semibold text-xs sm:text-sm">— {r.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Verified&nbsp;Client&nbsp;Review</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Navigation */}
      <Navigation />
<Helmet>
  <title>NorthSide GTA | Real Estate Agents for Buyers & Sellers</title>
  <meta
    name="description"
    content="Find your perfect home or sell for more in the NorthSide GTA. Local experts serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog."
  />
  <meta
    name="keywords"
    content="NorthSide GTA real estate, homes for sale North GTA, sell my home, Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, Scugog, Finally Home Agents"
  />
  <link rel="canonical" href="https://www.northsidegta.ca/" />

  {/* Open Graph */}
  <meta property="og:title" content="NorthSide GTA | Real Estate Agents for Buyers & Sellers" />
  <meta property="og:description" content="Local team helping you buy and sell in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge & Scugog." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.northsidegta.ca/" />
  <meta property="og:image" content="/Images/og-home.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="NorthSide GTA Map showing towns: Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog" />

  {/* JSON-LD: Organization + Website */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "Finally Home Agents",
      url: "https://www.northsidegta.ca/",
      areaServed: [
        "Georgina","East Gwillimbury","Newmarket","Aurora","Whitchurch-Stouffville","Uxbridge","Scugog"
      ],
      sameAs: [
        "https://instagram.com/finallyhomeagents",
        "https://facebook.com/finallyhomeagents"
      ]
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
        "query-input": "required name=query"
      }
    })}
  </script>
</Helmet>
      {/* Map-first Hero */}
      <MapHero />

  

      {/* Town Strip */}
      <section className="mx-auto max-w-6xl px-4 mt-6 md:mt-8">
        <TownStrip />
      </section>

      {/* Google Review Slider */}
      <section className="py-16 px-4 text-center">
        <ReviewSlider />
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Ready to Explore the NorthSide GTA?
        </h2>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-6">
          Let us help you find your perfect town and home.
        </p>
        <a
          href="/homeanalysis"
          className="inline-block bg-white text-green-700 font-semibold py-2 px-6 rounded hover:bg-gray-200 transition"
        >
          Get Your Home Analysis
        </a>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
