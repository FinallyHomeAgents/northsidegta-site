// src/BuyersPage.js
import React, { useEffect, useState } from 'react';
import { Link }            from 'react-router-dom';

/* shared site components */
import Navigation   from './Navigation';
import Button       from './components/ui/Button';
import Card         from './components/ui/Card';
import TownCards    from './TownCards';

/* ───────── Google-style review slider (copied from Contact page) ───────── */
function ReviewSlider() {
  const reviews = [
    { name:'Susan Booth',   quote:'“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”' },
    { name:'Logan Abernethy', quote:'“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”' },
    { name:'Jessica Le',    quote:'“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”' },
    { name:'Tessa Conway',  quote:'“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”' },
    { name:'Olivia Oprea',  quote:'“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”' },
    { name:'Arron Breen',   quote:'“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”' },
  ];

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50 overflow-hidden">
      <div className="bg-[#4285F4] h-1" />
      <div className="relative px-4 sm:px-8 py-6 min-h-[180px] sm:min-h-[150px]">
        {reviews.map((r, idx) => (
          <div key={idx}
               className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}>
            {/* Google branding row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <img src="/Images/google-logo.png" alt="Google" className="h-5 w-5 sm:h-6 sm:w-6 object-contain" />
              <span className="font-semibold text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                Finally&nbsp;Home&nbsp;Agents
              </span>
              <div className="flex text-[#FBBC05] text-xs sm:text-sm leading-none">
                {'★★★★★'.split('').map((_, s) => <span key={s}>★</span>)}
              </div>
            </div>
            <p className="italic max-w-xs sm:max-w-md text-xs sm:text-sm">{r.quote}</p>
            <p className="mt-1 sm:mt-2 font-semibold text-xs sm:text-sm">— {r.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Verified&nbsp;Client&nbsp;Review</p>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ────────────────────────────────────────────────────────────────────────── */

export default function BuyersPage() {
  return (
    <>
      <Navigation />

      <div className="space-y-12 px-4 md:px-20 py-12">

        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Your Next Home Starts Here.</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Buying in the NorthSide GTA doesn’t need to be confusing or overwhelming.
            Let us guide you through it — step by step, with confidence.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
            <Button size="lg">Start Your Search</Button>
            <Button variant="outline" size="lg" as={Link} to="/contact">
              Book a Discovery Call
            </Button>
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
            We’re not just here to open doors. We’re here to listen, strategize,
            and help you find the right home — in the right community — at the right price.
          </p>
        </section>

        {/* Explore Communities */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-semibold">Not Sure Where to Start? That’s What We’re Here For.</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            From waterfront living in Georgina to trailside homes in Uxbridge, we’ll help you explore all the
            possibilities — and land somewhere that truly fits.
          </p>
          <TownCards />
        </section>

        {/* Buying Process */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">How We Help You Buy With Confidence</h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            {['Discovery Call','Pre-Approval','Explore & Tour','Make an Offer','Close & Celebrate'].map((s,i)=>(
              <Card key={i}><div className="py-6 text-lg font-medium">{s}</div></Card>
            ))}
          </div>
        </section>

        {/* Buyer Tools */}
        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-semibold">Smart Tools for Smart Buyers</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['Buyer Checklist','RECO Guide','Mortgage Calculator','Compare Towns (Coming Soon)'].map((tool,i)=>(
              <Card key={i}><div className="py-6 text-lg font-medium">{tool}</div></Card>
            ))}
          </div>
        </section>

        {/* Google Review Slider (replaces old Testimonial block) */}
        <section className="py-12">
          <h2 className="text-3xl font-semibold text-center mb-8">What Our Clients Are Saying</h2>
          <div className="max-w-3xl mx-auto">
            <ReviewSlider />
          </div>
        </section>

        {/* Final CTA – single button to /contact */}
        <section className="bg-green-700 text-white text-center py-12 px-6 rounded-2xl shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Search? Let’s Talk.</h2>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Whether you're buying in 30 days or 300 — we're here to help you plan the right move.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-gray-100"
            as={Link}
            to="/contact"
          >
            Reach Out to Finally Home Agents
          </Button>
        </section>
      </div>
    </>
  );
}
