// src/CommunityGrid.js
import React from "react";

// 🏙️ 7 towns array (now includes Scugog)
const towns = [
  { name: "Stouffville",      img: "/assets/town-logos/stouffville.webp" },
  { name: "Newmarket",        img: "/assets/town-logos/newmarket.webp" },
  { name: "Aurora",           img: "/assets/town-logos/aurora.webp" },
  { name: "East Gwillimbury", img: "/assets/town-logos/east-gwillimbury.webp" },
  { name: "Uxbridge",         img: "/assets/town-logos/uxbridge.webp" },
  { name: "Georgina",         img: "/assets/town-logos/georgina.webp" },
  { name: "Scugog",           img: "/assets/town-logos/scugog.webp" },   // ← NEW card
];

export default function CommunityGrid() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Section title */}
      <h2 className="text-3xl font-bold text-center mb-12">
        Explore Featured Communities
      </h2>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {towns.map(({ name, img }) => (
          <div
            key={name}
            className="overflow-hidden rounded-xl shadow hover:shadow-lg transition"
          >
            {/* Town photo */}
            <img
              src={img}
              alt={name}
              className="h-48 w-full object-contain object-center bg-white p-6"
            />

            {/* Text under photo */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">{name}</h3>
              <p className="text-sm text-gray-600">
                Learn why {name} is a top choice for buyers moving north of Toronto.
              </p>
              <button className="mt-4 font-semibold text-brand-green hover:underline">
                Explore {name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
