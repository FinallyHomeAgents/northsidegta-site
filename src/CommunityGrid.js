// src/CommunityGrid.js
import React from "react";

// 🏙️ 7 towns array (now includes Scugog)
const towns = [
  { name: "Stouffville",      img: "/Images/towns/stouffville.jpg" },
  { name: "Newmarket",        img: "/Images/towns/newmarket.jpg" },
  { name: "Aurora",           img: "/Images/towns/aurora.jpg" },
  { name: "East Gwillimbury", img: "/Images/towns/eastgwillimbury.jpg" },
  { name: "Uxbridge",         img: "/Images/towns/uxbridge.jpg" },
  { name: "Georgina",         img: "/Images/towns/georgina.jpg" },
  { name: "Scugog",           img: "/Images/towns/scugog.jpg" },   // ← NEW card
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
              className="h-48 w-full object-cover object-center"
            />

            {/* Text under photo */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">{name}</h3>
              <p className="text-sm text-gray-600">
                Learn why {name} is a top choice for buyers moving north of Toronto.
              </p>
              <button className="mt-4 text-green-700 font-semibold hover:underline">
                Explore {name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
