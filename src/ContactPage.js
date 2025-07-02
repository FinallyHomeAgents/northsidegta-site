// src/ContactPage.js
import React, { useEffect, useState } from 'react';

import Navigation from './Navigation';
import Button     from './components/ui/Button';
import Card       from './components/ui/Card';

/* ─────────────────────────────────────────────────────────── */
/* Google-styled, auto-rotating review slider                  */
function ReviewSlider() {
  const reviews = [
    {
      name: 'Susan Booth',
      quote:
        '“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”',
    },
    {
      name: 'Logan Abernethy',
      quote:
        '“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”',
    },
    {
      name: 'Jessica Le',
      quote:
        '“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”',
    },
    {
      name: 'Tessa Conway',
      quote:
        '“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”',
    },
    {
      name: 'Olivia Oprea',
      quote:
        '“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”',
    },
    {
      name: 'Arron Breen',
      quote:
        '“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”',
    },
  ];

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[160px] sm:h-[135px] overflow-hidden">
      {reviews.map((r, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center
                      transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Google logo, brand, stars */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <img src="/Images/google-logo.png" alt="Google" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-sm text-gray-700">
              Finally&nbsp;Home&nbsp;Agents
            </span>
            <div className="flex text-[#FBBC05] text-sm leading-none">
              {'★★★★★'.split('').map((_, s) => (
                <span key={s}>★</span>
              ))}
            </div>
          </div>

          <p className="italic max-w-xl">{r.quote}</p>
          <p className="mt-2 font-semibold">— {r.name}</p>
          <p className="text-xs text-gray-500">Verified&nbsp;Client&nbsp;Review</p>
        </div>
      ))}
    </div>
  );
}
/* ─────────────────────────────────────────────────────────── */

