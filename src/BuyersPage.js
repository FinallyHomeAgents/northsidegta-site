// src/BuyersPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import Footer from "./Footer";

/* ───────── helpers ───────── */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneOk = (v) => v.replace(/\D/g, "").length >= 10;

const TOWNS = [
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Stouffville",
  "Uxbridge",
  "Scugog",
  "None",
];

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

/* ───────── Little inline icons (used in UI labels/headers) ───────── */
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

/* ───────── Comparison: Buying on Your Own vs With Finally Home Agents (kept) ───────── */
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

/* ───────── Detailed Buyer Sign-Up form (map background, more fields) ───────── */
function BuyerSignupForm() {
  const [form, setForm] = useState({
    // Contact
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // Buyer basics
    budgetMin: "",
    budgetMax: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    timeline: "",
    towns: [],
    mustHaves: "",
    niceToHaves: "",
    // Confirmations
    notUnderContract: false,
    consent: false,
    // honeypot
    nickname: "",
  });

  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "" });
  const errorRef = useRef(null);

  const utm = useMemo(() => new URLSearchParams(window.location.search), []);
  const device = useMemo(() => (/Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop"), []);

  // Formspree endpoint (use env var if set, fallback to your existing buyers form)
  const formspreeId = useMemo(() => {
    const fromEnv = (process.env.REACT_APP_FORMSPREE_BUYERS_ID || "").trim();
    return fromEnv || "xanbzajw";
  }, []);

  const requiredChecks = {
    firstName: !!form.firstName.trim(),
    lastName: !!form.lastName.trim(),
    email: !!form.email.trim() && emailOk(form.email),
    phone: !!form.phone.trim() && phoneOk(form.phone),
    timeline: !!form.timeline,
    notUnderContract: !!form.notUnderContract,
    consent: !!form.consent,
  };
  const requiredOk = Object.values(requiredChecks).every(Boolean);

  const progressPct = Math.max(
    6,
    Math.round(
      (Object.values(requiredChecks).filter(Boolean).length /
        Object.keys(requiredChecks).length) * 100
    )
  );

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));

    if (name === "email") {
      setFieldErrors((fe) => ({ ...fe, email: value && !emailOk(value) ? "Enter a valid email" : "" }));
    }
    if (name === "phone") {
      setFieldErrors((fe) => ({ ...fe, phone: value && !phoneOk(value) ? "Enter a 10-digit phone number" : "" }));
    }
  }

  function toggleTown(town) {
    setForm((f) => {
      const exists = f.towns.includes(town);
      let next = exists ? f.towns.filter((t) => t !== town) : [...f.towns, town];
      if (next.length > 7) next = next.slice(0, 7);
      if (town === "None" && !exists) next = ["None"];
      if (town !== "None" && next.includes("None")) next = next.filter((t) => t !== "None");
      return { ...f, towns: next };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const emailErr = form.email ? (emailOk(form.email) ? "" : "Enter a valid email") : "Email is required";
    const phoneErr = form.phone ? (phoneOk(form.phone) ? "" : "Enter a 10-digit phone number") : "Phone is required";
    setFieldErrors({ email: emailErr, phone: phoneErr });

    if (!formspreeId) {
      setError("Formspree Form ID is missing. Add REACT_APP_FORMSPREE_BUYERS_ID to your .env file.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    if (!requiredOk) {
      setError("Please complete all required fields and fix the highlighted errors.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    if (form.nickname) return; // honeypot

    try {
      setSending(true);
      const endpoint = `https://formspree.io/f/${formspreeId}`;

      const payload = {
        // contact
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        // buyer basics
        budget_min: form.budgetMin,
        budget_max: form.budgetMax,
        desired_bedrooms: form.bedrooms,
        desired_bathrooms: form.bathrooms,
        property_type: form.propertyType,
        timeline: form.timeline,
        towns: form.towns.join(", "),
        must_haves: form.mustHaves,
        nice_to_haves: form.niceToHaves,
        not_under_contract: form.notUnderContract ? "Yes" : "No",
        consent: form.consent ? "Yes" : "No",
        // tracking
        utm_source: utm.get("utm_source") || "",
        utm_campaign: utm.get("utm_campaign") || "",
        device,
        source_url: window.location.href,
        submitted_at: new Date().toLocaleString(),
        _subject: `New Buyer Sign-Up — ${form.firstName} ${form.lastName}`,
        _replyto: form.email || undefined,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.errors?.[0]?.message || body?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "buyer_signup_submit" });
        if (window.fbq) window.fbq("trackCustom", "BuyerSignupSubmit");
      } catch {}

      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending your request. Please try again.");
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckIcon className="h-5 w-5" />
          <h3 className="text-xl font-bold">You’re in — we’ll reach out within 24 hours</h3>
        </div>
        <p className="mt-2 text-emerald-900/90">
          Thanks! A NorthSide GTA specialist will contact you via email or phone within 24 hours to kick off your personalized town match and search plan.
        </p>
        <p className="mt-2 text-xs text-emerald-900/80">No spam. You can unsubscribe anytime.</p>
      </div>
    );
  }

  return (
   <div
  id="buyers-registration"
  className="relative rounded-2xl border shadow-sm p-6 md:p-7 overflow-hidden"
  style={{
    backgroundImage: `
      linear-gradient(135deg, rgba(49, 97, 13, 0.12) 0%, rgba(35, 71, 10, 0.12) 100%),
      url('/Images/northsidegta-map-bg.jpg')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

      {/* optional overlay if your JPG isn’t already translucent */}
      

      <div className="relative z-10">
        {/* header strip */}
        <div className="flex items-center gap-2 text-emerald-800 mb-2">
          <ShieldIcon className="h-5 w-5" />
          <span className="uppercase tracking-wider text-[11px] font-semibold">
            Exclusive Buyer Access
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Unlock Your Secret Weapon for Buying in the NorthSide GTA
        </h3>
        <p className="mt-1 text-slate-800">
          Tell us a bit more and we’ll tailor your NorthSide GTA Match, strategy, and tours.
        </p>

        {/* pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            { icon: "⏱️", text: "Takes ~1 minute" },
            { icon: "✅", text: "No spam, no obligation" },
            { icon: "🔒", text: "Secure & private" },
            { icon: "📍", text: "Local market experts" },
          ].map((p) => (
            <span
              key={p.text}
              className="inline-flex items-center gap-1 rounded-full bg-white/90 text-emerald-800 border border-emerald-200 px-3 py-1 text-[12px] font-semibold"
            >
              <span>{p.icon}</span> {p.text}
            </span>
          ))}
        </div>

        {/* progress */}
        <div className="mt-4">
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 text-right text-[11px] text-emerald-700 font-medium">
            {progressPct}% complete
          </div>
        </div>

        {/* error */}
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-4">
          {/* Contact */}
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">First Name <span className="text-red-500">*</span></span>
              <input
                name="firstName"
                value={form.firstName}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                autoComplete="given-name"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Last Name <span className="text-red-500">*</span></span>
              <input
                name="lastName"
                value={form.lastName}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                autoComplete="family-name"
                required
              />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Email <span className="text-red-500">*</span></span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  fieldErrors.email ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                } bg-white/95`}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium">Phone <span className="text-red-500">*</span></span>
              <input
                name="phone"
                value={form.phone}
                onChange={update}
                className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  fieldErrors.phone ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                } bg-white/95`}
                placeholder="(###) ###-####"
                inputMode="tel"
                autoComplete="tel"
                required
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </label>
          </div>

          {/* Budget + timeline */}
          <div className="grid md:grid-cols-[1fr_1fr] gap-3">
            <label className="block">
              <span className="text-sm font-medium">Budget (min)</span>
              <input
                name="budgetMin"
                value={form.budgetMin}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                placeholder="$800,000"
                inputMode="decimal"
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Budget (max)</span>
              <input
                name="budgetMax"
                value={form.budgetMax}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                placeholder="$1,200,000"
                inputMode="decimal"
                autoComplete="off"
              />
            </label>
          </div>

          {/* Bedrooms / Bathrooms / Property type */}
          <div className="grid md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Bedrooms (desired)</span>
              <select
                name="bedrooms"
                value={form.bedrooms}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
              >
                <option value="">Select…</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Bathrooms (desired)</span>
              <select
                name="bathrooms"
                value={form.bathrooms}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
              >
                <option value="">Select…</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Property type</span>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={update}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
              >
                <option value="">Any</option>
                <option>Detached</option>
                <option>Semi-Detached</option>
                <option>Townhouse</option>
                <option>Condo</option>
                <option>Rural</option>
              </select>
            </label>
          </div>

          {/* Timeline */}
          <div>
            <span className="block text-sm font-medium">When are you hoping to buy? <span className="text-red-500">*</span></span>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
              {["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"].map((label) => (
                <label
                  key={label}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 whitespace-normal ${
                    form.timeline === label ? "ring-2 ring-emerald-600 bg-white/95" : "bg-white/90 hover:bg-white"
                  }`}
                >
                  <input type="radio" name="timeline" value={label} checked={form.timeline === label} onChange={update} />
                  <span className="leading-snug">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Towns */}
          <div>
            <label className="block text-sm font-medium">Which NorthSide GTA towns interest you most?</label>
            <p className="text-xs text-gray-600 mt-1">Select up to 7.</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {TOWNS.map((town) => {
                const checked = form.towns.includes(town);
                return (
                  <label
                    key={town}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      checked ? "ring-2 ring-emerald-600 bg-white/95" : "bg-white/90 hover:bg-white"
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleTown(town)} />
                    <span>{town}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Must-haves <span className="text-gray-400">(optional)</span></span>
              <textarea
                name="mustHaves"
                value={form.mustHaves}
                onChange={update}
                rows={3}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                placeholder="E.g., garage, yard, quiet street, near GO Station…"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Nice-to-haves <span className="text-gray-400">(optional)</span></span>
              <textarea
                name="niceToHaves"
                value={form.niceToHaves}
                onChange={update}
                rows={3}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600 bg-white/95"
                placeholder="E.g., finished basement, newer roof, south-facing yard…"
              />
            </label>
          </div>

          {/* confirmations */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="notUnderContract"
              checked={form.notUnderContract}
              onChange={update}
              className="mt-1"
              required
            />
            <span>
              I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate Brokerage.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={update}
              className="mt-1"
              required
            />
            <span>
              I agree to be contacted by Finally Home Agents about my buyer match and search plan.
              <span className="block text-gray-500 text-xs">You can unsubscribe anytime. We respect your privacy.</span>
            </span>
          </label>

          {/* submit (gradient green) */}
          <button
            type="submit"
            disabled={!requiredOk || sending}
            className="mt-1 inline-flex items-center justify-center px-5 py-3 rounded-lg text-white font-semibold
                       bg-gradient-to-tr from-[#31610d] to-[#23470a]
                       hover:from-[#2b530c] hover:to-[#1c3a08]
                       disabled:opacity-50"
          >
            {sending ? "Submitting…" : "Start Here"}
          </button>

          <p className="text-[11px] text-slate-700 mt-1">
            No spam. Unsubscribe anytime.
          </p>

          {/* Honeypot */}
          <input
            name="nickname"
            value={form.nickname}
            onChange={update}
            className="hidden"
            tabIndex="-1"
            autoComplete="off"
          />
        </form>

        {/* micro line */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <span>★★★★★ Google reviews</span>
          <span>•</span>
          <span>AI-assisted town matching & VIP listing alerts</span>
          <span>•</span>
          <span>Local team. Personal guidance.</span>
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
<Helmet>
  <title>Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents</title>
  <meta
    name="description"
    content="Ready to buy in the NorthSide GTA? Get a personalized town match, VIP listing alerts, and expert guidance from Finally Home Agents in Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog."
  />
  <link rel="canonical" href="https://www.northsidegta.ca/buyers" />
  <meta name="robots" content="index,follow" />

  {/* Keywords (nice-to-have) */}
  <meta
    name="keywords"
    content="NorthSide GTA homes for sale, buy a home Georgina, buy a home East Gwillimbury, buy a home Newmarket, buy a home Aurora, buy a home Stouffville, buy a home Uxbridge, buy a home Scugog, town match, VIP listing alerts, Finally Home Agents"
  />

  {/* Open Graph */}
  <meta property="og:title" content="Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents" />
  <meta
    property="og:description"
    content="Find the right town—and the right home—across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog with Finally Home Agents."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.northsidegta.ca/buyers" />
  <meta property="og:image" content="https://www.northsidegta.ca/Images/northsidegta-map-bg.jpg" />

  {/* JSON-LD */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents",
      "url": "https://www.northsidegta.ca/buyers",
      "description":
        "Personalized town match, VIP listing alerts, and expert guidance for buyers in the NorthSide GTA.",
      "about": {
        "@type": "RealEstateAgent",
        "name": "Finally Home Agents",
        "areaServed": [
          "Georgina",
          "East Gwillimbury",
          "Newmarket",
          "Aurora",
          "Stouffville",
          "Uxbridge",
          "Scugog"
        ],
        "url": "https://www.northsidegta.ca",
        "brand": "Finally Home Agents"
      }
    })}
  </script>
</Helmet>

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

          {/* Detailed Buyer Sign-Up (map background + gradient button) */}
          <div className="mt-6">
            <BuyerSignupForm />
          </div>
        </section> 

        {/* COMPARISON: shows what you unlock by registering (kept) */}
        <section className="mx-auto max-w-6xl mt-10">
          <ComparisonGrid />
        </section>

        {/* Micro social proof line (kept) */}
        <section className="mx-auto max-w-6xl mt-6">
          <p className="text-center text-sm text-gray-600">
            Join NorthSide GTA buyers who found the right town — and won the right home — with Finally Home Agents.
          </p>
        </section>

        {/* Reviews (kept) */}
        <section className="mx-auto max-w-3xl py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            What Our Clients Are Saying
          </h2>
          <ReviewSlider />
        </section>

        {/* Final CTA (kept) */}
        <section className="mx-auto max-w-6xl mb-16">
          <div
            className="rounded-2xl px-6 py-10 text-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#31610d 0%, #23470a 100%)" }}
          >
            <h3 className="text-3xl md:text-4xl font-extrabold mb-2">Don’t Leave Power on the Table</h3>
            <p className="text-lg md:text-xl opacity-90">
              Register now to unlock your Match and move forward with confidence.
            </p>
           
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}