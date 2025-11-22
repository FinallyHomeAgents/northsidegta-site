// src/ThankYou209BarriePage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import GoogleGradientReviews, { GOOGLE_REVIEWS } from "./components/reviews/GoogleGradientReviews";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getFormEndpoint } from "./components/contact/contactConfig";

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

const PROCESS_STEPS = [
  { title: "Clarify", description: "Goals, budget, neighborhoods" },
  { title: "Tour", description: "Curated homes, fast scheduling" },
  { title: "Offer", description: "Comps, strategy, negotiations" },
  { title: "Close", description: "Lawyers, keys, move-in plan" },
];


/* ───────── Little inline icons (used in UI labels/headers) ───────── */
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
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_45px_130px_rgba(34,68,10,0.5)]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-emerald-500/10 to-emerald-700/5" aria-hidden />
      <div className="relative z-10 grid overflow-hidden md:grid-cols-2">
        {/* Left: On your own */}
        <div className="border-b border-white/10 bg-slate-900/60 backdrop-blur-sm md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-rose-200/90">
            <XIcon className="h-5 w-5" />
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.28em]">Buying On Your Own</h3>
          </div>
          <ul className="space-y-3 px-5 py-6">
            {solo.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-emerald-100/80">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-rose-400/80" />
                <span className="leading-6">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: With Finally Home Agents */}
        <div className="bg-gradient-to-br from-emerald-500/40 via-emerald-500/20 to-emerald-600/30">
          <div className="flex items-center gap-2 border-b border-white/20 px-5 py-4 text-white">
            <CheckIcon className="h-5 w-5" />
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.28em]">Buying With Finally Home Agents</h3>
          </div>
          <ul className="space-y-3 px-5 py-6">
            {withUs.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/70" />
                <span className="leading-6">{t}</span>
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
    if (form.nickname) return;

    try {
      setSending(true);
      const endpoint = `https://formspree.io/f/${formspreeId}`;

      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
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
      <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/5 p-[1.5px] shadow-[0_45px_130px_rgba(34,68,10,0.55)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#07150d]/90 px-6 py-10 text-white backdrop-blur-xl sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.35),_transparent_70%)]" aria-hidden />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
              <CheckIcon className="h-4 w-4" />
              Match Concierge
            </span>
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              You’re in — we’ll reach out within 24 hours
            </h3>
            <p className="max-w-2xl text-sm text-emerald-100/85 sm:text-base">
              Thanks! A NorthSide GTA specialist will contact you via email or phone within 24 hours to kick off your personalized town match and search plan.
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">Private &amp; secure. We never spam.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/5 p-[1.5px] shadow-[0_55px_140px_rgba(34,68,10,0.55)]">
      <div className="relative overflow-hidden rounded-[30px] bg-[#07150d]/90 p-6 backdrop-blur-xl sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(50,97,14,0.4),_transparent_70%)]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen"
          style={{ backgroundImage: "url('/Images/northside-map-grid.png')", backgroundSize: "cover" }}
          aria-hidden
        />

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100 shadow-sm backdrop-blur">
              VIP
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h3 className="text-3xl font-semibold tracking-tight text-white md:text-[2.35rem]">Match Concierge</h3>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { icon: "⏱️", text: "Takes ~1 minute" },
                  { icon: "✅", text: "No spam, no obligation" },
                  { icon: "🔒", text: "Secure & private" },
                  { icon: "📍", text: "Local market experts" },
                ].map((p) => (
                  <span
                    key={p.text}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white shadow-sm backdrop-blur"
                  >
                    <span>{p.icon}</span> {p.text}
                  </span>
                ))}
              </div>
            </div>
            <p className="max-w-xl text-sm text-emerald-100/85 md:text-base">
              Tell us how you live — we’ll match you to the right town, street, and home.
            </p>
          </div>

          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[11px] font-medium text-emerald-100/70">
              {progressPct}% complete
            </div>
          </div>

          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="mt-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  First Name <span className="text-red-300">*</span>
                </span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Last Name <span className="text-red-300">*</span>
                </span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Email <span className="text-red-300">*</span>
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/60"
                      : "border-white/10 focus:border-emerald-400 focus:ring-emerald-400/40"
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-200">{fieldErrors.email}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Phone <span className="text-red-300">*</span>
                </span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/60"
                      : "border-white/10 focus:border-emerald-400 focus:ring-emerald-400/40"
                  }`}
                  placeholder="(###) ###-####"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-200">{fieldErrors.phone}</p>}
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">Budget (min)</span>
                <input
                  name="budgetMin"
                  value={form.budgetMin}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/90 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="$800,000"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Budget (max)</span>
                <input
                  name="budgetMax"
                  value={form.budgetMax}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/90 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="$1,200,000"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-white">Bedrooms (desired)</span>
                <select
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                >
                  <option value="">Select…</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Bathrooms (desired)</span>
                <select
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                >
                  <option value="">Select…</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">Property type</span>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/95 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
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

            <div>
              <span className="block text-sm font-medium text-white">
                When are you hoping to buy? <span className="text-red-300">*</span>
              </span>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-5">
                {["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"].map((label, idx) => (
                  <label
                    key={label}
                    className={`group flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 transition ${
                      form.timeline === label
                        ? "border-white/30 bg-white/15 text-white shadow-lg shadow-emerald-900/30"
                        : "border-white/10 bg-white/5 text-emerald-100/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeline"
                      value={label}
                      checked={form.timeline === label}
                      onChange={update}
                      required={idx === 0}
                      className="h-4 w-4 border-white/40 text-emerald-400 focus:ring-emerald-400/60"
                    />
                    <span className="leading-snug">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-white">Which NorthSide GTA towns interest you most?</span>
              <p className="mt-1 text-xs text-emerald-100/70">Select up to 7.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOWNS.map((town) => {
                  const active = form.towns.includes(town);
                  return (
                    <button
                      type="button"
                      key={town}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition backdrop-blur ${
                        active
                          ? "border-white/25 bg-white/15 text-white shadow-lg shadow-emerald-900/20"
                          : "border-white/15 bg-white/5 text-emerald-100/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => toggleTown(town)}
                    >
                      {town}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Must-haves <span className="text-emerald-100/70">(optional)</span>
                </span>
                <textarea
                  name="mustHaves"
                  value={form.mustHaves}
                  onChange={update}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/90 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="E.g., garage, yard, quiet street, near GO Station…"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Nice-to-haves <span className="text-emerald-100/70">(optional)</span>
                </span>
                <textarea
                  name="niceToHaves"
                  value={form.niceToHaves}
                  onChange={update}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/90 px-3 py-2 text-slate-900 shadow-lg shadow-emerald-900/10 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="E.g., finished basement, newer roof, south-facing yard…"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-emerald-900/30 backdrop-blur">
              <h4 className="text-sm font-semibold text-white">Before You Submit</h4>
              <p className="text-xs text-emerald-100/80">Please confirm the following to help us respond faster.</p>
              <div className="mt-3 space-y-2 text-sm">
                <label className="flex items-start gap-2 text-emerald-100/80">
                  <input
                    type="checkbox"
                    name="notUnderContract"
                    checked={form.notUnderContract}
                    onChange={update}
                    className="mt-1 h-4 w-4 rounded border border-white/40 text-emerald-500 focus:ring-emerald-400/80"
                    required
                  />
                  <span>
                    I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate Brokerage.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-emerald-100/80">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={update}
                    className="mt-1 h-4 w-4 rounded border border-white/40 text-emerald-500 focus:ring-emerald-400/80"
                    required
                  />
                  <span>
                    I agree to be contacted by Finally Home Agents about my buyer match and search plan.
                    <span className="block text-emerald-100/60 text-xs">You can unsubscribe anytime. We respect your privacy.</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={!requiredOk || sending}
                className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_40px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Start Your Match"}
              </button>

              <p className="text-xs text-emerald-100/70">Private &amp; secure. We never spam.</p>
            </div>

            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={update}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-100/70">
            <span>★★★★★ Google reviews</span>
            <span>•</span>
            <span>AI-assisted town matching &amp; VIP listing alerts</span>
            <span>•</span>
            <span>Local team. Personal guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuyersHero({ onMoreInfo, onExploreHomes }) {
  return (
    <section className="relative isolate">
      <figure className="relative h-[60vh] w-full overflow-hidden lg:h-[75vh] lg:max-h-[820px]">
       <img
  src={`${process.env.PUBLIC_URL || ''}/uploads/buyers-hero-northside-family.jpg`}
  alt="Young family exploring a NorthSide GTA neighborhood with stone and brick homes at sunset — representing the lifestyle of buying north of Toronto."
  loading="eager"
  decoding="async"
  className="w-full h-[75vh] object-cover"
/>
      </figure>

      <div className="absolute inset-0">
        <div className="mx-auto flex h-full w-full max-w-6xl items-end px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16">
          <div className="relative max-w-xl">
            <div
              className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#32610E]/70 via-[#244c0b]/60 to-transparent"
              aria-hidden
            />
            <div className="relative rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-[0_30px_120px_rgba(4,17,12,0.55)] backdrop-blur lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
                BUYER FOLLOW-UP
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.9rem]">
                Thanks Again for Visiting 209 Barrie St
              </h1>
              <p className="mt-3 max-w-2xl text-base text-emerald-50/90 sm:text-lg">
                If you'd like more information about the home, or want to explore additional options in Thornton, Simcoe County, or somewhere else north of Toronto, we’re here to help guide your search.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => onMoreInfo?.()}
                  className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_40px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  More Info About 209 Barrie St
                </button>
                <button
                  type="button"
                  onClick={() => onExploreHomes?.()}
                  className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  Explore More Homes in the Area
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyBuyWithUsBand() {
  const items = [
    { icon: "✅", text: "Local intel you can’t Google — schools, micro-neighborhoods, commutes." },
    { icon: "🧭", text: "Concierge search — we shortlist and book tours for you." },
    { icon: "🛡️", text: "Offer strategy that wins — clean terms, timing, and comps that matter." },
    { icon: "🤝", text: "From offer to keys — financing, lawyers, inspections, movers." },
  ];

  return (
    <section aria-label="Why buy with Finally Home Agents">
      <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-[0_24px_70px_rgba(4,17,12,0.45)] backdrop-blur">
        <div className="grid gap-4 text-sm text-emerald-50 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-lg leading-none">{icon}</span>
              <p className="leading-6 text-emerald-50/90">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowCanWeHelpSection({ onContact }) {
  const cards = [
    {
      title: "More Information About 209 Barrie St",
      body:
        "If you have questions about the property, its features, the neighbourhood, or next steps, we’d be happy to help.",
      cta: "Ask About 209 Barrie St",
      href: "#contact-form",
    },
    {
      title: "Explore Other Homes in the Area or Beyond",
      body:
        "If you're comparing options in Thornton, Simcoe County, or somewhere else entirely, we can send you personalized listings based on what you’re looking for.",
      cta: "Get Homes That Match My Needs",
      href: "#preferences",
    },
  ];

  return (
    <section id="how-can-we-help" className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How Can We Help With Your Home Search?</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/8 p-5 shadow-[0_18px_50px_rgba(4,17,12,0.4)] backdrop-blur"
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-emerald-100/85">{card.body}</p>
            </div>
            <a
              href={card.href}
              onClick={(e) => {
                e.preventDefault();
                onContact?.(card.href.replace("#", ""));
              }}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {card.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThorntonOverview() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Considering Thornton &amp; Simcoe County?</h2>
      <p className="text-base text-emerald-100/85 sm:text-lg">
        Thornton and the surrounding communities offer a relaxed pace of living, larger lots, quiet streets, and quick access to Barrie and Hwy 400. Whether you're exploring this area, looking across Simcoe County, or comparing it to other communities north of Toronto, we can help you understand the differences in lifestyle, amenities, commutes, and neighbourhood character.
      </p>
    </section>
  );
}

function PreferencesSection({ onContact }) {
  const bullets = [
    "Price range",
    "Home style or layout",
    "Lot size",
    "Commute or work-from-home needs",
    "Towns or areas you're considering",
    "Must-have features",
  ];

  return (
    <section id="preferences" className="space-y-4">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tell Us What You're Looking For</h2>
        <p className="text-base text-emerald-100/85 sm:text-lg">
          Every buyer’s needs are different. Whether you’re focused on Thornton, Simcoe County, or exploring other towns and communities north of Toronto, share what matters most to you — and we’ll help you find homes that align with your goals.
        </p>
      </div>

      <ul className="grid gap-2 rounded-3xl border border-white/10 bg-white/8 p-5 shadow-[0_18px_50px_rgba(4,17,12,0.4)] backdrop-blur sm:grid-cols-2">
        {bullets.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-emerald-100/85">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div>
        <a
          href="#contact-form"
          onClick={(e) => {
            e.preventDefault();
            onContact?.("contact-form");
          }}
          className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Share Your Preferences
        </a>
      </div>
    </section>
  );
}

function SupportStrip({ onContact }) {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-emerald-500 via-emerald-500/70 to-emerald-600 px-6 py-10 text-center shadow-[0_45px_130px_rgba(34,68,10,0.6)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" aria-hidden />
        <div className="relative z-10 space-y-3">
          <h3 className="text-3xl font-semibold md:text-4xl">We're Here to Support Your Home Search</h3>
          <p className="text-lg text-emerald-100/90 md:text-xl">
            Whether you’d like more information about 209 Barrie St, homes in Thornton or Simcoe County, or opportunities in another community altogether, we’d be happy to help you compare your options.
          </p>
          <div>
            <a
              href="#contact-form"
              onClick={(e) => {
                e.preventDefault();
                onContact?.("contact-form");
              }}
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-[#32610E] shadow-[0_18px_40px_rgba(255,255,255,0.25)] transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Get Personalized Listings
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactContactCards({ onContact }) {
  const agents = [
    {
      name: "Matthew Mulhall",
      title: "Real Estate Agent | Finally Home Agents",
      brokerage: "HomeLife Optimum Realty, Brokerage",
      accent: "Co-Founder, NorthSide GTA",
      imageSrc: "/Images/matthew.jpg",
      imageAlt: "Headshot of Matthew Mulhall, co-founder of Finally Home Agents.",
    },
    {
      name: "Landon Mulhall",
      title: "Real Estate Agent | Finally Home Agents",
      brokerage: "HomeLife Optimum Realty, Brokerage",
      accent: "Co-Founder, NorthSide GTA",
      imageSrc: "/Images/landon.jpg",
      imageAlt: "Headshot of Landon Mulhall, co-founder of Finally Home Agents.",
    },
  ];

  return (
    <section className="space-y-5" aria-labelledby="contact-team-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="contact-team-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Prefer to Connect Directly?
          </h3>
          <p className="mt-1 text-base text-emerald-100/80 sm:text-lg">
            Reach out to the team that hosted you at 209 Barrie St — we’re happy to talk next steps.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onContact?.("contact-form")}
          className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Message Us
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {agents.map((agent) => (
          <CompactAgentCard key={agent.name} {...agent} onContact={onContact} />
        ))}
      </div>
    </section>
  );
}

function CompactAgentCard({ name, title, brokerage, accent, imageSrc, imageAlt, onContact }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(4,17,12,0.35)]">
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        className="h-14 w-14 flex-none rounded-full object-cover shadow"
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">{accent}</p>
        <h4 className="text-lg font-semibold text-white">{name}</h4>
        <p className="text-sm text-emerald-100/85">{title}</p>
        <p className="text-xs text-emerald-100/70">{brokerage}</p>
      </div>
      <button
        type="button"
        onClick={() => onContact?.("contact-form")}
        className="inline-flex items-center justify-center rounded-lg border border-white/50 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        Contact
      </button>
    </article>
  );
}

function BuyersReviewCarousel() {
  const grouped = useMemo(() => {
    const chunkSize = 3;
    const acc = [];
    for (let i = 0; i < GOOGLE_REVIEWS.length; i += chunkSize) {
      acc.push(GOOGLE_REVIEWS.slice(i, i + chunkSize));
    }
    return acc;
  }, []);

  const totalSlides = grouped.length || 1;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || totalSlides <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(id);
  }, [paused, totalSlides]);

  useEffect(() => {
    if (active >= totalSlides) {
      setActive(0);
    }
  }, [active, totalSlides]);

  if (grouped.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="buyers-reviews-heading">
      <div className="text-center">
        <h2 id="buyers-reviews-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Real buyers. Real reviews.
        </h2>
        <p className="mt-2 text-base text-emerald-100/80">Verified Google reviews from NorthSide GTA clients.</p>
      </div>

      <div
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(4,17,12,0.45)] backdrop-blur"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {grouped.map((group, index) => (
            <div key={index} className="w-full shrink-0 px-1 sm:px-2">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((review) => (
                  <article
                    key={review.name}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/12 p-5 text-left text-emerald-50 shadow-[0_14px_40px_rgba(4,17,12,0.35)] backdrop-blur"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/80">
                      <img src="/Images/google-logo.png" alt="Google" className="h-5 w-5" loading="lazy" />
                      Finally Home Agents
                    </div>
                    <p className="text-sm leading-6 text-emerald-50/90 sm:text-base">{review.quote}</p>
                    <div className="mt-auto text-sm font-semibold text-white/90">— {review.name}</div>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-100/60">Verified Client Review</span>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-6 rounded-full transition ${index === active ? "bg-emerald-300" : "bg-white/25"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section aria-labelledby="buyers-process-heading" className="space-y-6">
      <div className="text-center">
        <h2 id="buyers-process-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Buying with Finally Home Agents is simple
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS_STEPS.map((step) => (
          <div key={step.title} className="rounded-3xl border border-white/10 bg-white/8 p-5 text-left shadow-[0_18px_50px_rgba(4,17,12,0.4)] backdrop-blur">
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-1 text-sm text-emerald-100/80">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CallbackDrawer({ expanded, onExpandedChange }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  const validations = useMemo(() => {
    const issues = {};
    if (!name.trim()) issues.name = "Name is required.";
    if (!phone.trim()) issues.phone = "Phone number is required.";
    return issues;
  }, [name, phone]);

  const visibleErrors = showErrors ? validations : {};

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (Object.keys(validations).length > 0) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setShowErrors(false);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("name", name.trim());
      payload.append("phone", phone.trim());
      if (notes.trim()) {
        payload.append("message", notes.trim());
      }
      payload.append("source", "callback");

      const response = await fetch(formEndpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const panelId = "buyers-callback-panel";
  const titleId = "buyers-callback-title";

  if (success) {
    return (
      <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-white shadow-[0_24px_80px_rgba(4,17,12,0.4)] backdrop-blur">
        <h3 className="text-xl font-semibold">We’ll be in touch shortly</h3>
        <p className="mt-2 text-sm text-emerald-100/85">Thanks for your request! A NorthSide GTA advisor will call you between 9am–9pm.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/15 bg-white/8 text-white shadow-[0_24px_80px_rgba(4,17,12,0.4)] backdrop-blur">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold uppercase tracking-[0.32em] text-emerald-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-labelledby={titleId}
      >
        <span id={titleId}>Premium callback (9am–9pm)</span>
        <span aria-hidden className="text-lg">{expanded ? "–" : "+"}</span>
      </button>
      <div id={panelId} hidden={!expanded} className="border-t border-white/10 px-6 py-6 sm:px-8">
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm">
            <span className="text-emerald-100/80">Name *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            {visibleErrors.name && <span className="mt-1 block text-xs text-emerald-100/80">{visibleErrors.name}</span>}
          </label>
          <label className="block text-sm">
            <span className="text-emerald-100/80">Phone *</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/95 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
            {visibleErrors.phone && <span className="mt-1 block text-xs text-emerald-100/80">{visibleErrors.phone}</span>}
          </label>
          <label className="block text-sm">
            <span className="text-emerald-100/80">Notes <span className="text-emerald-100/60">(optional)</span></span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>

          {error && <p className="text-sm text-red-200">{error}</p>}

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Request callback"}
            </button>
            <p className="text-xs text-emerald-100/70">Private &amp; secure. We never spam.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function StickyCtaBar({ onStartSearch, onCallBack }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      if (maxScroll <= 0) {
        setVisible(false);
        return;
      }
      setVisible(scrollTop >= maxScroll * 0.25);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#05180f]/95 p-4 text-white shadow-[0_20px_60px_rgba(4,17,12,0.55)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-emerald-50/90 sm:text-base">Looking north of Toronto? We’ll guide you.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onStartSearch}
            className="inline-flex items-center justify-center rounded-lg bg-[#32610E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(50,97,14,0.35)] transition hover:bg-[#2b530c] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Start Your Search
          </button>
          <button
            type="button"
            onClick={onCallBack}
            className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Call Back
          </button>
        </div>
      </div>
    </div>
  );
}

const BARRIE_ROUTE_META = {
  title: "Thanks for Visiting 209 Barrie St | Finally Home Agents",
  description:
    "Follow-up page for visitors of 209 Barrie St. Get more information about the home, or explore homes in Thornton, Simcoe County, or elsewhere north of Toronto with Finally Home Agents.",
  canonicalUrl: "https://northsidegta.ca/thank-you-209-barrie-st",
};

/* ───────── Page ───────── */
export default function ThankYou209BarriePage() {
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 80;
    const target = el.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  const handleScroll = (id) => scrollToId(id);
  const handleContactClick = (id) => scrollToId(id);
  const handleContactOpen = () => scrollToId("contact-form");

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#04110c] text-white">
      <HeaderShell />
      <DynamicMetaTags {...BARRIE_ROUTE_META}>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: BARRIE_ROUTE_META.title,
            url: BARRIE_ROUTE_META.canonicalUrl,
            description: BARRIE_ROUTE_META.description,
            about: {
              "@type": "RealEstateAgent",
              name: "Finally Home Agents",
              areaServed: [
                "Georgina",
                "East Gwillimbury",
                "Newmarket",
                "Aurora",
                "Stouffville",
                "Uxbridge",
                "Scugog",
              ],
              url: "https://northsidegta.ca",
              brand: "Finally Home Agents",
            },
          })}
        </script>
      </DynamicMetaTags>

      <main className="relative flex-1 pb-24">
        <BuyersHero
          onMoreInfo={() => handleScroll("contact-form")}
          onExploreHomes={() => handleScroll("how-can-we-help")}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.25),_transparent_65%)]" aria-hidden />
        <div className="pointer-events-none absolute -top-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-40%] right-[-20%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />

        <div className="relative z-10">
          <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-24">
            <div className="space-y-16 sm:space-y-20">
              <HowCanWeHelpSection onContact={handleContactClick} />

              <ThorntonOverview />

              <PreferencesSection onContact={handleContactClick} />

              <section className="space-y-6" aria-labelledby="better-way-heading">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 id="better-way-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    A Better Way to Buy a Home
                  </h2>
                  <p className="mt-3 text-base text-emerald-100/80">
                    Navigate your options with local guidance, clear strategy, and a calm path to your next home.
                  </p>
                </div>
                <WhyBuyWithUsBand />
              </section>

              <section className="space-y-6" aria-labelledby="pros-cons-heading">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 id="pros-cons-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Buying on your own vs with Finally Home Agents
                  </h2>
                  <p className="mt-3 text-base text-emerald-100/80">
                    See how concierge-level strategy, intel, and execution change your outcome.
                  </p>
                </div>
                <ComparisonGrid />
              </section>

              <section className="space-y-6" aria-labelledby="process-heading">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 id="process-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    How We Support Your Home Search
                  </h2>
                  <p className="mt-3 text-base text-emerald-100/80">
                    Clarity, curated tours, confident offers, and a smooth path to close.
                  </p>
                </div>
                <ProcessSection />
              </section>

              <section className="space-y-6" aria-labelledby="reviews-heading">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 id="reviews-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Client Reviews</h2>
                  <p className="mt-2 text-base text-emerald-100/80">
                    A quick spotlight from the buyers we’ve guided north of Toronto.
                  </p>
                </div>
                <GoogleGradientReviews />
              </section>

              <section id="contact-form" className="scroll-mt-28 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Have Questions or Want Personalized Listings?
                  </h2>
                  <p className="text-base text-emerald-100/85 sm:text-lg">
                    Send us a quick message and we’ll be in touch. There’s no obligation — we’re here to help you explore your options.
                  </p>
                </div>
                <BuyerSignupForm />
              </section>

              <CompactContactCards onContact={handleContactClick} />

              <SupportStrip onContact={handleContactClick} />
            </div>
          </div>
        </div>

        <StickyCtaBar onStartSearch={() => handleScroll("contact-form")} onCallBack={handleContactOpen} />
      </main>

      <Footer />
    </div>
  );
}
