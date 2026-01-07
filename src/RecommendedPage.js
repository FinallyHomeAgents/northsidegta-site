import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import { getFormEndpoint } from "./components/contact/contactConfig";
import { GOOGLE_REVIEWS } from "./components/reviews/GoogleGradientReviews";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOWN_OPTIONS = [
  "Uxbridge",
  "Stouffville",
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Scugog",
  "Other",
];

const TOWN_LINKS = [
  { label: "Uxbridge", slug: "uxbridge" },
  { label: "Stouffville", slug: "stouffville" },
  { label: "Georgina", slug: "georgina" },
  { label: "East Gwillimbury", slug: "east-gwillimbury" },
  { label: "Newmarket", slug: "newmarket" },
  { label: "Aurora", slug: "aurora" },
  { label: "Scugog", slug: "scugog" },
];

const INTENT_OPTIONS = ["Buying", "Selling", "Exploring"];

const TIMELINE_OPTIONS = [
  "ASAP",
  "0–3 months",
  "3–6 months",
  "Just browsing",
];

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  town: "",
  intent: "Buying",
  timeline: "",
  notes: "",
  honeypot: "",
};

const phoneOk = (value) => value.replace(/\D/g, "").length >= 10;

function RecommendedLeadForm() {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  const utm = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const validations = useMemo(() => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Name is required.";
    }
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone is required.";
    } else if (!phoneOk(form.phone)) {
      errs.phone = "Enter a valid phone number.";
    }
    return errs;
  }, [form.name, form.email, form.phone]);

  const visibleErrors = showErrors ? validations : {};

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setShowErrors(false);
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (form.honeypot) return;

    if (Object.keys(validations).length > 0) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = new FormData();
      payload.append("form_name", "Recommended Lead");
      payload.append("_subject", "Recommended Lead Submission");
      payload.append("page_route", "/recommended");
      payload.append("lead_name", form.name.trim());
      payload.append("lead_phone", form.phone.trim());
      payload.append("lead_email", form.email.trim());
      payload.append("_replyto", form.email.trim());
      if (form.town) payload.append("town", form.town);
      if (form.intent) payload.append("intent", form.intent);
      if (form.timeline) payload.append("timeline", form.timeline);
      if (form.notes.trim()) payload.append("notes", form.notes.trim());

      if (typeof window !== "undefined") {
        payload.append("source_url", window.location.href);
      }
      payload.append("submitted_at", new Date().toISOString());

      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        const value = utm.get(key);
        if (value) payload.append(key, value);
      });

      const response = await fetch(formEndpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSuccess(true);
      resetForm();
    } catch (error) {
      setSubmitError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 transition-all duration-700">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 text-emerald-900 shadow-lg shadow-emerald-100/60">
          <h3 className="text-2xl font-semibold">Thanks — your details are in.</h3>
          <p className="mt-3 text-emerald-800">
            We’ll review and follow up shortly to confirm a time to talk.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            resetForm();
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Name<span className="text-rose-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {visibleErrors.name && (
          <p className="mt-1 text-xs text-rose-600">{visibleErrors.name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone<span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {visibleErrors.phone && (
            <p className="mt-1 text-xs text-rose-600">{visibleErrors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email<span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {visibleErrors.email && (
            <p className="mt-1 text-xs text-rose-600">{visibleErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="town">
          Town
        </label>
        <select
          id="town"
          name="town"
          value={form.town}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select a town</option>
          {TOWN_OPTIONS.map((town) => (
            <option key={town} value={town}>
              {town}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Buying / Selling / Exploring</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {INTENT_OPTIONS.map((option) => (
            <label
              key={option}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                form.intent === option
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              <input
                type="radio"
                name="intent"
                value={option}
                checked={form.intent === option}
                onChange={updateField}
                className="h-4 w-4"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="timeline">
          Timeline
        </label>
        <select
          id="timeline"
          name="timeline"
          value={form.timeline}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select timeline</option>
          {TIMELINE_OPTIONS.map((timeline) => (
            <option key={timeline} value={timeline}>
              {timeline}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="notes">
          Tell us anything else (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={updateField}
          rows={4}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <input
        type="text"
        name="honeypot"
        value={form.honeypot}
        onChange={updateField}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-green px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand-green/30 transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
        >
          {submitting ? "Sending…" : "Send My Details"}
        </button>
      </div>
    </form>
  );
}

export default function RecommendedPage() {
  const reviews = useMemo(() => GOOGLE_REVIEWS.slice(0, 4), []);

  return (
    <>
      <Helmet>
        <title>Recommended Realtor in Uxbridge, Stouffville, Georgina & the NorthSide GTA</title>
        <meta
          name="description"
          content="Tagged in a Facebook thread? Connect with Matthew & Landon Mulhall — trusted NorthSide GTA Sales Representatives serving Uxbridge, Stouffville, Georgina, Newmarket, Aurora and more."
        />
        <meta
          property="og:title"
          content="Recommended Realtor in Uxbridge, Stouffville, Georgina & the NorthSide GTA"
        />
        <meta
          property="og:description"
          content="Tagged in a Facebook thread? Connect with Matthew & Landon Mulhall — trusted NorthSide GTA Sales Representatives serving Uxbridge, Stouffville, Georgina, Newmarket, Aurora and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/recommended" />
        <meta property="og:image" content="/Images/og-home.jpg" />
        <meta property="og:image:alt" content="NorthSide GTA map with service areas" />
        <link rel="canonical" href="https://www.northsidegta.ca/recommended" />
      </Helmet>

      <HeaderShell />

      <main className="bg-white text-slate-900">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-soft-light"
            style={{ backgroundImage: "url('/Images/northsidegta-map-bg.jpg')" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.35),_transparent_60%)]" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:min-h-[80vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/80">
                  Recommended by Facebook
                </p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  NorthSide GTA real estate advice you can trust.
                </h1>
                <p className="text-lg text-emerald-100/90 sm:text-xl">
                  If you were tagged in a Facebook thread, you’re in the right place. We help buyers and sellers across Uxbridge, Stouffville, Georgina,
                  Newmarket, Aurora, and the broader NorthSide GTA.
                </p>
                <p className="text-base text-emerald-100/80">
                  Trusted local specialists with concierge-level care and rapid response.
                </p>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-200/80">
                  We’ll reply quickly and guide you step-by-step.
                </p>
                <div className="rounded-2xl bg-white/10 p-4 sm:p-5 lg:bg-white/15">
                  <div className="flex flex-col gap-3 text-sm text-emerald-100 sm:flex-row sm:flex-wrap">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-[#FBBC05]">
                        <StarIcon />
                        <StarIcon />
                        <StarIcon />
                        <StarIcon />
                        <StarIcon />
                      </span>
                      Google ★★★★★
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-2">
                      Serving the NorthSide GTA
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-2">
                      HomeLife Optimum Realty
                    </span>
                  </div>
                </div>
              </div>

              <div
                id="leadForm"
                className="rounded-[32px] border border-emerald-100 bg-white p-6 text-slate-900 shadow-2xl shadow-emerald-900/20 sm:p-8"
              >
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">Get connected fast</h3>
                  <p className="text-sm text-slate-600">
                    Share a few details and we’ll follow up with the right next steps.
                  </p>
                </div>
                <div className="mt-6">
                  <RecommendedLeadForm />
                </div>
                <p className="mt-6 text-xs text-slate-500">
                  Your information is confidential and never shared.
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  Matthew &amp; Landon Mulhall • HomeLife Optimum Realty
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Local expertise without the local limits
              </h3>
              <ul className="space-y-3 text-base text-slate-700">
                {[
                  "Born-and-raised NorthSide GTA knowledge paired with modern market data.",
                  "Personalized guidance for buyers, sellers, and those just exploring.",
                  "Trusted by Facebook communities for clear, human answers.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Where we work</h3>
              <p className="text-base text-slate-600 sm:max-w-3xl">
                We focus on the NorthSide GTA towns you see in Facebook recommendations, plus nearby neighbourhoods and rural pockets.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOWN_LINKS.map((town) => (
                <Link
                  key={town.slug}
                  to={`/${town.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {town.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-3 text-center sm:text-left">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">What clients say</h3>
              <p className="text-base text-slate-600">A handful of recent reviews from NorthSide GTA clients.</p>
            </div>
            <ReviewsCarousel reviews={reviews} disclaimer="Verified client reviews" />
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">How we work</h3>
              <p className="text-base text-slate-600 sm:max-w-3xl">
                Clear steps, quick follow-up, and no pressure — just answers that help you decide what’s next.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Listen first",
                  detail: "We start by learning your goals, timeline, and what prompted the recommendation.",
                },
                {
                  title: "Share a plan",
                  detail: "We map out options across towns, pricing, and next steps tailored to you.",
                },
                {
                  title: "Stay available",
                  detail: "You get direct access to Matthew or Landon for follow-ups and updates.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60"
                >
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-emerald-950 py-14 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready for a quick intro call?</h3>
            <p className="text-base text-emerald-100/90">
              We’ll confirm timing, answer any questions, and point you in the right direction.
            </p>
            <a
              href="#leadForm"
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
            >
              Send My Details
            </a>
          </div>
        </section>

        <section className="bg-slate-50 py-10">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
            <p className="font-semibold text-slate-900">
              Finally Home Agents, a NorthSide GTA brand
            </p>
            <p className="mt-2">Matthew &amp; Landon Mulhall, Sales Representatives</p>
            <p className="mt-1">HomeLife Optimum Realty, Brokerage</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 fill-current"
    >
      <path d="M10 1.6l2.5 5.06 5.58.81-4.04 3.94.95 5.55L10 14.6l-4.99 2.36.95-5.55L1.92 7.47l5.58-.81L10 1.6z" />
    </svg>
  );
}
