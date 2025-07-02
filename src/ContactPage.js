// src/ContactPage.js
import React, { useEffect, useState } from 'react';

import Navigation from './Navigation';
import Button     from './components/ui/Button';
import Card       from './components/ui/Card';

/* ── subtle dotted background ───────────────────────────── */
const PageBackground = () => (
  <style>{`
    body {
      background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0) 1px);
      background-size: 12px 12px;
    }
  `}</style>
);

/* ── Google-styled auto-rotating review slider ──────────── */
function ReviewSlider() {
  const reviews = [
    { name: 'Susan Booth',       quote: '“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”' },
    { name: 'Logan Abernethy',   quote: '“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”' },
    { name: 'Jessica Le',        quote: '“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”' },
    { name: 'Tessa Conway',      quote: '“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”' },
    { name: 'Olivia Oprea',      quote: '“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”' },
    { name: 'Arron Breen',       quote: '“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”' },
  ];

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [reviews.length]);

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50 overflow-hidden">
      <div className="bg-[#4285F4] h-1" />
      <div className="relative px-4 sm:px-8 py-6 min-h-[180px] sm:min-h-[150px]">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center
                        transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          >
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
            <p className="text-[10px] sm:text-xs text-gray-500">Verified Client Review</p>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ────────────────────────────────────────────────────────── */

