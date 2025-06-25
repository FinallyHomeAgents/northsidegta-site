// src/AboutPage.js
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import { Globe, TrendingUp, Users, Quote } from "lucide-react";   //  npm i lucide-react

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* ───────── Navigation ───────── */}
      <Navigation />

      {/* ───────── Hero Banner ───────── */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src="/Images/hero-about.jpg"
          alt="NorthSide GTA scenic"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Meet the NorthSide Experts
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Knowledge&nbsp;&bull;&nbsp;Passion&nbsp;&bull;&nbsp;Community
            </p>
          </div>
        </div>
      </section>

      {/* ───────── What Makes Us Different ───────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Card icon={<Globe className="h-12 w-12 text-green-700" />} title="Local Specialists">
            We created the NorthSide GTA so your search feels focused, hyper-local, and
            community-driven.
          </Card>

          <Card icon={<TrendingUp className="h-12 w-12 text-green-700" />} title="Marketing That Sells">
            Staging, video, drone, and data-driven strategy turn listings into stand-out stories.
          </Card>

          <Card icon={<Users className="h-12 w-12 text-green-700" />} title="Relationship-First">
            Clients become friends — we golf together and stay in touch long after closing day.
          </Card>
        </div>
      </section>

      {/* ───────── Who We Are ───────── */}
      <section className="bg-gray-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Who&nbsp;We&nbsp;Are</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Profile
            img="/Images/matthew.jpg"
            name="Matthew Mulhall"
            blurb="Proud dad of twins Steven & Elena and multiple Top-Agent award winner.
                   Matthew combines competitive spirit with strategic marketing to make the
                   journey home a win."
          />

          <Profile
            img="/Images/landon.jpg"
            name="Landon Mulhall"
            blurb="Focused, creative, and community-minded. Landon ensures every detail is perfect,
                   guiding clients with calm confidence and deep local knowledge."
          />
        </div>
      </section>

      {/* ───────── Quote + CTA ───────── */}
      <section className="py-16 px-6">
        <div className="flex flex-col md:flex-row items-center bg-gray-100 py-10 px-6 md:px-12
                        rounded-2xl shadow-md max-w-4xl mx-auto">
          {/* Quote */}
          <div className="md:flex-1 text-center md:text-left mb-6 md:mb-0">
            <Quote className="h-10 w-10 text-green-600 mx-auto md:mx-0 mb-4" />
            <p className="text-xl italic text-gray-700">
              “Just like pro athletes rely on elite agents, we believe your real estate journey
              deserves the same loyalty, strategy, and winning mindset.”
            </p>
            <p className="mt-4 text-lg font-semibold text-gray-800">
              — Matthew &amp; Landon Mulhall
            </p>
          </div>

          {/* CTA */}
          <div className="md:ml-8 text-center">
            <Link
              to="/signwithus"
              className="inline-flex items-center bg-green-700 text-white px-6 py-3 rounded-full
                         shadow hover:bg-green-800 hover:-translate-y-1 transition transform duration-200"
            >
              Sign&nbsp;with&nbsp;Us
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                   d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <p className="mt-2 text-xs text-gray-500 leading-snug">
              Matthew &amp; Landon Mulhall, Sales Representatives<br />
              HomeLife Optimum Realty&nbsp;Inc., Brokerage
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
              We grew up on the ice, the field, and the golf course — hockey, soccer, baseball,
              and golf shaped our teamwork and drive. Today we channel that passion by running a
              Thursday Night Golf League across the NorthSide GTA and hosting our annual
              <strong> Finally Home Agents Golf Tournament</strong> for clients and friends.
            </p>
            <p className="text-gray-700">
              Just like pro athletes rely on elite agents, your real estate journey deserves
              the same loyalty, strategy, and winning mindset.
            </p>
          </div>

          <img
            src="/Images/golf-league.jpg"
            alt="NorthSide GTA Golf League"
            className="flex-1 rounded-lg shadow-md object-cover h-72 w-full md:max-w-sm"
          />
        </div>
      </section>

      {/* ───────── CTA Footer ───────── */}
      <section className="bg-green-700 text-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to make your move?</h2>
        <p className="text-lg mb-6">
          Let’s talk about your goals and create your NorthSide GTA success story.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-white text-green-700 font-semibold py-3 px-8 rounded-full
                     shadow hover:bg-gray-100 transition"
        >
          Contact Matthew &amp; Landon
        </Link>
      </section>
    </div>
  );
}

/* ——— Reusable small components ——— */
function Card({ icon, title, children }) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon}
      <h3 className="font-semibold text-xl mb-2 mt-3">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}

function Profile({ img, name, blurb }) {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={img}
        alt={name}
        className="h-40 w-40 rounded-full object-cover mb-6 shadow"
      />
      <h3 className="text-2xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 text-sm max-w-md">{blurb}</p>
    </div>
  );
}
