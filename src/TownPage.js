// src/TownPage.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import towns from "./towns.json";
import Navigation from "./Navigation";
import Footer from "./Footer";
import QuickContactCard from "./QuickContactCard";
import TownStrip from "./TownStrip";

const CATEGORY_LABELS = {
  housePrices: "House Prices",
  commuterAccess: "Commuter Access",
  localTraffic: "Local Traffic",
  golf: "Golf Courses",
  fishing: "Fishing",
  trailsNature: "Trails & Nature",
  restaurants: "Restaurants",
  localEvents: "Local Events",
};

const CATEGORY_ORDER = [
  "housePrices",
  "commuterAccess",
  "localTraffic",
  "golf",
  "fishing",
  "trailsNature",
  "restaurants",
  "localEvents",
];

function DotRow({ value = 0 }) {
  const v = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            i < v ? "bg-emerald-600" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function TownPage() {
  const params = useParams();
  const paramSlug = (params.slug || params["*"] || "").toLowerCase();

  const town =
    towns.find((t) => (t.slug || "").toLowerCase() === paramSlug) ||
    towns.find(
      (t) => `/${(t.slug || "").toLowerCase()}` === window.location.pathname.toLowerCase()
    );

  if (!town) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 px-4 py-16 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">Town not found</h1>
          <p className="text-gray-600 mb-6">
            The page you’re looking for doesn’t exist yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 transition"
          >
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    // ⬇️ Prevent any horizontal widening on mobile
    <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative isolate">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <div className="rounded-2xl border bg-white/70 shadow-sm overflow-hidden">
            <div className="relative">
              {/* Banner image (optional) */}
              {town.heroImage ? (
                <img
                  src={town.heroImage}
                  alt={`${town.name} banner`}
                  className="w-full h-56 md:h-72 object-cover"
                />
              ) : (
                <div className="w-full h-56 md:h-72 bg-gradient-to-br from-emerald-50 via-white to-emerald-50" />
              )}

              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <div className="inline-block rounded-xl bg-white/90 backdrop-blur px-4 py-2 shadow">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {town.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Summary + download + MATCH card */}
            <div className="p-5 md:p-6 space-y-4">
              {town.summary && (
                <p className="text-gray-700 text-base md:text-lg">
                  {town.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {town.pdf && (
                  <a
                    href={town.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    Download {town.name} Guide (PDF)
                  </a>
                )}
              </div>

              {/* Your NorthSide GTA Match — lives inside the hero box */}
              <div className="pt-2">
                <QuickContactCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page body */}
      <main className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT column: Highlights, Ratings, Commute */}
          <div className="lg:col-span-2 space-y-6">
            {/* Highlights */}
            {Array.isArray(town.highlights) && town.highlights.length > 0 && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-semibold mb-3">Why {town.name}</h2>
                <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-gray-800">
                  {town.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Ratings */}
            {town.ratings && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-semibold mb-3">Town Ratings</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CATEGORY_ORDER.filter((k) => town.ratings[k] != null).map((k) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-800">{CATEGORY_LABELS[k]}</span>
                      <DotRow value={town.ratings[k]} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Commute */}
            {town.commute && (
              <section className="rounded-2xl border bg-white/80 shadow-sm p-5 md:p-6">
                <h2 className="text-xl font-semibold mb-2">Commute</h2>
                <p className="text-gray-700">
                  Fastest route to <strong>404 &amp; Steeles</strong>:{" "}
                  <span className="font-semibold">
                    {town.commute.to404SteelesMinutes} minutes
                  </span>{" "}
                  (typical light-traffic estimate).
                </p>
              </section>
            )}

            {/* Town strip to navigate others */}
            {/* ⬇️ Hide any horizontal overflow from the card strip on mobile */}
            <section className="pt-2 overflow-x-hidden">
              <TownStrip />
            </section>
          </div>

          {/* RIGHT column intentionally empty now (card moved above) */}
          <aside className="space-y-6"></aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