export default function ContactPage() {
  return (
    <>
      <PageBackground />
      <Navigation />

      <div className="space-y-14 sm:space-y-16 px-4 md:px-20 py-8 sm:py-12">

        {/* ── HERO ───────────────────────────────────────── */}
        <section className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Let’s Talk About Your Next Move.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Questions about buying, selling, or life in the NorthSide&nbsp;GTA?
            Drop us a note — no pressure, just real advice.
          </p>
          <p className="flex justify-center">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              💬 We reply within 1&nbsp;hour&nbsp;(9&nbsp;am – 9&nbsp;pm)
            </span>
          </p>
        </section>

        {/* ── 1. Google Review Card (moved up) ─────────── */}
        <section className="max-w-3xl mx-auto">
          <ReviewSlider />
        </section>

        {/* ── 2. Athlete–Agent Analogy Card ────────────── */}
        <section className="max-w-3xl mx-auto">
          <Card className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 text-center sm:text-left">
            <svg viewBox="0 0 576 512" className="w-12 h-12 text-[#FFD700] flex-shrink-0" aria-hidden="true">
              <path fill="currentColor" d="M552 64H448V40c0-22-18-40-40-40H168c-22 0-40 18-40 40v24H24C10.7 64 0 74.7 0 88v56c0 66.2 50.8 122.1 116 126.9 19.9 55.5 70.5 95.1 132 100.5V400H168c-22.1 0-40 17.9-40 40v24h320v-24c0-22.1-17.9-40-40-40H328v-28.6c61.5-5.3 112.1-45 132-100.5C525.2 266.1 576 210.2 576 144V88c0-13.3-10.7-24-24-24z"/>
            </svg>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold">Every Pro Has an Agent — You Should&nbsp;Too.</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                At <strong>Finally Home Agents</strong> we don’t just sell homes — we build partnerships. Like a top sports
                agent, we negotiate, strategize, and stay in your corner for every move.
              </p>
            </div>
          </Card>
        </section>

        {/* ── 3. FORM + CONTACT CARD ───────────────────── */}
        <section className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">

          {/* Contact form */}
          <form name="contact" method="POST" data-netlify="true" className="space-y-4 w-full">
            <input type="hidden" name="form-name" value="contact" />
            <input name="name"  placeholder="Full Name"  className="w-full border rounded-md px-4 py-3" required />
            <input name="email" type="email" placeholder="Email" className="w-full border rounded-md px-4 py-3" required />
            <input name="phone" placeholder="Phone (optional)" className="w-full border rounded-md px-4 py-3" />
            <textarea name="message" rows="4" placeholder="Your Message" className="w-full border rounded-md px-4 py-3" required />
            <Button size="lg" type="submit" className="w-full sm:w-auto">Send Message</Button>
          </form>

          {/* Contact card */}
          <Card className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-semibold">Contact Info</h2>
              <p className="text-base">📞 <a href="tel:16476684646" className="hover:underline">(647) 668-4646</a></p>
              <p className="text-base">📧 <a href="mailto:contact@finallyhomeagents.com" className="hover:underline">contact@finallyhomeagents.com</a></p>
              <p className="text-base">📍 <span className="font-medium">NorthSide GTA</span> — <span className="italic">More Community, Less Traffic</span></p>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋" target="_blank" rel="noreferrer"
               className="relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4
                          bg-gradient-to-r from-[#25D366] via-[#20bf5e] to-[#128C7E]
                          text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition">
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-yellow-400 text-white text-[10px] sm:text-xs font-bold px-1.5 py-[1px] rounded-full shadow animate-bounce">
                ✨ Chat
              </span>
              <svg viewBox="0 0 448 512" className="w-4 h-4 sm:w-6 sm:h-6 fill-current">
                <path d="M380.9 97.1C339 55.3 282.1 32 224.1 32 100.3 32 0 132.3 0 256c0 45 11.7 89 34 128.1L0 480l99.9-32.6C137.9 466.3 181 480 224.1 480c123.7 0 224.1-100.3 224.1-224.1 0-58-23.2-114.9-68.3-158.8z" />
              </svg>
              <span className="text-sm sm:text-lg font-semibold">WhatsApp</span>
            </a>

            {/* Socials */}
            <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
              Follow Finally Home Agents
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://instagram.com/finallyhomeagents" target="_blank" rel="noreferrer"
                 className="flex items-center gap-1 px-3 py-1.5 rounded-lg shadow
                            bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
                            text-white text-xs sm:text-sm hover:shadow-lg hover:scale-105 transition">IG</a>
              <a href="https://facebook.com/finallyhomeagents" target="_blank" rel="noreferrer"
                 className="flex items-center gap-1 px-3 py-1.5 rounded-lg shadow
                            bg-[#1877F2] text-white text-xs sm:text-sm hover:bg-[#0f6ae0]
                            hover:shadow-lg hover:scale-105 transition">FB</a>
            </div>

            <Button as="a" href="https://calendly.com/yourlink" variant="outline" size="lg" className="w-full sm:w-auto">
              Book a Call
            </Button>
          </Card>
        </section>

        {/* MAP */}
        <section className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Where We Work</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base">
            Proudly serving Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket, Scugog and beyond.
          </p>
          <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">[ Map Placeholder ]</span>
          </div>
        </section>

        {/* TRUST LOGOS */}
        <section className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
          <img src="/Images/brokerage.png" alt="HomeLife Optimum Realty" className="h-8 sm:h-10 opacity-80" />
          <img src="/Images/reco.png" alt="Registered with RECO" className="h-8 sm:h-10 opacity-80" />
          <img src="/Images/treb.png" alt="Member: TRREB" className="h-8 sm:h-10 opacity-80" />
        </section>

        {/* CTA CARDS */}
        <section className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: 'Buyers', text: 'See how we help buyers' },
            { title: 'Sellers', text: 'Stand-out listing strategy' },
            { title: 'VIP',     text: 'Early access & perks' },
          ].map((c) => (
            <Card key={c.title} className="text-center space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold">{c.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{c.text}</p>
              <Button variant="outline" size="sm" className="sm:size-base">Learn More</Button>
            </Card>
          ))}
        </section>
      </div>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
        target="_blank" rel="noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16
                   rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E]
                   flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 448 512" className="w-6 h-6 sm:w-8 sm:h-8 fill-white">
          <path d="M380.9 97.1C339 55.3 282.1 32 224.1 32 100.3 32 0 132.3 0 256c0 45 11.7 89 34 128.1L0 480l99.9-32.6C137.9 466.3 181 480 224.1 480c123.7 0 224.1-100.3 224.1-224.1 0-58-23.2-114.9-68.3-158.8z"/>
        </svg>
      </a>
    </>
  );
}
