import React from 'react';

const testimonials = [
  {
    quote:
      "Finally Home Agents helped us land our dream home in East Gwillimbury. No pressure — just honest advice and expert support.",
    name: 'Alicia & Darnell',
    location: 'East Gwillimbury',
  },
  {
    quote:
      "We moved up from Toronto and they made everything easy — from area advice to offer negotiation. Highly recommend.",
    name: 'Tariq & Steph',
    location: 'Uxbridge',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10">What Our Clients Are Saying</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="italic text-lg mb-4">“{t.quote}”</p>
            <p className="font-semibold">{t.name} — <span className="text-sm text-gray-500">{t.location}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}
