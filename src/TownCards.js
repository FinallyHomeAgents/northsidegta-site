// src/TownCards.js
import React from "react";

const towns = [
  {
    name: "Stouffville",
    image: "/Images/towns/stouffville.jpg",
    description: "Small-town charm close to the city.",
  },
  {
    name: "Newmarket",
    image: "/Images/towns/newmarket.jpg",
    description: "A vibrant mix of history and growth.",
  },
  {
    name: "Aurora",
    image: "/Images/towns/aurora.jpg",
    description: "Elegant homes and family-friendly living.",
  },
  {
    name: "East Gwillimbury",
    image: "/Images/towns/eastgwillimbury.jpg",
    description: "Spacious lots, peaceful surroundings.",
  },
  {
    name: "Uxbridge",
    image: "/Images/towns/uxbridge.jpg",
    description: "Trails, nature, and community spirit.",
  },
  {
    name: "Georgina",
    image: "/Images/towns/georgina.jpg",
    description: "Lake Simcoe living and outdoor adventure.",
  },
];

export default function TownCards() {
  return (
    <section className="bg-white py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">
        Featured Towns
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {towns.map((town) => (
          <div
            key={town.name}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={town.image}
              alt={town.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                {town.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{town.description}</p>
              <button className="text-green-700 font-semibold hover:underline">
                Explore {town.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
