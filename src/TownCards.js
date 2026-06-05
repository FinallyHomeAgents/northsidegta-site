// src/TownCards.js
import React from "react";

/*  Uses existing NorthSide GTA town logo assets in public/assets/town-logos/.  */
const towns = [
  { name: "Georgina",         image: "georgina.webp" },
  { name: "Uxbridge",         image: "uxbridge.webp" },
  { name: "East Gwillimbury", image: "east-gwillimbury.webp" },
  { name: "Newmarket",        image: "newmarket.webp" },
  { name: "Stouffville",      image: "stouffville.webp" },
  { name: "Aurora",           image: "aurora.webp" },
  { name: "Scugog",           image: "scugog.webp" },
];

export default function TownCards() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">
        Explore Featured Communities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {towns.map(({ name, image }) => (
          <div
            key={name}
            className="overflow-hidden rounded-xl shadow hover:shadow-lg transition"
          >
            {/* Perfect square image wrapper */}
            <div className="aspect-square">
              <img
                src={`/assets/town-logos/${image}`}
                alt={name}
                className="w-full h-full object-contain object-center p-6"
              />
            </div>

            {/* Text under each photo */}
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
