import React from "react";

export default function HomePage() {
  const towns = [
    "Stouffville",
    "Newmarket",
    "Aurora",
    "East Gwillimbury",
    "Uxbridge",
    "Georgina",
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-green-700 text-white py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          More Community. Less Traffic.
        </h1>
        <p className="text-xl md:text-2xl max-w-xl mx-auto">
          Discover life in the NorthSide GTA — where families thrive, space is affordable, and lifestyle meets nature.
        </p>
      </section>

      {/* Towns Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Featured Communities</h2>
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

      {/* Why Move North Section */}
      <section className="bg-gray-100 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Move North?</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-700">
          Enjoy more home for your money, quieter streets, top schools, and a close-knit community — all within commuting distance of Toronto.
        </p>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4 text-center">
        <blockquote className="max-w-2xl mx-auto italic text-lg text-gray-600">
          “Moving north was the best decision we made. Matthew and the team made the entire process smooth and stress-free.”
        </blockquote>
        <p className="mt-4 text-gray-700 font-medium">— Recent Buyer, Uxbridge</p>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Explore the NorthSide GTA?</h2>
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

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        © 2025 NorthSide GTA | Finally Home Agents
      </footer>
    </div>
  );
}
