// src/SellersPage.js
import React, { useState, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "./Navigation";
import Card from "./components/ui/Card";

// ===== Helpers (reused) =====
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneOk = (v) => v.replace(/\D/g, "").length >= 10;
const clamp1to10 = (n) => Math.max(1, Math.min(10, Number(n) || 1));

// ===== Config =====
const BG_IMAGE = "/Images/northsidegta-map-bg.jpg"; // <-- change if your filename/path differs

// Slim timeline (kept)
const timeline = [
  { title: "Never Too Early",       icon: "💬", copy: "Plan timing & pricing early." },
  { title: "AI Market Analysis",    icon: "📊", copy: "Data-backed strategy." },
  { title: "Prep Support",          icon: "⚙️", copy: "Pros lined up, fast." },
  { title: "Media & Marketing",     icon: "📸", copy: "Photo, drone, 3D, reels." },
  { title: "Launch Week",           icon: "🚀", copy: "Max traffic, fast." },
  { title: "Offers & Negotiation",  icon: "✍️", copy: "Top price & terms." },
  { title: "Closing & Beyond",      icon: "🔑", copy: "We stay to the finish." },
];

// Videos (kept)
const videos = [
  {
    title: "Queensville Showcase: 472 Seaview Heights",
    embed: "https://listings.wylieford.com/videos/01922f3a-c66a-7001-83e7-0e7fb17543bb",
  },
  {
    title: "Golf Course Estate in Uxbridge – 42 Wyndance Way",
    embed: "https://player.vimeo.com/video/832255969",
  },
];

// Towns (multi-select limit 7)
const TOWNS = ["Georgina","East Gwillimbury","Newmarket","Aurora","Stouffville","Uxbridge","Scugog","None"];

// WhatsApp icon for post-submit perk
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 448 512" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M380.9 97.1c-39.7-39.7-92.5-61.6-148.9-61.1C100.3 36.4 0 138 0 261.8c0 45.1 11.9 88.9 34.5 127.7L0 512l125.2-33.1c37.8 20.8 79.8 31.7 122.6 31.6h.6c123.5 0 224-100.7 224-224.6.1-59.3-22.9-115.1-64.5-156.8zm-155 330.7c-38.1 0-75.4-10-108.1-28.9l-7.7-4.6-64.2 17 17.2-62.6-5-8c-18.2-29.3-27.8-63.1-27.8-97.8 0-101.6 82.7-184.3 184.5-184.3 49.3-.1 95.6 19.1 130.4 53.9 34.8 34.9 54 81.1 53.9 130.3-.1 101.7-82.8 184.4-184.2 184.4zm101.6-138.1c-5.6-2.8-33.1-16.3-38.2-18.2-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18.2-17.6 21.9-3.2 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.8-27.8-33.1-31.1-38.7-3.2-5.6-.3-8.6 2.5-11.4 2.6-2.6 5.6-6.7 8.4-10.1 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-7-0.5-9.8-1.4-2.8-12.5-30.2-17.1-41.4-4.5-10.9-9.1-9.4-12.5-9.6-3.2-.2-7-.3-10.8-.3s-9.9 1.4-15.1 7c-5.1 5.6-19.9 19.5-19.9 47.6s20.4 55.2 23.2 59 39.9 61 96.8 85.6c13.6 5.9 24.2 9.4 32.5 12 13.6 4.3 26.1 3.7 35.9 2.3 10.9-1.6 33.1-13.5 37.7-26.5 4.6-13 .4-24.1-4.2-26.9z"
      />
    </svg>
  );
}

