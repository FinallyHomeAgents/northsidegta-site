// src/HomePage.js
import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import MapHero from "./MapHero";
import TownStrip from "./TownStrip";
import QuickContactCard from "./QuickContactCard";
import Footer from "./Footer";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";

/* ────────────────────────────────────────────────────────────
   Google-style rotating review slider (unchanged)
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
   “AS SEEN ON” pill — retro badge + IG/FB marks
   Positioned to feel attached to the hero image below
   ──────────────────────────────────────────────────────────── */
function SocialProofPill() {
  return (
    <div className="mx-auto max-w-6xl px-4 -mt-2 mb-1 relative z-20 flex justify-center">
      {/* The pill itself */}
      <div
        className="
          inline-flex items-center gap-2 rounded-full
          bg-green-700 text-white shadow-md
          px-4 py-2 text-xs md:text-sm
        "
        style={{ transform: "translateY(12px)" }} // nudges it closer to the hero image
      >
        {/* Retro “AS SEEN ON” like TV ads */}
        <span className="inline-flex items-center gap-1">
          <span className="font-black italic tracking-wide">AS SEEN ON</span>
        </span>

        {/* Brand marks */}
        <span className="inline-flex items-center gap-2 pl-1">
          <FaInstagram
            className="h-4 w-4 md:h-5 md:w-5"
            style={{ color: "#E1306C" }}
            aria-hidden="true"
            title="Instagram"
          />
          <FaFacebook
            className="h-4 w-4 md:h-5 md:w-5"
            style={{ color: "#1877F2" }}
            aria-hidden="true"
            title="Facebook"
          />
        </span>

        <span className="sr-only">Instagram and Facebook</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   WhatsApp Promo Bar — matches a “contact-page” style banner
   ──────────────────────────────────────────────────────────── */
const WHATSAPP_NUMBER_E164 = "16476684646";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER_E164}`;

function WhatsAppPromoBar() {
  const text =
    "Fastest way to connect. Real answers from Finally Home Agents in minutes.";
  const href = `${WHATSAPP_BASE}?text=${encodeURIComponent(
    "Hi! I’d like to chat about homes in the NorthSide GTA."
  )}`;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div
        className="
          w-full rounded-xl bg-green-600 text-white shadow
          px-4 md:px-6 py-3 md:py-4
          flex flex-col md:flex-row md:items-center md:justify-between gap-3
        "
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white/15 rounded-full p-2">
            <FaWhatsapp className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <div className="text-sm md:text-base font-semibold">
              Chat on WhatsApp — fastest reply
            </div>
            <div className="text-xs md:text-sm opacity-90">{text}</div>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center justify-center
            bg-white text-green-700 font-semibold
            px-4 py-2 rounded-lg hover:bg-gray-100 transition
          "
          title="Message us on WhatsApp"
        >
          Message us
        </a>
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

      {/* Map-first Hero */}
      <MapHero />

      {/* “As Seen On” pill:
          Placed right after the hero header; slight translateY to feel attached */}
      <SocialProofPill />

      {/* Quick contact (compact card) */}
      <section className="mx-auto max-w-6xl px-4 mt-6 md:mt-8">
        <QuickContactCard />
      </section>

      {/* WhatsApp bar (contact-page style) */}
      <section className="mt-4 md:mt-6">
        <WhatsAppPromoBar />
      </section>

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
