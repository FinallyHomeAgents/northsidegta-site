// src/BuyersPage.js
import React from 'react';

/* --- shared site components --- */
import Navigation   from './Navigation';          // top menu bar
import Button       from './components/ui/Button';
import Card         from './components/ui/Card';
import TownCards    from './TownCards';
import Testimonials from './components/Testimonials';

export default function BuyersPage() {
  return (
    <>
      {/* Top navigation (menu) */}
      <Navigation />

      {/* Buyers-only content */}
      <div className="space-y-12 px-4 md:px-20 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Your Next Home Starts Here.</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Buying in the NorthSide GTA doesn’t need to be confusing or overwhelming. Let us guide you through it — step by step, with confidence.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
            <Button size="lg">Start Your Search</Button>
            <Button variant="outline" size="lg">Book a Discovery Call</Button>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <ul className="space-y-3 text-lg">
            <li>✅ Specialists in the NorthSide GTA</li>
            <li>✅ Transparent &amp; Pressure-Free Guidance</li>
            <li>✅ Personalized Area Match Support</li>
            <li>✅ Trusted Buyer Process</li>
            <li>✅ Negotiation That Works in Your Favour</li>
          </ul>
          <p className="text-muted-foreground text-lg">
            We’re not just here to open doors. We’re here to listen, strategize, and help you find the right home — in the right community — at the right price.
          </p>
        </section>

        {/* Explore the NorthSide GTA */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-semibold">Not Sure Where to Start? That’s What We’re Here For.</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            From waterfront living in Georgina to trailside homes in Uxbridge, we’ll help you explore all the possibilities — and land somewhere that truly fits.
          </p>
          <TownCards />
        </section>

        {/* Buying Process */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">How We Help You Buy With Confidence</h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            {["Discovery Call", "Pre-Approval", "Explore & Tour", "Make an Offer", "Close & Celebrate"]
              .map((step, i) => (
              <Card key={i}>
                <div className="py-6 text-lg font-medium">{step}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Buyer Tools */}
        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-semibold">Smart Tools for Smart Buyers</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              "Buyer Checklist",
              "RECO Guide",
              "Mortgage Calculator",
              "Compare Towns (Coming Soon)"
            ].map((tool, i) => (
              <Card key={i}>
                <div className="py-6 text-lg font-medium">{tool}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">What Our Clients Are Saying</h2>
          <Testimonials />
        </section>

        {/* Final CTA */}
        <section className="bg-green-700 text-white text-center py-12 px-6 rounded-2xl shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Search? Let’s Talk.</h2>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Whether you're buying in 30 days or 300 — we're here to help you plan the right move.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-green-700 hover:bg-muted">
              Reach Out to Finally Home Agents
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white">
              Book a Consultation Call
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
