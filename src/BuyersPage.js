// src/BuyersPage.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navigation from "./Navigation";
import Footer from "./Footer";

/* ───────── Google-style review slider (kept) ───────── */
function ReviewSlider() {
  const reviews = [
    { name: "Susan Booth", quote: "“Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”" },
    { name: "Logan Abernethy", quote: "“As a first-time buyer I had plenty of questions. Landon was patient and made my experience fantastic.”" },
    { name: "Jessica Le", quote: "“Landon made renting stress-free. Really nice to work with and very easy to communicate with.”" },
    { name: "Tessa Conway", quote: "“Landon took all the stress out of renting in a brand-new city — I am forever thankful!”" },
    { name: "Olivia Oprea", quote: "“Matthew found me my dream home during a crazy market. Wouldn’t have got it without him.”" },
    { name: "Arron Breen", quote: "“Matt sold our house above market and negotiated our forever home for less. Highly recommend.”" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-gray-50 overflow-hidden">
      <div className="bg-[#4285F4] h-1" />
      <div className="relative px-4 sm:px-8 py-6 min-h-[180px] sm:min-h-[150px]">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <img
                src="/Images/google-logo.png"
                alt="Google"
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              />
              <span className="font-semibold text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                Finally&nbsp;Home&nbsp;Agents
              </span>
              <div className="flex text-[#FBBC05] text-xs sm:text-sm leading-none">
                {"★★★★★".split("").map((_, s) => (
                  <span key={s}>★</span>
                ))}
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

/* ───────── Little inline icons ───────── */
const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const LockIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V8a5 5 0 0 1 10 0v3" />
  </svg>
);

/* ───────── Registration (Match) Card ───────── */
const WHATSAPP_NUMBER_E164 = "16476684646";
const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(
  "Hi! I’d like to unlock my buyer match for the NorthSide GTA."
)}`;

function RegistrationCard() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!emailValid) {
      setErr("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("email", email);
      payload.append("source", "Buyers Registration");
      // carry UTM if present
      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
        const v = params.get(k);
        if (v) payload.append(k, v);
      });
      const res = await fetch("https://formspree.io/f/xanbzajw", {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Network error");
      setDone(true);
    } catch (e2) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckIcon className="h-5 w-5" />
          <h3 className="text-xl font-bold">Access unlocked — check your inbox</h3>
        </div>
        <p className="mt-2 text-emerald-900/90">
          You’re in. We’ll send your NorthSide GTA Match setup details and first steps to <span className="font-semibold">{email}</span>.
        </p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
        >
          Chat on WhatsApp — fastest reply
        </a>
        <p className="mt-2 text-xs text-emerald-900/80">No spam. Unsubscribe anytime.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border shadow-sm p-6 md:p-7 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#f7fff1 0%,#ffffff 55%)" }}
    >
      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="flex items-center gap-2 text-emerald-800 mb-2">
        <ShieldIcon className="h-5 w-5" />
        <span className="uppercase tracking-wider text-[11px] font-semibold">
          Exclusive Buyer Access
        </span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
        Unlock Your Secret Weapon for Buying in the NorthSide GTA
      </h3>
      <p className="mt-1 text-slate-700">
        Register to access your personalized town match, insider strategies, and the guidance that puts you ahead of other buyers.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-700 text-white font-semibold px-4 py-2 hover:bg-emerald-800 disabled:opacity-60"
        >
          {submitting ? "Registering..." : "Start Here"}
        </button>
      </form>
      {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span>★★★★★ Google reviews</span>
        <span>•</span>
        <span>AI-assisted town matching & VIP listing alerts</span>
        <span>•</span>
        <span>No spam. Unsubscribe anytime.</span>
      </div>
    </div>
  );
}

/* ───────── Comparison: Buying on Your Own vs With Finally Home Agents ───────── */
function ComparisonGrid() {
  const solo = [
    "Guesswork on where to live",
    "You hunt listings… and miss off-market",
    "No early alerts or pricing context",
    "DIY negotiation risks overpaying",
    "Tiring weekend tours with little focus",
    "Paperwork + deadlines = stress",
    "No trusted pros when issues appear",
    "Decisions made without a second set of eyes",
    "Generic info — not tailored to you",
  ];
  const withUs = [
    "Town Match: Top-3 areas based on your lifestyle & budget",
    "VIP alerts + off-market conversations",
    "Real-time price comps & micro-neighbourhood intel",
    "Offer strategy that wins without overpaying",
    "Planned, efficient tours — no time wasted",
    "We quarterback the process, you stay calm",
    "Inspector, lawyer, mortgage — vetted partners",
    "Walk-away confidence with data-driven advice",
    "AI-assisted insights tailored to your criteria",
  ];
  return (
    <div className="rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
      <div className="grid md:grid-cols-2">
        {/* Left: On your own */}
        <div className="bg-white">
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <XIcon className="h-5 w-5 text-rose-600" />
            <h3 className="uppercase text-[12px] font-semibold tracking-wider text-gray-700">
              Buying On Your Own
            </h3>
          </div>
          <ul className="p-5 space-y-3">
            {solo.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-800">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-rose-500/70" />
                <span className="text-[15px] leading-6">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: With Finally Home Agents */}
        <div
          className="text-white"
          style={{ background: "linear-gradient(135deg,#31610d 0%, #23470a 100%)" }}
        >
          <div className="px-5 py-3 border-b border-white/20 flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-white" />
            <h3 className="uppercase text-[12px] font-semibold tracking-wider">
              Buying With Finally Home Agents
            </h3>
          </div>
          <ul className="p-5 space-y-3">
            {withUs.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/70" />
                <span className="text-[15px] leading-6 text-white">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ───────── Page ───────── */
export default function BuyersPage() {
  return (
    <>
      <Navigation />

      <main className="px-4">
        {/* HERO: feels like a registration gateway */}
        <section className="mx-auto max-w-6xl pt-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-800 bg-emerald-50">
              <LockIcon className="h-4 w-4" />
              <span className="uppercase text-[11px] font-semibold tracking-wider">
                Exclusive Buyer Portal
              </span>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              Unlock Your Secret Weapon for Buying in the NorthSide GTA
            </h1>
            <p className="mt-2 text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
              Register to get your NorthSide GTA Match, insider strategies, and VIP alerts —
              the unfair advantage other buyers don’t have.
            </p>
          </div>

          <div className="mt-6">
            <RegistrationCard />
          </div>
        </section>

        {/* COMPARISON: shows what you unlock by registering */}
        <section className="mx-auto max-w-6xl mt-10">
          <ComparisonGrid />
        </section>

        {/* Micro social proof line */}
        <section className="mx-auto max-w-6xl mt-6">
          <p className="text-center text-sm text-gray-600">
            Join NorthSide GTA buyers who found the right town — and won the right home — with Finally Home Agents.
          </p>
        </section>

        {/* Reviews */}
        <section className="mx-auto max-w-3xl py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            What Our Clients Are Saying
          </h2>
          <ReviewSlider />
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl mb-16">
          <div
            className="rounded-2xl px-6 py-10 text-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#31610d 0%, #23470a 100%)" }}
          >
            <h3 className="text-3xl md:text-4xl font-extrabold mb-2">Don’t Leave Power on the Table</h3>
            <p className="text-lg md:text-xl opacity-90">
              Register now to unlock your Match and move forward with confidence.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#buyers-registration"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white text-emerald-700 font-semibold hover:bg-gray-100"
              >
                Start Here
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(
                  "Hi! I’d like to unlock my buyer match for the NorthSide GTA."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-white/30 font-semibold hover:bg-white/10"
              >
                WhatsApp — Fastest Reply
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
