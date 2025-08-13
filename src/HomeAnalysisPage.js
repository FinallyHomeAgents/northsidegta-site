// HomeAnalysisPage.js — React + Formspree (email-only, no backend)
// Route at: /homeanalysis
// Uses REACT_APP_FORMSPREE_ID (if set) or falls back to your ID: xblkwrzj

import React, { useMemo, useState, useEffect, useRef } from "react";
import Navigation from "./Navigation";

const clamp1to10 = (n) => Math.min(10, Math.max(1, Number(n) || 1));
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
// Simple CA/US phone validator: allow spaces/()/- but must have 10 digits
const phoneOk = (v) => (String(v).replace(/[^0-9]/g, "").length === 10);

export default function HomeAnalysisPage() {
  const [form, setForm] = useState({
    streetNumber: "",
    streetName: "",
    bedrooms: "",
    bathrooms: "",
    condition: 5,
    upgrades: 7,
    estimate: "",
    improvements: "",
    features: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    timeline: "",
    notUnderContract: false,
    consent: false,
    nickname: "", // honeypot
  });

  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "" });
  const errorRef = useRef(null);
  const [startedAt] = useState(Date.now()); // time-trap: bots submit instantly
  const formRef = useRef(null);

  // UTM/device helpers
  const utm = useMemo(() => new URLSearchParams(window.location.search), []);
  const device = useMemo(() => (/Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop"), []);

  // Formspree ID
  const formspreeId = useMemo(() => {
    const fromEnv = (process.env.REACT_APP_FORMSPREE_ID || "").trim();
    return fromEnv || "xblkwrzj";
  }, []);

  // required fields checklist (used for validation + progress)
  const requiredChecks = {
    streetNumber: !!form.streetNumber.trim(),
    streetName: !!form.streetName.trim(),
    bedrooms: !!form.bedrooms,
    condition: !!form.condition,
    upgrades: !!form.upgrades,
    firstName: !!form.firstName.trim(),
    lastName: !!form.lastName.trim(),
    phone: !!form.phone.trim() && phoneOk(form.phone),
    email: !!form.email.trim() && emailOk(form.email),
    timeline: !!form.timeline,
    notUnderContract: !!form.notUnderContract,
    consent: !!form.consent,
  };

  const requiredOk = Object.values(requiredChecks).every(Boolean);

  // Dynamic progress (what % of required items are valid)
  const progressPct = Math.round(
    (Object.values(requiredChecks).filter(Boolean).length / Object.keys(requiredChecks).length) * 100
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

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // final validate email & phone
    const emailErr = form.email ? (emailOk(form.email) ? "" : "Enter a valid email") : "Email is required";
    const phoneErr = form.phone ? (phoneOk(form.phone) ? "" : "Enter a 10-digit phone number") : "Phone is required";
    setFieldErrors({ email: emailErr, phone: phoneErr });

    if (Date.now() - startedAt < 1200) {
      // likely a bot; silently ignore
      return;
    }

    if (!formspreeId) {
      setError("Formspree Form ID is missing. Add REACT_APP_FORMSPREE_ID to your .env file.");
      return;
    }
    if (!requiredOk) {
      setError("Please complete all required fields and fix the highlighted errors.");
      return;
    }
    if (form.nickname) {
      // honeypot: bots fill hidden field; quietly stop
      return;
    }

    try {
      setSending(true);
      const endpoint = `https://formspree.io/f/${formspreeId}`;

      const payload = {
        street_number: form.streetNumber.trim(),
        street_name: form.streetName.trim(),
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms || "",
        condition: clamp1to10(form.condition),
        upgrades: clamp1to10(form.upgrades),
        estimate: form.estimate || "",
        improvements: form.improvements || "",
        features: form.features || "",
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone || "",
        email: form.email || "",
        timeline: form.timeline,
        not_under_contract: form.notUnderContract ? "Yes" : "No",
        consent: form.consent ? "Yes" : "No",
        utm_source: utm.get("utm_source") || "",
        utm_campaign: utm.get("utm_campaign") || "",
        device,
        source_url: window.location.href,
        submitted_at: new Date().toLocaleString(),
        _subject: `New Home Analysis Lead — ${form.streetNumber} ${form.streetName}`,
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

      // analytics hooks (safe no-ops if not present)
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "homeanalysis_submit" });
        if (window.fbq) window.fbq("trackCustom", "HomeAnalysisSubmit");
      } catch {}

      setDone(true);

      // Redirect shortly after success message
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending your request. Please try again.");
      // move focus to error for accessibility
      setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setSending(false);
    }
  }

  // Dev-only smoke tests (console)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const tests = [
      { name: "renders hero heading", ok: !!document.querySelector('[data-testid="hero-heading"]') },
      { name: "has required checkbox: not under contract", ok: !!document.querySelector('[data-testid="not-under-contract"]') },
    ];
    console.group("/homeanalysis smoke tests");
    tests.forEach((t) => console.log(`${t.ok ? "✅" : "❌"} ${t.name}`));
    console.groupEnd();
  }, []);

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-1 text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            <span>✅</span> Submitted successfully
          </div>
          <h1 className="text-3xl font-bold mt-4">Thanks! We got your request.</h1>
          <p className="mt-3 text-gray-600">We’ll email you a personalized estimate and next-step options. Redirecting…</p>
        </main>
      </div>
    );
  }

  const timelineOptions = ["Immediate", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top progress bar */}
      <div className="h-1 w-full bg-emerald-100">
        <div
          className="h-full bg-emerald-600 transition-all"
          style={{ width: `${Math.max(6, progressPct)}%` }} // show at least a sliver
          aria-hidden
        />
      </div>

      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-emerald-50/40">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <h1 data-testid="hero-heading" className="text-3xl md:text-4xl font-bold">
            What’s Your Home Worth in Today’s NorthSide GTA Market?
          </h1>
          <p className="mt-3 text-gray-600">
            Get a fast, expert home analysis from Finally Home Agents—no pressure, no obligation.
          </p>
          <p className="mt-2 text-emerald-800 font-semibold text-base md:text-lg leading-snug">
            Serving the <span className="underline decoration-emerald-600 underline-offset-4">NorthSide GTA</span> and
            surrounding GTA areas
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-800 px-4 py-1 text-sm font-medium">
            <span>⏱️</span>
            <span>Takes less than 1 minute</span>
          </div>

          {/* micro trust strip */}
          <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>No spam, no obligation</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secure & private</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Local market experts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Single form wrapping both columns so sticky CTA can submit it */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-24 md:pb-16">
        <form id="homeanalysis-form" ref={formRef} onSubmit={onSubmit}>
          {/* top-level error (focusable) */}
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Step 1 */}
            <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border">
              <h2 className="text-lg sm:text-xl font-semibold">Step 1 · Property Details</h2>

              <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium">Street Number</label>
                  <input
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="address-line1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Street Name</label>
                  <input
                    name="streetName"
                    value={form.streetName}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    placeholder="Main St"
                    autoComplete="address-line1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    autoComplete="off"
                  >
                    <option value="">Select…</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Bathrooms</label>
                  <select
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    autoComplete="off"
                  >
                    <option value="">Select…</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium" id="cond-desc">
                    Overall Condition (1–10)
                  </label>
                  <input
                    type="range"
                    name="condition"
                    min="1"
                    max="10"
                    value={form.condition}
                    onChange={update}
                    className="mt-3 w-full"
                    aria-describedby="cond-desc"
                  />
                  <div className="mt-2 text-xs text-gray-500">1 Very poor · 5 Average · 10 Pristine</div>
                </div>

                {/* Upgrades */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium" id="up-desc">
                    Level of Upgrades (1–10)
                  </label>
                  <input
                    type="range"
                    name="upgrades"
                    min="1"
                    max="10"
                    value={form.upgrades}
                    onChange={update}
                    className="mt-3 w-full"
                    aria-describedby="up-desc"
                  />
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-semibold">1–2</span> Original / mostly original
                    </div>
                    <div>
                      <span className="font-semibold">3–4</span> Minor cosmetic / few rooms
                    </div>
                    <div>
                      <span className="font-semibold">5–6</span> Several rooms updated
                    </div>
                    <div>
                      <span className="font-semibold">7–8</span> Mostly updated, consistent
                    </div>
                    <div>
                      <span className="font-semibold">9–10</span> Fully renovated, high-end
                    </div>
                  </div>
                </div>

                {/* Owner estimate */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">
                    What do you think your home is worth? <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    name="estimate"
                    value={form.estimate}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    placeholder="$900,000"
                    inputMode="decimal"
                    autoComplete="off"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">
                    Recent improvements we should know about <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="improvements"
                    value={form.improvements}
                    onChange={update}
                    rows={3}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    placeholder="Roof 2021, furnace 2020, new flooring main level..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">
                    Unique features <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="features"
                    value={form.features}
                    onChange={update}
                    rows={2}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    placeholder="Pie lot, backs onto ravine, legal basement apartment..."
                  />
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border">
              <h2 className="text-lg sm:text-xl font-semibold">Step 2 · Your Details & Timing</h2>

              <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium">First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={update}
                    className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={update}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 ${
                      fieldErrors.phone ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                    }`}
                    placeholder="(###) ###-####"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={update}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 ${
                      fieldErrors.email ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                    }`}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">How soon might you consider a move?</label>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                    {timelineOptions.map((label) => (
                      <label
                        key={label}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 whitespace-normal break-words ${
                          form.timeline === label ? "ring-2 ring-emerald-600" : "hover:bg-gray-50"
                        }`}
                      >
                        <input type="radio" name="timeline" value={label} checked={form.timeline === label} onChange={update} />
                        <span className="leading-snug">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Honeypot + hidden tracking */}
                <input name="nickname" value={form.nickname} onChange={update} className="hidden" tabIndex="-1" autoComplete="off" />
                <input type="hidden" name="utm_source" value={utm.get("utm_source") || ""} readOnly />
                <input type="hidden" name="utm_campaign" value={utm.get("utm_campaign") || ""} readOnly />
                <input type="hidden" name="device" value={device} readOnly />

                <div className="md:col-span-2 space-y-3 mt-2">
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      data-testid="not-under-contract"
                      type="checkbox"
                      name="notUnderContract"
                      checked={form.notUnderContract}
                      onChange={update}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">
                        I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate
                        Brokerage.
                      </span>
                      <span className="block text-gray-500 text-xs mt-1">
                        Required — without this confirmation, we cannot provide a home analysis.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="consent" checked={form.consent} onChange={update} className="mt-1" />
                    <span>
                      I agree to be contacted by Finally Home Agents about my home analysis.
                      <span className="block text-gray-500 text-xs">You can unsubscribe anytime. We respect your privacy.</span>
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 mt-2">
                  <button
                    disabled={!requiredOk || sending}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Get My Home Value"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Testimonial */}
          <figure className="mx-auto mt-8 sm:mt-10 max-w-6xl rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <blockquote className="text-gray-700 italic">
              “They priced our home perfectly and had offers in days. Zero pressure, great communication.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-gray-500">— A. Sharma, Stouffville</figcaption>
          </figure>
        </form>

        {/* Credibility row */}
        <div className="mx-auto mt-8 sm:mt-10 max-w-6xl px-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border bg-white p-4 text-center">
              <div className="text-sm font-medium">📍 Local Experts</div>
              <div className="text-xs text-gray-500 mt-1">NorthSide GTA focused</div>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <div className="text-sm font-medium">🛠 Pro Staging & Media</div>
              <div className="text-xs text-gray-500 mt-1">High-end presentation</div>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-center">
              <div className="text-sm font-medium">🤝 Relationship-Driven</div>
              <div className="text-xs text-gray-500 mt-1">Guidance without pressure</div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 md:hidden">
        <button
          form="homeanalysis-form"
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold"
          disabled={!requiredOk || sending}
        >
          {sending ? "Sending…" : "Get My Home Value"}
        </button>
      </div>
    </div>
  );
}
