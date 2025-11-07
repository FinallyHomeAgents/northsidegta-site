// src/BuyersPage.js
import React, { useMemo, useRef, useState } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import GoogleGradientReviews from "./components/reviews/GoogleGradientReviews";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

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
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_45px_130px_rgba(4,47,35,0.5)]">
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
      <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-emerald-500/20 p-8 text-white shadow-[0_40px_120px_rgba(4,47,35,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_65%)]" aria-hidden />
        <div className="relative z-10 flex flex-col gap-3 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20">
              <CheckIcon className="h-6 w-6 text-white" />
            </span>
            <h3 className="text-2xl font-semibold tracking-tight">
              You’re in — we’ll reach out within 24 hours
            </h3>
          </div>
          <p className="text-sm text-emerald-100/90">
            Thanks! A NorthSide GTA specialist will contact you via email or phone within 24 hours to kick off your personalized town match and search plan.
          </p>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">No spam. You can unsubscribe anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="buyers-registration"
      className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-400/50 via-emerald-500/35 to-emerald-600/45 p-[1.5px] shadow-[0_55px_140px_rgba(4,47,35,0.55)]"
    >
      <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-slate-900/85 p-6 backdrop-blur-xl md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_65%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen" style={{ backgroundImage: "url('/Images/northside-map-grid.png')", backgroundSize: "cover" }} aria-hidden />

        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-emerald-100">
            <ShieldIcon className="h-5 w-5" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.34em]">
              Exclusive Buyer Access
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Unlock Your Secret Weapon for Buying in the NorthSide GTA
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-emerald-100/80 md:text-base">
            Tell us a bit more and we’ll tailor your NorthSide GTA Match, strategy, and tours.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
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

          <div className="mt-4">
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
              className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100"
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-5">
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

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!requiredOk || sending}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-xl shadow-emerald-900/40 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Sending…" : "Start Here"}
              </button>

              <p className="text-xs text-emerald-100/70">No spam. Unsubscribe anytime.</p>
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

const BUYERS_ROUTE_META = getStaticRouteMeta("/buyers") || {};

/* ───────── Page ───────── */
export default function BuyersPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#04110c] text-white">
      <Navigation />
      <DynamicMetaTags {...BUYERS_ROUTE_META}>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name:
              BUYERS_ROUTE_META.title ||
              "Buy a Home in the NorthSide GTA | Town Match, VIP Alerts & Expert Agents",
            url: BUYERS_ROUTE_META.canonicalUrl || "https://northsidegta.ca/buyers",
            description:
              "Personalized town match, VIP listing alerts, and expert guidance for buyers in the NorthSide GTA.",
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

      <main className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_65%)]" aria-hidden />
        <div className="pointer-events-none absolute -top-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-40%] right-[-20%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
              <LockIcon className="h-4 w-4" />
              Exclusive Buyer Portal
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
              Unlock Your Secret Weapon for Buying in the NorthSide GTA
            </h1>
            <p className="mt-4 text-base text-emerald-100/85 sm:text-lg">
              Register to get your NorthSide GTA Match, insider strategies, and VIP alerts — the unfair advantage other buyers don’t have.
            </p>
          </section>

          <section className="mt-10">
            <BuyerSignupForm />
          </section>

          <section className="mt-16">
            <ComparisonGrid />
          </section>

          <section className="mt-10 text-center text-sm text-emerald-100/80">
            Join NorthSide GTA buyers who found the right town — and won the right home — with Finally Home Agents.
          </section>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What Our Clients Are Saying</h2>
            </div>
            <div className="mt-8">
              <GoogleGradientReviews />
            </div>
          </section>

          <section className="mt-20">
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-emerald-500 via-emerald-500/70 to-emerald-600 px-6 py-10 text-center shadow-[0_45px_130px_rgba(4,47,35,0.6)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" aria-hidden />
              <div className="relative z-10 space-y-4">
                <h3 className="text-3xl font-semibold md:text-4xl">Don’t Leave Power on the Table</h3>
                <p className="text-lg text-emerald-100/90 md:text-xl">
                  Register now to unlock your Match and move forward with confidence.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
