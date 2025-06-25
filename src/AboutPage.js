// src/AboutPage.js
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";      //  ← NEW: brings in your menu bar
import { Globe, TrendingUp, Users, Golf } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* ───────── Navigation (now shows on this page) ───────── */}
      <Navigation />

      {/* ───────── Hero Banner ───────── */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src="/Images/hero-about.jpg"
          alt="NorthSide GTA scenic"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Meet the NorthSide Experts
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto">
              Knowledge&nbsp;&bull;&nbsp;Passion&nbsp;&bull;&nbsp;Community
            </p>
          </div>
        </div>
      </section>

      {/* ───────── What Makes Us Different ───────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Makes Us Different
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Local Specialists */}
          <div className="flex flex-col items-center text-center">
            <Globe className="h-12 w-12 text-green-700 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Local Specialists</h3>
            <p className="text-gray-600">
              We defined the NorthSide GTA so your search feels focused and hyper-local.
            </p>
          </div>

          {/* Marketing Pros */}
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-12 w-12 text-green-700 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Marketing That Sells</h3>
            <p className="text-gray-600">
              Staging, video, drone, and data-driven strategy that turns listings into stand-out stories.
            </p>
          </div>

          {/* Relationship-First */}
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-green-700 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Relationship-First</h3>
            <p className="text-gray-600">
              Clients become friends — we play golf, share victories, and stay in touch long after closing.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Who We Are ───────── */}
      <section className="bg-gray-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Who We Are</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Matthew */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/Images/matthew.jpg"
              alt="Matthew Mulhall"
              className="h-40 w-40 rounded-full object-cover mb-6 shadow"
            />
            <h3 className="text-2xl font-semibold mb-2">Matthew Mulhall</h3>
            <p className="text-gray-600 text-sm max-w-md">
              Proud dad of twins Steven &amp; Elena and multiple Top Agent award
              winner. Matthew combines competitive spirit with strategic marketing
              to help families find “home.”
            </p>
          </div>

          {/* Landon */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/Images/landon.jpg"
              alt="Landon Mulhall"
              className="h-40 w-40 rounded-full object-cover mb-6 shadow"
            />
            <h3 className="text-2xl font-semibold mb-2">Landon Mulhall</h3>
            <p className="text-gray-600 text-sm max-w-md">
              Focused, creative, and community-minded. Landon ensures every detail
              is perfect, guiding clients with calm confidence and deep local
              knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Life Beyond Real Estate ───────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Life Beyond Real Estate</h2>
            <p className="text-gray-700 mb-4">
              We grew up on the ice, the field, and the golf course—hockey, soccer,
              baseball, and golf shaped our teamwork and drive. Today we channel
              that passion by running a Thursday Night Golf League across the
              NorthSide GTA and hosting our annual <strong>Finally Home Agents
              Golf Tournament</strong> for clients and friends.
            </p>
            <p className="text-gray-700">
              Just like pro athletes rely on elite agents, we believe your real
              estate journey deserves the same loyalty, strategy, and winning
              mindset.
            </p>
          </div>

          <img
            src="/Images/golf-league.jpg"
            alt="NorthSide GTA Golf League"
            className="flex-1 rounded-lg shadow-md object-cover h-72 w-full md:max-w-sm"
          />
        </div>
      </section>

      {/* ───────── CTA Footer Bar ───────── */}
      <section className="bg-green-700 text-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to make your move?</h2>
        <p className="text-lg mb-6">
          Let’s talk about your goals and create your NorthSide GTA success story.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-white text-green-700 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
        >
          Contact Matthew &amp; Landon
        </Link>
      </section>
    </div>
  );
}
