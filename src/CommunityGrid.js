// src/CommunityGrid.js
import React from "react";

export default function CommunityGrid() {
  const towns = [
    "Stouffville",
    "Newmarket",
    "Aurora",
    "East Gwillimbury",
    "Uxbridge",
    "Georgina",
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">
        Explore Featured Communities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {towns.map((town) => (
          <div
            key={town}
            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">{town}</h3>
            <p className="text-sm text-gray-600">
              Learn why {town} is a top choice for buyers moving north of Toronto.
            </p>
            <button className="mt-4 text-green-700 font-semibold hover:underline">
              Explore {town}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
