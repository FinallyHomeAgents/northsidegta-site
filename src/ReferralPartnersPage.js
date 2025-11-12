import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import CoverageStrip from "./components/CoverageStrip";
import Footer from "./Footer";
import GoogleGradientReviews from "./components/reviews/GoogleGradientReviews";
import { getFormEndpoint } from "./components/contact/contactConfig";
import teamMembers from "./data/teamMembers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_METHODS = ["Call", "Text", "Email"];
const CLIENT_TYPES = ["Buyer", "Seller", "Both", "Other"];
const TIMELINE_OPTIONS = [
  "ASAP",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Just starting to explore",
];

const INITIAL_FORM = {
  agentName: "",
  brokerage: "",
  email: "",
  phone: "",
  reachMethod: "",
  callRequest: false,
  clientType: "Buyer",
  areas: "",
  priceRange: "",
  timeline: "",
  notes: "",
  referralPercentage: "",
  honeypot: "",
};

const phoneOk = (value) => value.replace(/\D/g, "").length >= 10;

function ReferralPartnerForm() {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const utm = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  const validations = useMemo(() => {
    const errs = {};
    if (!form.agentName.trim()) {
      errs.agentName = "Referring agent name is required.";
    }
    if (!form.brokerage.trim()) {
      errs.brokerage = "Brokerage or company name is required.";
    }
    if (!form.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!phoneOk(form.phone)) {
      errs.phone = "Enter a valid phone number.";
    }
    return errs;
  }, [form.agentName, form.brokerage, form.email, form.phone]);

  const visibleErrors = showErrors ? validations : {};

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
      payload.append("form_name", "Referral Partner Intake");
      payload.append("_subject", "Referral Partner Submission");
      payload.append("page_route", "/referral-partners");
      payload.append("referring_agent_name", form.agentName.trim());
      payload.append("brokerage_name", form.brokerage.trim());
      payload.append("agent_email", form.email.trim());
      payload.append("_replyto", form.email.trim());
      payload.append("agent_phone", form.phone.trim());
      if (form.reachMethod) {
        payload.append("best_contact_method", form.reachMethod);
      }
      payload.append("call_request", form.callRequest ? "Yes" : "No");
      payload.append("client_type", form.clientType);
      if (form.areas.trim()) {
        payload.append("client_areas", form.areas.trim());
      }
      if (form.priceRange.trim()) {
        payload.append("price_range", form.priceRange.trim());
      }
      if (form.timeline) {
        payload.append("timeline", form.timeline);
      }
      if (form.notes.trim()) {
        payload.append("scenario_notes", form.notes.trim());
      }
      if (form.referralPercentage.trim()) {
        payload.append("referral_percentage", form.referralPercentage.trim());
      }

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
          <h3 className="text-2xl font-semibold">Thank you! We have your referral details.</h3>
          <p className="mt-3 text-emerald-800">
            We’ll review everything and reach out shortly to talk through the opportunity and confirm referral terms together.
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
          Submit another referral
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="agentName">
                Referring Agent Name<span className="text-rose-500">*</span>
              </label>
              <input
                id="agentName"
                name="agentName"
                value={form.agentName}
                onChange={updateField}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {visibleErrors.agentName && (
                <p className="mt-1 text-xs text-rose-600">{visibleErrors.agentName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="brokerage">
                Brokerage / Company Name<span className="text-rose-500">*</span>
              </label>
              <input
                id="brokerage"
                name="brokerage"
                value={form.brokerage}
                onChange={updateField}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {visibleErrors.brokerage && (
                <p className="mt-1 text-xs text-rose-600">{visibleErrors.brokerage}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                  Email Address<span className="text-rose-500">*</span>
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
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="phone">
                  Phone Number<span className="text-rose-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {visibleErrors.phone && (
                  <p className="mt-1 text-xs text-rose-600">{visibleErrors.phone}</p>
                )}
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Best way to reach you? (optional)</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {CONTACT_METHODS.map((option) => (
                  <label
                    key={option}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      form.reachMethod === option
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reachMethod"
                      value={option}
                      checked={form.reachMethod === option}
                      onChange={updateField}
                      className="h-4 w-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                name="callRequest"
                checked={form.callRequest}
                onChange={updateField}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Please give me a call to discuss this referral.</span>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Referral Scenario</h3>
          <div className="space-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Client Type</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {CLIENT_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
                      form.clientType === type
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="clientType"
                      value={type}
                      checked={form.clientType === type}
                      onChange={updateField}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="areas">
                Areas Your Client Is Considering
              </label>
              <input
                id="areas"
                name="areas"
                value={form.areas}
                onChange={updateField}
                placeholder="e.g. Stouffville or Uxbridge, open to Newmarket / Aurora"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="priceRange">
                Approximate Price Range or Budget (optional)
              </label>
              <input
                id="priceRange"
                name="priceRange"
                value={form.priceRange}
                onChange={updateField}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Estimated Timeline</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TIMELINE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                      form.timeline === option
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeline"
                      value={option}
                      checked={form.timeline === option}
                      onChange={updateField}
                    />
                    <span className="leading-snug">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="notes">
                Anything important we should know?
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
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Referral Terms</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="referralPercentage">
            Referral Percentage You’re Proposing (%)
          </label>
          <input
            id="referralPercentage"
            name="referralPercentage"
            value={form.referralPercentage}
            onChange={updateField}
            placeholder="e.g. 25"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </section>

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
          {submitting ? "Sending…" : "Send referral details"}
        </button>
      </div>
    </form>
  );
}

export default function ReferralPartnersPage() {
  return (
    <>
      <Helmet>
        <title>Referral Partners — Finally Home Agents | NorthSide GTA</title>
        <meta
          name="description"
          content="A dedicated referral partner page for agents with clients moving to the NorthSide GTA, including Uxbridge, Stouffville, Newmarket, Aurora, Georgina, East Gwillimbury, and Scugog."
        />
        <meta property="og:title" content="Referral Partners — Finally Home Agents | NorthSide GTA" />
        <meta
          property="og:description"
          content="A dedicated referral partner page for agents with clients moving to the NorthSide GTA, including Uxbridge, Stouffville, Newmarket, Aurora, Georgina, East Gwillimbury, and Scugog."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.northsidegta.ca/referral-partners" />
        <link rel="canonical" href="https://www.northsidegta.ca/referral-partners" />
      </Helmet>

      <Navigation />
      <CoverageStrip mode="static" showLabels />

      <main className="bg-slate-50 text-slate-900">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-900 to-emerald-700 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-soft-light"
            style={{ backgroundImage: "url('/Images/northsidegta-map-bg.jpg')" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(50,97,14,0.35),_transparent_60%)]" aria-hidden />
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" aria-hidden />
          <div className="absolute -right-16 bottom-[-40%] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 sm:py-24">
            <div className="max-w-3xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/80">
                Referral Partners
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Trusted Local Partners for Your Clients North of Toronto
              </h1>
              <p className="text-lg text-emerald-100/90 sm:text-xl">
                When your client’s search extends to the NorthSide GTA — from Stouffville and Uxbridge to Newmarket, Aurora, and Georgina — you can count on Finally Home Agents to deliver the same level of care and professionalism you’d expect from yourself.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80">Referral Intake</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Share Your Referral Details</h2>
                <p className="text-base text-slate-600">
                  Use this form to share how we can help your client in the NorthSide GTA. We’ll review your notes, connect with you directly,
                  and collaborate on referral terms before reaching out to your client.
                </p>
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-sm text-emerald-900 shadow-sm">
                  <h3 className="text-base font-semibold text-emerald-900">What to expect</h3>
                  <ul className="mt-3 space-y-3">
                    {["Quick follow-up from Matthew or Landon.", "Transparent conversation about referral terms.", "Your client relationship stays front and centre.", "No client contact until we’ve agreed together."].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-6 rounded-[32px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/50 sm:p-8">
                <ReferralPartnerForm />
                <p className="text-xs text-slate-500">
                  This form is for us to review your referral opportunity and reach out to you directly. We’re not collecting your client’s personal
                  contact information here. Once we’ve connected and agreed on terms, we’ll finalize a written referral agreement and then gather any
                  client details needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-5">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Why Agents Trust Finally Home Agents
              </h2>
              <ul className="space-y-3 text-base text-slate-700">
                {["Full-time licensed agents focused on the NorthSide GTA.", "Strong experience helping families relocate from Toronto and the GTA.", "Excellent client feedback and reviews across the region."].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-500">
                Recognized within HomeLife Optimum Realty for service and production.
              </p>
            </div>
            <div className="flex-1 lg:pt-4">
              <GoogleGradientReviews className="lg:mx-0 lg:ml-auto" />
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center sm:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Where We Work</h2>
              <p className="text-base text-slate-600 sm:max-w-3xl">
                We cover the core NorthSide GTA communities your clients are asking about — with a strong focus on Uxbridge, Stouffville, Georgina,
                East Gwillimbury, Newmarket, Aurora, Scugog, and the surrounding hamlets.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              {["Uxbridge", "Stouffville", "Georgina", "East Gwillimbury", "Newmarket", "Aurora", "Scugog"].map((town) => (
                <span
                  key={town}
                  className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
                >
                  {town}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="absolute inset-0 bg-slate-950" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700" aria-hidden />
          <div className="relative mx-auto max-w-5xl px-4 text-center text-white sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Our Promise to Our Referral Partners
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-emerald-100/90 sm:text-lg">
              <p>
                We respect your client relationship. Every referral we receive is handled with the highest level of care and transparency.
              </p>
              <p>
                At this stage, we’re simply gathering your information and basic details so we can connect with you, discuss the opportunity, and agree on referral terms together. Once we’re aligned, we’ll formalize the referral in writing and only then collect your client’s contact details.
              </p>
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-emerald-200/80">
              We treat your client like our own — and your reputation like it’s ours.
            </p>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center sm:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">About Finally Home Agents</h2>
              <p className="text-base text-slate-600 sm:max-w-3xl">
                We’re Matthew and Landon Mulhall — founders of Finally Home Agents and NorthSideGTA.ca. We specialize in helping buyers and sellers in the NorthSide communities north of Toronto, including Uxbridge, Stouffville, Georgina, East Gwillimbury, Newmarket, Aurora, and Scugog. We partner with top agents across Ontario to provide a seamless experience for their clients when their search moves into the NorthSide GTA.
              </p>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {teamMembers.map((member) => (
                <article
                  key={member.name}
                  className="grid grid-cols-1 items-center gap-8 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-100/60 backdrop-blur-sm sm:p-8 lg:grid-cols-[auto,1fr]"
                >
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-[220px] rounded-[30px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-200/60">
                      <div className="rounded-[24px] border border-emerald-100 bg-white p-3">
                        <img src={member.image} alt={member.name} className="h-auto w-full rounded-[20px] object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-center lg:text-left">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-semibold text-emerald-900">{member.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                        {member.title}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{member.bio}</p>
                    <p className="text-sm font-medium text-emerald-900">{member.awards}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center sm:text-left">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                Learn more about us
              </Link>
            </div>
          </div>
        </section>

        <div className="px-4 pb-16 pt-12 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          <p className="font-medium uppercase tracking-[0.3em] text-slate-500/80">For Referral Partner Use Only</p>
          <p className="mt-3 text-slate-600">
            Have questions before submitting? {" "}
            <a
              href="mailto:contact@finallyhomeagents.com"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Email us at contact@finallyhomeagents.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