// ===== Two-step, in-place Seller form (with map background + gradient buttons) =====
function SellerLeadCapture() {
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
    towns: [],
    nickname: "", // honeypot
  });

  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "" });
  const errorRef = useRef(null);
  const [startedAt] = useState(Date.now());
  const utm = useMemo(() => new URLSearchParams(window.location.search), []);
  const device = useMemo(() => (/Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop"), []);

  const formspreeId = useMemo(() => {
    const fromEnv = (process.env.REACT_APP_FORMSPREE_ID || "").trim();
    return fromEnv || "xblkwrzj";
  }, []);

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
  const progressPct = Math.round(
    (Object.values(requiredChecks).filter(Boolean).length /
      Object.keys(requiredChecks).length) * 100
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

  function continueToStep2(e) {
    e.preventDefault();
    if (!form.streetNumber.trim() || !form.streetName.trim()) {
      setError("Please add your street number & street name to continue.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    setError("");
    setExpanded(true);
    setTimeout(() => {
      document.getElementById("seller-step2")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const emailErr = form.email ? (emailOk(form.email) ? "" : "Enter a valid email") : "Email is required";
    const phoneErr = form.phone ? (phoneOk(form.phone) ? "" : "Enter a 10-digit phone number") : "Phone is required";
    setFieldErrors({ email: emailErr, phone: phoneErr });

    if (Date.now() - startedAt < 1200) return;
    if (!formspreeId) {
      setError("Formspree Form ID is missing. Add REACT_APP_FORMSPREE_ID to your .env file.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    if (!requiredOk) {
      setError("Please complete all required fields and fix any highlighted errors.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    if (form.nickname) return; // honeypot

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
        towns: form.towns.join(", "),
        not_under_contract: form.notUnderContract ? "Yes" : "No",
        consent: form.consent ? "Yes" : "No",
        utm_source: utm.get("utm_source") || "",
        utm_campaign: utm.get("utm_campaign") || "",
        device,
        source_url: window.location.href,
        submitted_at: new Date().toLocaleString(),
        _subject: `New Seller Lead — ${form.streetNumber} ${form.streetName}`,
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
        window.dataLayer.push({ event: "seller_submit" });
        if (window.fbq) window.fbq("trackCustom", "SellerSubmit");
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
      <section className="mx-auto max-w-5xl w-full">
        <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-emerald-50/60 border-emerald-100">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-semibold">
              ✅ Submitted successfully
            </div>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Thanks! You’ve unlocked priority support.</h3>
            <p className="text-sm text-slate-700">We’re reviewing your home now. For faster back-and-forth, connect with us on WhatsApp:</p>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Premium WhatsApp card */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-800 px-3 py-1 text-xs font-semibold">
                    🔓 Premium perk unlocked
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    Get connected with Finally Home Agents on WhatsApp
                  </h4>
                  <p className="text-sm text-slate-600">
                    Priority updates, quick answers, and media previews — right on your phone.
                  </p>
                </div>
                <a
                  href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%20%E2%80%94%20I%27m%20following%20up%20on%20my%20home%20valuation."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-md hover:shadow-lg transition"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #1ebe57 100%)" }}
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Connect on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-emerald-50/60 border-emerald-100 p-4">
                <p className="italic text-sm md:text-base">
                  “Finally Home Agents exceeded our expectations when selling our home in Holland Landing.
                  Their professionalism and personal attention set them apart.”
                </p>
                <p className="mt-2 text-xs text-emerald-800 font-semibold">— Susan Booth</p>
              </Card>
              <Card className="bg-emerald-50/60 border-emerald-100 p-4">
                <p className="italic text-sm md:text-base">
                  “Matt sold our house above market and negotiated our forever home for less. Highly recommend.”
                </p>
                <p className="mt-2 text-xs text-emerald-800 font-semibold">— Arron Breen</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const timelineOptions = ["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"];

  return (
    <section className="mx-auto max-w-5xl w-full">
      <div
        className="rounded-2xl border border-emerald-200 shadow-sm overflow-hidden relative"
        style={{
          backgroundImage: `linear-gradient(rgba(49, 97, 13, 0.65), rgba(35, 71, 10, 0.55)), url('${BG_IMAGE}')`,

          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Header with pills INSIDE the card */}
        <div className="px-6 py-5 border-b bg-emerald-50/60 border-emerald-100">
          <p className="text-[12px] font-semibold tracking-wider text-emerald-700 uppercase">
            Your NorthSide GTA Seller Plan
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
            Step 1 · Property Details
          </h3>
          <p className="text-sm text-slate-600">
            Start here — we’ll build your pricing roadmap & selling strategy.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              { icon: "⏱️", text: "Takes less than 1 minute" },
              { icon: "✅", text: "No spam, no obligation" },
              { icon: "🔒", text: "Secure & private" },
              { icon: "📍", text: "Local market experts" },
            ].map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-1 rounded-full bg-white text-emerald-800 border border-emerald-200 px-3 py-1 text-[12px] font-semibold"
              >
                <span>{p.icon}</span> {p.text}
              </span>
            ))}
          </div>
        </div>

        {/* progress bar */}
        <div className="px-6 pt-3">
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.max(6, progressPct)}%`,
                background: "linear-gradient(135deg, #31610d 0%, #23470a 100%)",
              }}
              aria-hidden
            />
          </div>
          <div className="mt-1 text-right text-[11px] text-emerald-700 font-medium">{progressPct}% complete</div>
        </div>

        {/* error */}
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {!expanded && (
          <form onSubmit={continueToStep2} className="px-6 py-5 grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Street Number</span>
                <input
                  name="streetNumber"
                  value={form.streetNumber}
                  onChange={update}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="address-line1"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Street Name</span>
                <input
                  name="streetName"
                  value={form.streetName}
                  onChange={update}
                  placeholder="Main St"
                  autoComplete="address-line1"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Bedrooms</span>
                <select
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select…</option>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Bathrooms</span>
                <select
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={update}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select…</option>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg text-white font-semibold px-5 py-2.5 hover:opacity-95"
                style={{ background: "linear-gradient(135deg, #31610d 0%, #23470a 100%)" }}
              >
                Continue
              </button>
            </div>

            <p className="text-[11px] text-slate-500">No spam. Unsubscribe anytime.</p>
          </form>
        )}

        {/* STEP 2 (expanded below Step 1) */}
        {expanded && (
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-3" id="seller-step2">
            <h3 className="text-lg sm:text-xl font-semibold">Step 2 · Your Details & Timing</h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Keep Step 1 fields visible & editable */}
              <div>
                <label className="block text-sm font-medium">Street Number</label>
                <input
                  name="streetNumber" value={form.streetNumber} onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  placeholder="123" inputMode="numeric" autoComplete="address-line1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Street Name</label>
                <input
                  name="streetName" value={form.streetName} onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  placeholder="Main St" autoComplete="address-line1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Bedrooms</label>
                <select
                  name="bedrooms" value={form.bedrooms} onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Select…</option>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Bathrooms</label>
                <select
                  name="bathrooms" value={form.bathrooms} onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Select…</option>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                </select>
              </div>

              {/* Condition */}
              <div className="md:col-span-2">
                <div className="flex items-end justify-between">
                  <label className="block text-sm font-medium" id="cond-desc">
                    Overall Condition (1–10)
                  </label>
                  <div className="text-sm font-semibold text-emerald-700" aria-live="polite">
                    {form.condition}
                  </div>
                </div>
                <input
                  type="range" name="condition" min="1" max="10" value={form.condition}
                  onChange={update} className="mt-3 w-full" aria-describedby="cond-desc"
                />
                <div className="mt-2 text-xs text-gray-500">1 Very poor · 5 Average · 10 Pristine</div>
              </div>

              {/* Upgrades */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium" id="up-desc">Level of Upgrades (1–10)</label>
                <input
                  type="range" name="upgrades" min="1" max="10" value={form.upgrades}
                  onChange={update} className="mt-3 w-full" aria-describedby="up-desc"
                />
                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600">
                  <div><span className="font-semibold">1–2</span> Original / mostly original</div>
                  <div><span className="font-semibold">3–4</span> Minor cosmetic / few rooms</div>
                  <div><span className="font-semibold">5–6</span> Several rooms updated</div>
                  <div><span className="font-semibold">7–8</span> Mostly updated, consistent</div>
                  <div><span className="font-semibold">9–10</span> Fully renovated, high-end</div>
                </div>
              </div>

              {/* Estimate & notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  What do you think your home is worth? <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  name="estimate" value={form.estimate} onChange={update}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  placeholder="$900,000" inputMode="decimal" autoComplete="off"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Recent improvements we should know about <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="improvements" value={form.improvements} onChange={update} rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  placeholder="Roof 2021, furnace 2020, new flooring main level..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Unique features <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="features" value={form.features} onChange={update} rows={2}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  placeholder="Pie lot, backs onto ravine, legal basement apartment..."
                />
              </div>

              {/* Contact (First & Last required) */}
              <div>
                <label className="block text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName" value={form.firstName} onChange={update} required
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName" value={form.lastName} onChange={update} required
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                  autoComplete="family-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone" value={form.phone} onChange={update}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                    fieldErrors.phone ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                  }`} placeholder="(###) ###-####" inputMode="tel" autoComplete="tel"
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email" type="email" value={form.email} onChange={update}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                    fieldErrors.email ? "border-red-400 focus:ring-red-500" : "focus:ring-emerald-600"
                  }`} placeholder="you@example.com" inputMode="email" autoComplete="email"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              {/* Timing */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">How soon might you consider a move?</label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                  {["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"].map((label) => (
                    <label key={label}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 whitespace-normal break-words ${
                        form.timeline === label ? "ring-2 ring-emerald-600" : "hover:bg-gray-50"
                      }`}>
                      <input type="radio" name="timeline" value={label}
                        checked={form.timeline === label} onChange={update}/>
                      <span className="leading-snug">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Towns */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Which NorthSide GTA towns are you most interested in moving to?
                </label>
                <p className="text-xs text-gray-500 mt-1">Select up to 7.</p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {TOWNS.map((town) => {
                    const checked = form.towns.includes(town);
                    return (
                      <label key={town}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                          checked ? "ring-2 ring-emerald-600" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTown(town)}
                        />
                        <span>{town}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Honeypot + tracking */}
              <input name="nickname" value={form.nickname} onChange={update} className="hidden" tabIndex="-1" autoComplete="off" />
              <input type="hidden" name="utm_source" value={utm.get("utm_source") || ""} readOnly />
              <input type="hidden" name="utm_campaign" value={utm.get("utm_campaign") || ""} readOnly />
              <input type="hidden" name="device" value={device} readOnly />

              {/* Confirmations */}
              <div className="md:col-span-2 space-y-3 mt-2">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    data-testid="not-under-contract" type="checkbox" name="notUnderContract"
                    checked={form.notUnderContract} onChange={update} className="mt-1"
                  />
                  <span>
                    <span className="font-medium">
                      I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate Brokerage.
                    </span>
                    <span className="block text-gray-500 text-xs mt-1">Required — without this confirmation, we cannot provide a home analysis.</span>
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
                  className="w-full rounded-xl text-white font-semibold px-4 py-3 disabled:opacity-50 hover:opacity-95"
                  style={{ background: "linear-gradient(135deg, #31610d 0%, #23470a 100%)" }}
                >
                  {sending ? "Sending…" : "Get My Home Value"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

// ===== Page shell =====
export default function SellersPage() {
  return (
    <>
      <Navigation />
      <Helmet>
  <title>Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing</title>
  <meta
    name="description"
    content="Thinking of selling in the NorthSide GTA? Get AI-backed pricing, pro staging, premium media, and negotiation that wins—serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog."
  />
  <link rel="canonical" href="https://www.northsidegta.ca/sellers" />
  <meta name="robots" content="index,follow" />

  <meta
    name="keywords"
    content="sell my home NorthSide GTA, list my home Georgina, list my home East Gwillimbury, sell house Newmarket, sell house Aurora, sell house Stouffville, sell house Uxbridge, sell house Scugog, home marketing, real estate agent"
  />

  {/* Open Graph */}
  <meta property="og:title" content="Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing" />
  <meta
    property="og:description"
    content="AI market analysis, prep support, premium media, and top-tier negotiation across Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.northsidegta.ca/sellers" />
  <meta property="og:image" content="https://www.northsidegta.ca/Images/northsidegta-map-bg.jpg" />

  {/* JSON-LD */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing",
      "url": "https://www.northsidegta.ca/sellers",
      "description":
        "Full-service selling strategy with AI pricing, pro staging, premium media, and expert negotiation.",
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

      <div className="space-y-14 px-4 md:px-20 py-12">
        {/* HERO */}
        <section className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Sell Like a Pro — With Finally Home Agents in Your Corner
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Like an athlete with a great agent, you get strategy, preparation, and negotiations that win — not guesswork.
          </p>
        </section>

        {/* Two-step unified form card (now with map background + gradient buttons) */}
        <SellerLeadCapture />

        {/* Slim horizontal timeline (kept) */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-semibold">Your Selling Game Plan</h2>
            <span className="text-xs text-slate-500">Lean, effective, proven</span>
          </div>
          <div className="relative">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-3 min-w-[680px]">
                {timeline.map((s, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700">{s.icon}</span>
                      <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{s.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* See Us in Action (videos kept) */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">See Us in Action</h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            A glimpse of the VIP media treatment every listing receives.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((v, idx) => (
              <Card key={idx} className="overflow-hidden flex flex-col p-0">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={v.embed}
                    title={v.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="text-lg font-semibold px-5 py-5">{v.title}</h3>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