export default function ContactPage() {
  return (
    <>
      <Navigation />

      <div className="space-y-16 px-4 md:px-20 py-12">

        {/* ── HERO ───────────────────────────────────────── */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Let’s Talk About Your Next Move.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Questions about buying, selling, or life in the NorthSide&nbsp;GTA?
            Drop us a note — no pressure, just real advice.
          </p>
          <p className="flex justify-center mt-2">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">
              💬 We reply within 1&nbsp;hour&nbsp;(9&nbsp;am – 9&nbsp;pm)
            </span>
          </p>
        </section>

        {/* ── GOOGLE REVIEW CARD ───────────────────────── */}
        <section className="max-w-3xl mx-auto">
          <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50">
            <div className="bg-[#4285F4] h-1 rounded-t-xl" />
            <ReviewSlider />
          </div>
        </section>

        {/* ── FORM + CONTACT CARD ─────────────────────── */}
        <section className="grid md:grid-cols-2 gap-12 items-start">

          {/* Netlify form */}
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            className="space-y-4 w-full"
          >
            <input type="hidden" name="form-name" value="contact" />
            <input name="name"  placeholder="Full Name"  className="w-full border rounded-md px-4 py-3" required />
            <input name="email" type="email" placeholder="Email" className="w-full border rounded-md px-4 py-3" required />
            <input name="phone" placeholder="Phone (optional)" className="w-full border rounded-md px-4 py-3" />
            <select name="subject" className="w-full border rounded-md px-4 py-3">
              <option>What can we help you with?</option>
              <option>Buying a home</option>
              <option>Selling a home</option>
              <option>VIP Client Program</option>
              <option>Something else</option>
            </select>
            <textarea name="message" rows="5" placeholder="Your Message" className="w-full border rounded-md px-4 py-3" required />
            <Button size="lg" type="submit">Send Message</Button>
          </form>

          {/* CONTACT CARD */}
          <Card className="space-y-6">
            {/* details */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Contact Info</h2>
              <p className="text-lg">
                📞 <a href="tel:16476684646" className="hover:underline">(647)&nbsp;668-4646</a>
              </p>
              <p className="text-lg">
                📧 <a href="mailto:contact@finallyhomeagents.com" className="hover:underline">
                  contact@finallyhomeagents.com
                </a>
              </p>
              <p className="text-lg">
                📍 <span className="font-medium">NorthSide GTA</span> — <span className="italic">More Community, Less Traffic</span>
              </p>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
              target="_blank"
              rel="noreferrer"
              className="
                relative flex items-center justify-center gap-3
                bg-gradient-to-r from-[#25D366] via-[#20bf5e] to-[#128C7E]
                text-white px-6 py-4 rounded-2xl shadow-xl
                hover:shadow-2xl hover:scale-[1.04] transition
              "
            >
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow animate-bounce">
                ✨ Instant Chat
              </span>
              <svg viewBox="0 0 448 512" className="w-6 h-6 fill-current">
                <path d="M380.9 97.1C339 55.3 282.1 32 224.1 32 100.3 32 0 132.3 0 256c0 45 11.7 89 34 128.1L0 480l99.9-32.6C137.9 466.3 181 480 224.1 480c123.7 0 224.1-100.3 224.1-224.1 0-58-23.2-114.9-68.3-158.8z" />
              </svg>
              <span className="text-lg font-semibold">Chat on WhatsApp</span>
            </a>

            {/* social label */}
            <p className="text-center text-sm font-medium text-muted-foreground">
              Follow Finally Home Agents
            </p>

            {/* small social buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
              {/* Instagram */}
              <a
                href="https://instagram.com/finallyhomeagents"
                target="_blank"
                rel="noreferrer"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow
                  bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
                  text-white text-sm hover:shadow-lg hover:scale-105 transition
                "
              >
                <svg viewBox="0 0 448 512" className="w-4 h-4 fill-current">
                  <path d="M224 141a83 83 0 1 0 83 83 83 83 0 0 0-83-83Zm124-21a19 19 0 1 0 19 19 19 19 0 0 0-19-19Zm76 19c-1-54-9-102-55-148S338 0 284 0H164C110 0 62 8 16 54S0 174 0 228v120c0 54 8 102 54 148s94 54 148 54h120c54 0 102-8 148-54s54-94 54-148V228Zm-48 120c0 41-6 69-18 88a96 96 0 0 1-34 34c-19 12-47 18-88 18H164c-41 0-69-6-88-18a96 96 0 0 1-34-34c-12-19-18-47-18-88V228c0-41 6-69 18-88a96 96 0 0 1 34-34c19-12 47-18 88-18h120c41 0 69 6 88 18a96 96 0 0 1 34 34c12 19 18 47 18 88Z" />
                </svg>
                Instagram
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/finallyhomeagents"
                target="_blank"
                rel="noreferrer"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow
                  bg-[#1877F2] text-white text-sm hover:bg-[#0f6ae0]
                  hover:shadow-lg hover:scale-105 transition
                "
              >
                <svg viewBox="0 0 320 512" className="w-4 h-4 fill-current">
                  <path d="M279 288l14-92h-88v-60c0-25 12-50 52-50h40V6s-38-6-75-6c-73 0-121 44-121 124v70H79v92h82v224h100V288z" />
                </svg>
                Facebook
              </a>
            </div>

            {/* Calendly */}
            <Button
              as="a"
              href="https://calendly.com/yourlink"
              variant="outline"
              size="lg"
            >
              Book a Call
            </Button>
          </Card>
        </section>

        {/* ── MAP PLACEHOLDER ───────────────── */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-semibold">Where We Work</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Proudly serving Uxbridge, Georgina, Stouffville, East Gwillimbury, Newmarket,
            Scugog and beyond.
          </p>
          <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">[ Map Placeholder ]</span>
          </div>
        </section>

        {/* ── TRUST LOGOS ───────────────────── */}
        <section className="flex flex-wrap justify-center gap-6 mt-8">
          <img src="/Images/brokerage.png" alt="HomeLife Optimum Realty" className="h-10 w-auto opacity-80" />
          <img src="/Images/reco.png"      alt="Registered with RECO"    className="h-10 w-auto opacity-80" />
          <img src="/Images/treb.png"      alt="Member: TRREB"           className="h-10 w-auto opacity-80" />
        </section>

        {/* ── QUICK CTA CARDS ──────────────── */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Buyers', text: 'Learn how we help buyers succeed' },
            { title: 'Sellers', text: 'See what makes our listings stand out' },
            { title: 'VIP Program', text: 'Unlock early access & special perks' },
          ].map(({ title, text }, idx) => (
            <Card key={idx} className="text-center space-y-3">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
              <Button variant="outline">Learn More</Button>
            </Card>
          ))}
        </section>
      </div>

      {/* ── FLOATING WHATSAPP BUTTON ───────── */}
      <a
        href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20👋"
        target="_blank"
        rel="noreferrer"
        className="
          fixed bottom-6 right-6 w-16 h-16 rounded-full
          bg-gradient-to-br from-[#25D366] to-[#128C7E]
          flex items-center justify-center shadow-xl
          hover:shadow-2xl hover:scale-110 transition
        "
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 448 512" className="w-8 h-8 fill-white">
          <path d="M380.9 97.1C339 55.3 282.1 32 224.1 32 100.3 32 0 132.3 0 256c0 45 11.7 89 34 128.1L0 480l99.9-32.6C137.9 466.3 181 480 224.1 480c123.7 0 224.1-100.3 224.1-224.1 0-58-23.2-114.9-68.3-158.8z" />
        </svg>
      </a>
    </>
  );
}
