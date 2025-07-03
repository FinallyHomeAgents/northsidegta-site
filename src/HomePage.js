// src/HomePage.js
import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import Hero from "./Hero";
import TownCards from "./TownCards";
import Footer from "./Footer";

/* ─── Google-style rotating review slider (same as Contact page) ─── */
function ReviewSlider() {
  const reviews = [
    { name: "Susan Booth",   quote: "“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”" },
    { name: "Logan Abernethy", quote: "“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”" },
    { name: "Jessica Le",    quote: "“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”" },
    { name: "Tessa Conway",  quote: "“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”" },
    { name: "Olivia Oprea",  quote: "“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”" },
    { name: "Arron Breen",   quote: "“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”" },
  ];

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-[#4285F4] h-1" />
      <div className="relative px-4 sm:px-8 py-6 min-h-[180px] sm:min-h-[150px]">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center
                        transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <img src="/Images/google-logo.png" alt="Google" className="h-5 w-5 sm:h-6 sm:w-6 object-contain" />
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

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900">
      {/* ─────────── Navigation ─────────── */}
      <Navigation />

      {/* ─────────── Hero Section ─────────── */}
      <Hero />

      {/* ─────────── Intro Message ─────────── */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          More Community. Less Traffic.
        </h1>
        <p className="text-xl md:text-2xl max-w-xl mx-auto">
          Discover life in the NorthSide GTA — where families thrive, space is
          affordable, and lifestyle meets nature.
        </p>
      </section>

      {/* ─────────── Featured Town Cards ─────────── */}
      <TownCards />

      {/* ─────────── Why Move North ─────────── */}
      <section className="bg-gray-100 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Move North?</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-700">
          Enjoy more home for your money, quieter streets, top schools, and a
          close-knit community — all within commuting distance of Toronto.
        </p>
      </section>

      {/* ─────────── Google Review Slider (replaces old quote) ─────────── */}
      <section className="py-16 px-4 text-center">
        <ReviewSlider />
      </section>

      {/* ─────────── CTA Section ─────────── */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Explore the NorthSide GTA?
        </h2>
        <p className="text-lg mb-6">
          Let us help you find your perfect town and home.
        </p>
        <a
          href="/homeanalysis"
          className="bg-white text-green-700 font-semibold py-2 px-6 rounded hover:bg-gray-200 transition"
        >
          Get Your Home Analysis
        </a>
      </section>

      {/* ─────────── Footer ─────────── */}
      <Footer />
    </div>
  );
}
