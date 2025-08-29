// src/SellersPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "./Navigation";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import {
  HiChatAlt2,
  HiChartBar,
  HiOutlineCog,
  HiCamera,
  HiPaperAirplane,
  HiPencilAlt,
  HiKey,
} from "react-icons/hi";

/* ---------- helpers (same behavior as /homeanalysis) ---------- */
function emailOk(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}
function phoneOk(s) {
  const digits = String(s || "").replace(/\D+/g, "");
  return digits.length >= 10;
}
function clamp1to10(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 5;
  return Math.max(1, Math.min(10, x));
}

/* ---------- towns (multi-select) ---------- */
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

/* ---------- slim horizontal timeline (preserved) ---------- */
const timeline = [
  { title: "Never Too Early",       icon: <HiChatAlt2 className="w-6 h-6" />, copy: "Plan timing & pricing early." },
  { title: "AI Market Analysis",    icon: <HiChartBar className="w-6 h-6" />, copy: "Data-backed strategy." },
  { title: "Prep Support",          icon: <HiOutlineCog className="w-6 h-6" />, copy: "Pros lined up, fast." },
  { title: "Media & Marketing",     icon: <HiCamera className="w-6 h-6" />, copy: "Photo, drone, 3D, reels." },
  { title: "Launch Week",           icon: <HiPaperAirplane className="w-6 h-6" />, copy: "Max traffic, fast." },
  { title: "Offers & Negotiation",  icon: <HiPencilAlt className="w-6 h-6" />, copy: "Top price & terms." },
  { title: "Closing & Beyond",      icon: <HiKey className="w-6 h-6" />, copy: "We stay to the finish." },
];

/* ---------- videos (preserved) ---------- */
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

