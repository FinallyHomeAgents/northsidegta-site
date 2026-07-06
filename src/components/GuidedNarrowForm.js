import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const TOWNS = [
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Stouffville",
  "Uxbridge",
  "Scugog",
];

const PRICE_RANGES = [
  "Under $800K",
  "$800K–$1.1M",
  "$1.1M–$1.5M",
  "$1.5M–$2M",
  "$2M+",
];

const BEDROOMS = ["2+", "3+", "4+", "5+"];

const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "6+ months"];

const DEFAULT_FORMSPREE_ID = "xanbzajw";

export default function GuidedNarrowForm({ guidedPath, source = "homepage" }) {
  const [towns, setTowns] = useState([]);
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [represented, setRepresented] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const emailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const phoneValid = useMemo(() => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, [phone]);

  const isRepresented = represented === "yes";
  const canSubmit =
    represented === "no" &&
    emailValid &&
    name.trim().length > 1 &&
    phoneValid &&
    !submitting;

  const toggleTown = (town) => {
    setTowns((prev) => {
      if (prev.includes(town)) {
        return prev.filter((item) => item !== town);
      }
      return [...prev, town];
    });
  };

  const handleRepresentedChange = (value) => {
    setRepresented(value);
    if (value === "yes") {
      setName("");
      setEmail("");
      setPhone("");
    }
  };

  const device = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
      ? "mobile"
      : "desktop";

  const chipClasses = (selected) =>
    [
      "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-semibold transition",
      selected
        ? "border-emerald-500 bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,45,12,0.3)]"
        : "border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
    ].join(" ");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please complete the required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("guidedPath", `${guidedPath.title} (${guidedPath.slug})`);
      payload.append("guidedPathSlug", guidedPath.slug);
      payload.append("guidedPathTitle", guidedPath.title);
      payload.append("towns", towns.join(", "));
      payload.append("priceRange", priceRange);
      payload.append("bedrooms", bedrooms);
      payload.append("timeline", timeline);
      payload.append("notes", notes);
      payload.append("source", source);
      payload.append("device", device());
      payload.append("name", name);
      payload.append("email", email);
      if (phone.trim()) payload.append("phone", phone.trim());
      payload.append("represented", represented || "no");

      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        const value = params.get(key);
        if (value) payload.append(key, value);
      });

      const response = await fetch(`https://formspree.io/f/${DEFAULT_FORMSPREE_ID}`, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Network error");
      setDone(true);
    } catch (submitError) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!done) return undefined;
    const timeout = setTimeout(() => {
      navigate("/");
    }, 7000);
    return () => clearTimeout(timeout);
  }, [done, navigate]);

  if (done) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(12,35,18,0.12)]">
        <h2 className="text-2xl font-semibold text-emerald-950">
          Thanks — we’ll review this and follow up with a tailored NorthSide GTA shortlist.
        </h2>
        <p className="mt-2 text-sm text-emerald-900/80">
          You’ll hear from Matthew or Landon.
        </p>
        <p className="mt-2 text-sm text-emerald-900/70">
          You’ll be returned to the homepage shortly.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          Return now
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-[28px] border border-emerald-200/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(12,35,18,0.12)]"
    >
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-emerald-950">Narrow it down</h2>
        <p className="text-sm text-emerald-900/70">
          Use the filters below to help us build a focused, high-quality shortlist.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-emerald-950">Towns</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOWNS.map((town) => (
              <button
                key={town}
                type="button"
                className={chipClasses(towns.includes(town))}
                aria-pressed={towns.includes(town)}
                onClick={() => toggleTown(town)}
              >
                {town}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-950">Price range</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={chipClasses(priceRange === range)}
                aria-pressed={priceRange === range}
                onClick={() => setPriceRange(priceRange === range ? "" : range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-950">Bedrooms</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BEDROOMS.map((count) => (
              <button
                key={count}
                type="button"
                className={chipClasses(bedrooms === count)}
                aria-pressed={bedrooms === count}
                onClick={() => setBedrooms(bedrooms === count ? "" : count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-950">Timeline</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIMELINES.map((label) => (
              <button
                key={label}
                type="button"
                className={chipClasses(timeline === label)}
                aria-pressed={timeline === label}
                onClick={() => setTimeline(timeline === label ? "" : label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-950">
            The more context you share, the more precisely we can tailor your shortlist.
          </p>
          <textarea
            className="mt-3 w-full rounded-2xl border border-emerald-200/80 bg-white px-4 py-3 text-sm text-emerald-950 placeholder-emerald-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Lifestyle details, must-haves, and deal-breakers are especially helpful."
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
        <p className="text-sm font-semibold text-emerald-950">
          Are you currently represented by another real estate brokerage?
        </p>
        <div className="flex flex-wrap gap-3">
          {["no", "yes"].map((option) => (
            <label
              key={option}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                represented === option
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300"
              }`}
            >
              <input
                type="radio"
                name="represented"
                value={option}
                className="sr-only"
                checked={represented === option}
                onChange={() => handleRepresentedChange(option)}
              />
              {option}
            </label>
          ))}
        </div>

        {isRepresented ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 text-sm text-emerald-900/80">
            We take representation seriously and only work with clients we can fully advise and
            advocate for. If you’re currently represented, we won’t proceed further — but you’re
            always welcome to explore the NorthSide GTA resources on our site.
            <div className="mt-3">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 transition hover:bg-emerald-50"
              >
                Back to homepage
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {!isRepresented ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-emerald-950">
              Name
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-emerald-200/80 bg-white px-4 py-2 text-sm text-emerald-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-semibold text-emerald-950">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-emerald-200/80 bg-white px-4 py-2 text-sm text-emerald-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-semibold text-emerald-950 md:col-span-2">
              Phone (optional)
              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-emerald-200/80 bg-white px-4 py-2 text-sm text-emerald-950 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="416-555-1234"
                aria-describedby="guided-phone-helper"
              />
              <span id="guided-phone-helper" className="mt-2 block text-xs font-normal text-emerald-700/70">
                If you’d like us to follow up by call or text.
              </span>
              {!phoneValid ? (
                <span className="mt-2 block text-xs font-normal text-rose-600">
                  Please enter a valid phone number.
                </span>
              ) : null}
            </label>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-[0_10px_30px_rgba(16,45,12,0.35)] transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
          >
            {submitting ? "Sending..." : "Request my shortlist"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
