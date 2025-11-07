import React, { useState, useMemo, useRef } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import Card from "./components/ui/Card";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";

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

const SELLER_PILLARS = [
  { icon: "⏱️", text: "Takes less than 1 minute" },
  { icon: "✅", text: "No spam, no obligation" },
  { icon: "🔒", text: "Secure & private" },
  { icon: "📍", text: "Local market experts" },
];

const baseFieldClass =
  "mt-1 w-full rounded-xl border border-emerald-200/60 bg-white/80 px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

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

const CheckIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

function SellerHero() {
  return (
    <section className="relative overflow-hidden bg-[#04110c] text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_65%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-40%] right-[-15%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/25 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1900px] px-4 pb-36 pt-24 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
            NorthSide GTA Seller Strategy
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.8rem]">
            Sell Like a Pro — With Finally Home Agents in Your Corner
          </h1>
          <p className="mt-4 text-lg text-emerald-100/90 sm:text-xl">
            Like an athlete with a great agent, you get strategy, preparation, and negotiations that win — not guesswork.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-emerald-100/90">
          {SELLER_PILLARS.map((pill) => (
            <span
              key={pill.text}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-medium backdrop-blur"
            >
              <span>{pill.icon}</span>
              {pill.text}
            </span>
          ))}
        </div>
      </div>
    </section>
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
      <section className="relative mx-auto w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-[40px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,118,110,0.18)] backdrop-blur md:p-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
            style={{
              backgroundImage: `url('${BG_IMAGE}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-teal-100/70"
            aria-hidden
          />

          <div className="relative z-10 space-y-6 text-slate-900">
            <div className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckIcon className="h-5 w-5" />
                <h3 className="text-xl font-bold md:text-2xl">Thanks! You’ve unlocked priority support.</h3>
              </div>
              <p className="mt-2 text-sm text-slate-700 md:text-base">
                We’re reviewing your home now. For faster back-and-forth, connect with us on WhatsApp.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
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
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-[#25D366] via-[#1fc559] to-[#1ebe57] px-4 py-3 font-semibold text-white shadow-lg transition hover:from-[#1fc559] hover:via-[#1ebe57] hover:to-[#18a649] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Connect on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-emerald-200 bg-white/90 p-5 text-slate-900 shadow-sm backdrop-blur">
                <p className="text-sm italic text-slate-700 md:text-base">
                  “Finally Home Agents exceeded our expectations when selling our home in Holland Landing. Their professionalism and personal attention set them apart.”
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-800">— Susan Booth</p>
              </Card>
              <Card className="border border-emerald-200 bg-white/90 p-5 text-slate-900 shadow-sm backdrop-blur">
                <p className="text-sm italic text-slate-700 md:text-base">
                  “Matt sold our house above market and negotiated our forever home for less. Highly recommend.”
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-800">— Arron Breen</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const timelineOptions = ["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"];

  return (
    <section className="relative mx-auto w-full max-w-5xl">
      <div className="relative overflow-hidden rounded-[40px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,118,110,0.18)] backdrop-blur md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
          style={{
            backgroundImage: `url('${BG_IMAGE}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-teal-100/70"
          aria-hidden
        />

        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-emerald-800">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em]">
              NorthSide GTA Seller Strategy
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Unlock Your Personalized Home Sale Plan
          </h3>
          <p className="mt-2 text-slate-800">
            Start with your address — we’ll craft your pricing roadmap, prep plan, and marketing strategy.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {SELLER_PILLARS.map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/90 px-3 py-1 text-[12px] font-semibold text-emerald-900 shadow-sm backdrop-blur"
              >
                <span>{p.icon}</span> {p.text}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[11px] font-medium text-emerald-700">
              {progressPct}% complete
            </div>
          </div>

          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="mt-4 rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-700 shadow-sm backdrop-blur"
            >
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {!expanded && (
            <form onSubmit={continueToStep2} className="mt-6 grid grid-cols-1 gap-4">
              <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">Step 1 · Property Details</h4>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Street Number</span>
                  <input
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={update}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="address-line1"
                    className={baseFieldClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Street Name</span>
                  <input
                    name="streetName"
                    value={form.streetName}
                    onChange={update}
                    placeholder="Main St"
                    autoComplete="address-line1"
                    className={baseFieldClass}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Bedrooms</span>
                  <select
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={update}
                    className={baseFieldClass}
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
                  <span className="text-sm font-medium text-slate-900">Bathrooms</span>
                  <select
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={update}
                    className={baseFieldClass}
                  >
                    <option value="">Select…</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-xl shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-emerald-50"
              >
                Continue to Step 2
              </button>

              <p className="text-[11px] text-slate-700">No spam. Unsubscribe anytime.</p>
            </form>
          )}

          {/* STEP 2 (expanded below Step 1) */}
          {expanded && (
            <form onSubmit={onSubmit} className="mt-6" id="seller-step2">
              <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">Step 2 · Your Details & Timing</h4>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Street Number</span>
                  <input
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={update}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="address-line1"
                    className={baseFieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Street Name</span>
                  <input
                    name="streetName"
                    value={form.streetName}
                    onChange={update}
                    placeholder="Main St"
                    autoComplete="address-line1"
                    className={baseFieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Bedrooms</span>
                  <select
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={update}
                    className={baseFieldClass}
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
                  <span className="text-sm font-medium text-slate-900">Bathrooms</span>
                  <select
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={update}
                    className={baseFieldClass}
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
                  <span className="text-sm font-medium text-slate-900">Overall condition today</span>
                  <input
                    type="range"
                    name="condition"
                    min="1"
                    max="10"
                    value={form.condition}
                    onChange={update}
                    className="mt-2 h-2 w-full appearance-none rounded-full bg-emerald-100 [accent-color:#059669]"
                  />
                  <div className="mt-1 text-xs text-slate-600">{form.condition}/10</div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Recent upgrades</span>
                  <input
                    type="range"
                    name="upgrades"
                    min="1"
                    max="10"
                    value={form.upgrades}
                    onChange={update}
                    className="mt-2 h-2 w-full appearance-none rounded-full bg-emerald-100 [accent-color:#059669]"
                  />
                  <div className="mt-1 text-xs text-slate-600">{form.upgrades}/10</div>
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm font-medium text-slate-900">Estimated value today (if you have one)</span>
                  <input
                    name="estimate"
                    value={form.estimate}
                    onChange={update}
                    placeholder="$1,250,000"
                    className={baseFieldClass}
                  />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm font-medium text-slate-900">Any planned improvements before selling?</span>
                  <textarea
                    name="improvements"
                    value={form.improvements}
                    onChange={update}
                    placeholder="Kitchen refresh, repainting, etc."
                    className={`${baseFieldClass} min-h-[110px]`}
                  />
                </label>
                <label className="md:col-span-2 block">
                  <span className="text-sm font-medium text-slate-900">Standout features or upgrades we should know about?</span>
                  <textarea
                    name="features"
                    value={form.features}
                    onChange={update}
                    placeholder="E.g. walkout basement, new roof, EV charger"
                    className={`${baseFieldClass} min-h-[110px]`}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">First Name</span>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={update}
                    placeholder="Jordan"
                    className={baseFieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Last Name</span>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={update}
                    placeholder="Taylor"
                    className={baseFieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Phone</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={update}
                    placeholder="647-555-1212"
                    className={`${baseFieldClass} ${
                      fieldErrors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-400/60"
                        : ""
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  )}
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-900">Email</span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="you@email.com"
                    className={`${baseFieldClass} ${
                      fieldErrors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-400/60"
                        : ""
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </label>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900">
                    How soon might you consider a move?
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-5">
                    {timelineOptions.map((label) => {
                      const checked = form.timeline === label;
                      return (
                        <label
                          key={label}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                            checked
                              ? "border-emerald-500 bg-white text-emerald-800 shadow-sm"
                              : "border-emerald-200/70 bg-white/80 text-slate-700 hover:border-emerald-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeline"
                            value={label}
                            checked={checked}
                            onChange={update}
                            className="h-4 w-4 border-emerald-200 text-emerald-600 focus:ring-emerald-500/30"
                          />
                          <span className="leading-snug">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Which NorthSide GTA towns are you most interested in moving to?
                  </label>
                  <p className="mt-1 text-xs text-slate-600">Select up to 7.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {TOWNS.map((town) => {
                      const checked = form.towns.includes(town);
                      return (
                        <label
                          key={town}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-emerald-500 bg-white text-emerald-800 shadow-sm"
                              : "border-emerald-200/70 bg-white/80 text-slate-700 hover:border-emerald-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTown(town)}
                            className="h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500/30"
                          />
                          <span>{town}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <input
                name="nickname"
                value={form.nickname}
                onChange={update}
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />
              <input type="hidden" name="utm_source" value={utm.get("utm_source") || ""} readOnly />
              <input type="hidden" name="utm_campaign" value={utm.get("utm_campaign") || ""} readOnly />
              <input type="hidden" name="device" value={device} readOnly />

              <div className="mt-4 space-y-3 text-sm text-slate-900">
                <label className="flex items-start gap-2">
                  <input
                    data-testid="not-under-contract"
                    type="checkbox"
                    name="notUnderContract"
                    checked={form.notUnderContract}
                    onChange={update}
                    className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500/30"
                    required
                  />
                  <span>
                    <span className="font-medium">
                      I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate Brokerage.
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      Required — without this confirmation, we cannot provide a home analysis.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={update}
                    className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500/30"
                    required
                  />
                  <span>
                    I agree to be contacted by Finally Home Agents about my home analysis.
                    <span className="block text-xs text-slate-600">You can unsubscribe anytime. We respect your privacy.</span>
                  </span>
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!requiredOk || sending}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-xl shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:from-emerald-400 disabled:to-emerald-400 disabled:opacity-70"
                >
                  {sending ? "Sending…" : "Get My Home Value"}
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-700">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function SellerTimeline() {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,118,110,0.14)] backdrop-blur md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-teal-100/60"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Your Selling Game Plan</h2>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700/90">
            Lean, effective, proven
          </span>
        </div>
        <div className="mt-6 overflow-x-auto hide-scrollbar">
          <div className="flex min-w-[680px] gap-3">
            {timeline.map((s, i) => (
              <div
                key={i}
                className="flex-1 min-w-[220px] rounded-2xl border border-emerald-200/70 bg-white/90 p-4 shadow-sm transition hover:border-emerald-300"
              >
                <div className="flex items-center gap-2 text-emerald-700">
                  <span>{s.icon}</span>
                  <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
                </div>
                <p className="mt-2 text-xs text-slate-600">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SellerMediaSection() {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-emerald-200/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,118,110,0.14)] backdrop-blur md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white to-teal-100/60"
        aria-hidden
      />
      <div className="relative z-10 space-y-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-slate-900">See Us in Action</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            A glimpse of the VIP media treatment every listing receives.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {videos.map((v, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border border-emerald-200/70 bg-white/90 p-0 shadow-lg backdrop-blur transition hover:border-emerald-300"
            >
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={v.embed}
                  title={v.title}
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="px-5 py-5 text-lg font-semibold text-slate-900">{v.title}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Page shell =====
export default function SellersPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <DynamicMetaTags
        route="/sellers"
        documentTitle="Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing"
        title="Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing"
        description="Thinking of selling in the NorthSide GTA? Get AI-backed pricing, pro staging, premium media, and negotiation that wins—serving Georgina, East Gwillimbury, Newmarket, Aurora, Stouffville, Uxbridge, and Scugog."
        canonicalUrl="https://www.northsidegta.ca/sellers"
        ogType="website"
        ogImage="https://www.northsidegta.ca/Images/northsidegta-map-bg.jpg"
        twitterCard="summary_large_image"
        twitterImage="https://www.northsidegta.ca/Images/northsidegta-map-bg.jpg"
        additionalMeta={[
          { name: "robots", content: "index,follow" },
          {
            name: "keywords",
            content:
              "sell my home NorthSide GTA, list my home Georgina, list my home East Gwillimbury, sell house Newmarket, sell house Aurora, sell house Stouffville, sell house Uxbridge, sell house Scugog, home marketing, real estate agent",
          },
        ]}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Sell Your Home for More in the NorthSide GTA | Strategy, Staging & Marketing",
            url: "https://www.northsidegta.ca/sellers",
            description:
              "Full-service selling strategy with AI pricing, pro staging, premium media, and expert negotiation.",
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
              url: "https://www.northsidegta.ca",
              brand: "Finally Home Agents",
            },
          })}
        </script>
      </DynamicMetaTags>

      <main>
        <SellerHero />
        <div className="relative z-10 -mt-20 px-4 pb-24 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <SellerLeadCapture />
            <SellerTimeline />
            <SellerMediaSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