export default function SellersPage() {
  /* one unified form (same fields as /homeanalysis) */
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

  const [expanded, setExpanded] = useState(false); // Step 2 toggle
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "" });
  const errorRef = useRef(null);
  const formRef = useRef(null);
  const [startedAt] = useState(Date.now());

  /* UTM + device + Formspree (same approach as /homeanalysis) */
  const utm = useMemo(() => new URLSearchParams(window.location.search), []);
  const device = useMemo(
    () => (/Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop"),
    []
  );
  const formspreeId = useMemo(() => {
    const fromEnv = (process.env.REACT_APP_FORMSPREE_ID || "").trim();
    return fromEnv || "xblkwrzj";
  }, []);

  /* Step 1 required to expand */
  const step1Ok =
    !!form.streetNumber.trim() &&
    !!form.streetName.trim() &&
    !!form.bedrooms;

  /* required checks (same spirit as /homeanalysis) */
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
      Object.keys(requiredChecks).length) *
      100
  );

  /* unified update handler */
  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));

    if (name === "email") {
      setFieldErrors((fe) => ({
        ...fe,
        email: value && !emailOk(value) ? "Enter a valid email" : "",
      }));
    }
    if (name === "phone") {
      setFieldErrors((fe) => ({
        ...fe,
        phone: value && !phoneOk(value) ? "Enter a 10-digit phone number" : "",
      }));
    }
  }

  /* towns toggle (max 7, “None” logic) */
  function toggleTown(town) {
    setForm((f) => {
      const exists = f.towns.includes(town);
      let next = exists ? f.towns.filter((t) => t !== town) : [...f.towns, town];
      if (next.length > 7) next = next.slice(0, 7);
      if (town === "None" && !exists) next = ["None"];
      if (town !== "None" && next.includes("None")) {
        next = next.filter((t) => t !== "None");
      }
      return { ...f, towns: next };
    });
  }

  function onContinueStep1(e) {
    e.preventDefault();
    if (!step1Ok) {
      setError("Please complete Street Number, Street Name, and Bedrooms.");
      setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    setError("");
    setExpanded(true); // Step 2 slides in under Step 1
    setTimeout(() => {
      document
        .getElementById("seller-step2")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const emailErr = form.email
      ? emailOk(form.email)
        ? ""
        : "Enter a valid email"
      : "Email is required";
    const phoneErr = form.phone
      ? phoneOk(form.phone)
        ? ""
        : "Enter a 10-digit phone number"
      : "Phone is required";
    setFieldErrors({ email: emailErr, phone: phoneErr });

    if (Date.now() - startedAt < 1200) return; // bot guard
    if (!formspreeId) {
      setError(
        "Formspree Form ID is missing. Add REACT_APP_FORMSPREE_ID to your .env file."
      );
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
        const msg =
          body?.errors?.[0]?.message ||
          body?.message ||
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "seller_submit" });
        if (window.fbq) window.fbq("trackCustom", "SellerSubmit");
      } catch {}

      setDone(true);
      setTimeout(() => (window.location.href = "/"), 1200);
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
      <>
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
          <p className="mt-3 text-gray-600">
            We’ll follow up shortly with your pricing roadmap and next steps.
          </p>
        </main>
      </>
    );
  }

  const timelineOptions = ["Now", "1–3 Months", "4–6 Months", "7–12 Months", "Longer"];

  return (
    <>
      <Navigation />

      <div className="space-y-14 px-4 md:px-20 py-12">
        {/* HERO */}
        <section className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Sell Like a Pro — With Finally Home Agents in Your Corner
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Like an athlete with a great agent, you get strategy, preparation, and negotiations that win — not guesswork.
          </p>

          {/* Slim pill benefits */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              "NorthSide GTA Specialists",
              "AI-Powered Market Analysis",
              "Premium Media & Marketing",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 text-xs font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ATTACHED PROGRESS */}
        <div className="mx-auto max-w-6xl -mb-2">
          <div className="rounded-t-2xl rounded-b-md border border-emerald-200 bg-white/80 backdrop-blur-sm shadow-sm p-2">
            <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${Math.max(6, progressPct)}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-1 text-right text-[11px] text-emerald-700 font-medium">
              {progressPct}% complete
            </div>
          </div>
        </div>

        {/* UNIFIED FORM (Step 1 stays; Step 2 expands below) */}
        <form id="seller-form" ref={formRef} onSubmit={onSubmit}>
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

          {/* Step 1 */}
          <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">
                Step 1 · Property Details
              </h2>
              {!expanded && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                  ~2 min
                </span>
              )}
            </div>

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
                >
                  <option value="">Select…</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </div>
            </div>

            {!expanded && (
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="font-bold"
                  onClick={onContinueStep1}
                >
                  Continue
                </Button>
                <a
                  href="https://wa.me/16476684646?text=Hi%20Finally%20Home%20Agents%2C%20I%27d%20like%20a%20pricing%20plan%20for%20my%20home."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 font-semibold"
                >
                  WhatsApp (fast)
                </a>
                <p className="text-[11px] text-slate-500 sm:ml-auto">No spam. Unsubscribe anytime.</p>
              </div>
            )}
          </section>

          {/* Step 2 (expands under Step 1) */}
          {expanded && (
            <section
              id="seller-step2"
              className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border mt-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold">
                Step 2 · Your Details & Timing
              </h2>

              <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4">
                {/* Condition + Upgrades sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-end justify-between">
                      <label className="block text-sm font-medium" id="cond-desc">
                        Overall Condition (1–10)
                      </label>
                      <div className="text-sm font-semibold text-emerald-700" aria-live="polite">
                        {form.condition}
                      </div>
                    </div>
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
                    <div className="mt-2 text-xs text-gray-500">
                      1 Very poor · 5 Average · 10 Pristine
                    </div>
                  </div>

                  <div>
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
                </div>

                {/* Estimate */}
                <div>
                  <label className="block text-sm font-medium">
                    What do you think your home is worth?{" "}
                    <span className="text-gray-400">(optional)</span>
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
                <div>
                  <label className="block text-sm font-medium">
                    Recent improvements we should know about{" "}
                    <span className="text-gray-400">(optional)</span>
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
                <div>
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

                {/* Personal + contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                    )}
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
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* timing */}
                <div>
                  <label className="block text-sm font-medium">
                    How soon might you consider a move?
                  </label>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                    {timelineOptions.map((label) => (
                      <label
                        key={label}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 whitespace-normal break-words ${
                          form.timeline === label ? "ring-2 ring-emerald-600" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeline"
                          value={label}
                          checked={form.timeline === label}
                          onChange={update}
                        />
                        <span className="leading-snug">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Towns */}
                <div>
                  <label className="block text-sm font-medium">
                    Which NorthSide GTA towns are you most interested in moving to?
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Select up to 7.</p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {TOWNS.map((town) => {
                      const checked = form.towns.includes(town);
                      return (
                        <label
                          key={town}
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

                {/* honeypot + tracking */}
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={update}
                  className="hidden"
                  tabIndex="-1"
                  autoComplete="off"
                />
                <input
                  type="hidden"
                  name="utm_source"
                  value={utm.get("utm_source") || ""}
                  readOnly
                />
                <input
                  type="hidden"
                  name="utm_campaign"
                  value={utm.get("utm_campaign") || ""}
                  readOnly
                />
                <input type="hidden" name="device" value={device} readOnly />

                {/* confirmations */}
                <div className="space-y-3">
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
                        I confirm that I am <span className="underline">not</span> currently under contract with another Real Estate Brokerage.
                      </span>
                      <span className="block text-gray-500 text-xs mt-1">
                        Required — without this confirmation, we cannot provide a home analysis.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={form.consent}
                      onChange={update}
                      className="mt-1"
                    />
                    <span>
                      I agree to be contacted by Finally Home Agents about my home analysis.
                      <span className="block text-gray-500 text-xs">
                        You can unsubscribe anytime. We respect your privacy.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="mt-2">
                  <button
                    disabled={!requiredOk || sending}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Get My Home Value"}
                  </button>
                </div>
              </div>

              {/* Slim reviews under the expanded form */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
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
            </section>
          )}

          {/* sticky CTA on mobile */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 md:hidden">
            <button
              form="seller-form"
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold"
              disabled={!requiredOk || sending}
            >
              {sending ? "Sending…" : "Get My Home Value"}
            </button>
          </div>
        </form>

        {/* Slim horizontal timeline */}
        <section className="mt-10">
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

        {/* SEE US IN ACTION (preserved) */}
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
