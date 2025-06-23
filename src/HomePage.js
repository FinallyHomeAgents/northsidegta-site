// src/HomePage.js
import React from "react";
import Navigation from "./Navigation";
import Hero from "./Hero";
import TownCards from "./TownCards"; // 👈 updated community grid
import Footer from "./Footer";

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

      {/* ─────────── Testimonial ─────────── */}
      <section className="py-16 px-4 text-center">
        <blockquote className="max-w-2xl mx-auto italic text-lg text-gray-600">
          “Moving north was the best decision we made. Matthew and the team
          made the entire process smooth and stress-free.”
        </blockquote>
        <p className="mt-4 text-gray-700 font-medium">
          — Recent Buyer, Uxbridge
        </p>
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
