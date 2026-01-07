import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import { getFormEndpoint } from "./components/contact/contactConfig";
import SellerMediaSection from "./components/sellers/SellerMediaSection";
import SellerReviewsSection from "./components/sellers/SellerReviewsSection";
import teamMembers from "./data/teamMembers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROPERTY_TYPES = ["Detached", "Semi", "Town", "Condo", "Rural"];
const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"];
const CONDITION_OPTIONS = ["Updated", "Good", "Needs work"];
const TIMELINE_OPTIONS = [
  { label: "Ready Soon (0–3 months)", value: "0–3 months" },
  { label: "Planning Ahead (3+ months)", value: "3+ months" },
  { label: "Just Exploring", value: "Just exploring" },
];
const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  condition: "",
  timeline: "",
  notes: "",
  honeypot: "",
};

const phoneOk = (value) => value.replace(/\D/g, "").length >= 10;

function SellerIntakeForm() {
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
    if (!form.address.trim()) {
      errs.address = "Property address is required.";
    }
    return errs;
  }, [form.name, form.email, form.phone, form.address]);

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
      payload.append("form_name", "Seller Intake");
      payload.append("_subject", "Seller Intake Submission");
      payload.append("page_route", "/recommended");
      payload.append("seller_name", form.name.trim());
      payload.append("seller_phone", form.phone.trim());
      payload.append("seller_email", form.email.trim());
      payload.append("_replyto", form.email.trim());
      payload.append("property_address", form.address.trim());
      if (form.propertyType) payload.append("property_type", form.propertyType);
      if (form.bedrooms) payload.append("bedrooms", form.bedrooms);
      if (form.bathrooms) payload.append("bathrooms", form.bathrooms);
      if (form.condition) payload.append("condition", form.condition);
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
      <div className="space-y-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 text-emerald-900 shadow-lg shadow-emerald-100/60">
          <h3 className="text-2xl font-semibold">Thanks — your details are in.</h3>
          <p className="mt-3 text-emerald-800">
            We’ll review and follow up shortly to confirm a time to talk.
          </p>
        </div>
        <a
          href="#leadForm"
          className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
        >
          Back to the top
        </a>
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
        <label className="block text-sm font-medium text-slate-700" htmlFor="address">
          Property Address<span className="text-rose-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          value={form.address}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {visibleErrors.address && (
          <p className="mt-1 text-xs text-rose-600">{visibleErrors.address}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="propertyType">
            Property Type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={form.propertyType}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select property type</option>
            {PROPERTY_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="condition">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select condition</option>
            {CONDITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="bedrooms">
            Bedrooms
          </label>
          <select
            id="bedrooms"
            name="bedrooms"
            value={form.bedrooms}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select bedrooms</option>
            {BEDROOM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="bathrooms">
            Bathrooms
          </label>
          <select
            id="bathrooms"
            name="bathrooms"
            value={form.bathrooms}
            onChange={updateField}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select bathrooms</option>
            {BATHROOM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          {TIMELINE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="notes">
          Anything else? (optional)
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
          {submitting ? "Sending…" : "Share My Details"}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Your information is confidential and never shared.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Your home deserves a smart launch, not a rushed listing.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Prefer to chat now? Call or text 647-668-4646
        </p>
      </div>
    </form>
  );
}

export default function RecommendedPage() {
  const featuredTeam = useMemo(() => teamMembers.slice(0, 2), []);

  return (
    <>
      <Helmet>
        <title>Sell Your Home in the NorthSide GTA — Start Here</title>
        <meta
          name="description"
          content="Start your home sale with Matthew & Landon Mulhall — Sales Representatives serving Uxbridge, Stouffville, Newmarket, Aurora, Georgina, and the entire NorthSide GTA."
        />
        <meta property="og:title" content="Sell Your Home in the NorthSide GTA — Start Here" />
        <meta
          property="og:description"
          content="Start your home sale with Matthew & Landon Mulhall — Sales Representatives serving Uxbridge, Stouffville, Newmarket, Aurora, Georgina, and the entire NorthSide GTA."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/recommended" />
        <meta property="og:image" content="/Images/og-home.jpg" />
        <meta property="og:image:alt" content="NorthSide GTA map with service areas" />
        <link rel="canonical" href="https://www.northsidegta.ca/recommended" />
      </Helmet>

      <HeaderShell />

      <main className="bg-white text-slate-900">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pt-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80">
                  Start Your Home Sale
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Start your home sale with a local NorthSide GTA team.
                </h1>
                <h3 className="text-xl font-semibold text-slate-700 sm:text-2xl">
                  Pricing, prep, and a clear plan — built around your timeline.
                </h3>
                <p className="text-sm text-slate-500">
                  We reply fast and guide you through every step.
                </p>
                <p className="text-sm text-slate-500">
                  Serving Uxbridge, Stouffville, Georgina, East Gwillimbury, Newmarket, Aurora, Scugog, and the wider NorthSide GTA.
                </p>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-emerald-100/60">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                      Meet Matthew &amp; Landon
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {featuredTeam.map((member) => (
                        <div key={member.name} className="flex items-center gap-4">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-16 w-16 rounded-2xl object-cover shadow"
                            loading="lazy"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sales Representative</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-slate-600">
                      We’re brothers who grew up in the area, now raising our families here and helping others make the move north of Toronto. Whether
                      you’re in Uxbridge, Stouffville, Georgina, or anywhere across the NorthSide GTA, we bring local insight and a hands-on process to
                      every sale.
                    </div>
                    <p className="text-sm text-slate-600">
                      We built Finally Home Agents to give families a better real estate experience — guided, personal, and rooted in the community.
                    </p>
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                      Family-run. Local. NorthSide GTA focused.
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>HomeLife Optimum Realty, Brokerage</span>
                      <span className="flex items-center gap-2">
                        <img
                          src="/Images/fha-badge.png"
                          alt="Finally Home Agents"
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                        <img
                          src="/Images/brand/northside-mark.svg"
                          alt="NorthSide GTA"
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id="leadForm"
                className="rounded-[32px] border border-emerald-200 bg-white p-6 shadow-2xl shadow-emerald-200/70 sm:p-8"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Step 1: Tell us about your home sale
                  </p>
                  <p className="text-xs text-slate-500">
                    Complimentary listing preparation consult included.
                  </p>
                  <p className="text-xs text-slate-500">No pressure. No obligation.</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Tell us about your home — and we’ll start building your plan.
                  </h2>
                  <p className="text-sm text-slate-600">
                    We’ll review everything and reach out with the best next steps.
                  </p>
                  <p className="text-sm text-slate-600">
                    You’ll hear directly from Matthew or Landon — never an assistant.
                  </p>
                </div>
                <div className="mt-6">
                  <SellerIntakeForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white pb-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-slate-600">
              Serving Uxbridge, Stouffville, Georgina, Newmarket, Aurora, East Gwillimbury, Scugog — and the wider NorthSide GTA.
            </p>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Why sellers choose us</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Local expertise with region-wide reach.",
                  "Professional staging and standout media.",
                  "Smart pricing strategy and clear process.",
                  "Personal representation with no hand-offs.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">
                Here’s what you can expect
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">What Happens Next</h2>
              <ul className="space-y-3 text-base text-slate-700">
                {[
                  "We confirm your form.",
                  "We review your details.",
                  "We connect by phone or visit.",
                  "We build a listing plan tailored to your timing.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SellerReviewsSection />
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SellerMediaSection heading="See Our Listings in Action" />
          </div>
        </section>

        <section className="bg-emerald-950 py-14 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to start?</h2>
            <p className="text-base text-emerald-100/90">
              Tell us about your property and we’ll take it from there.
            </p>
            <a
              href="#leadForm"
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
            >
              Share My Details
            </a>
          </div>
        </section>
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
            <p className="font-semibold text-slate-900">Matthew &amp; Landon Mulhall — Sales Representatives</p>
            <p className="mt-1">HomeLife Optimum Realty, Brokerage</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
