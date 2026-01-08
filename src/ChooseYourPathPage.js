import React, { useEffect, useMemo, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import { getFormEndpoint, useContactConfig } from "./components/contact/contactConfig";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import SellerReviewsSection from "./components/sellers/SellerReviewsSection";
import teamMembers from "./data/teamMembers";
import { trackEvent, trackEventOnce } from "./utils/analytics";

const CHOOSE_PATH_ROUTE_META = getStaticRouteMeta("/choose-your-path") || {};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONNECT_OPTIONS = [
  "Phone call",
  "Video call (Zoom/FaceTime)",
  "Meet for a coffee",
  "In-person at your home",
];

const TIMEFRAME_OPTIONS = [
  "Just browsing",
  "0–3 months",
  "3–6 months",
  "6–12 months",
  "12+ months",
];

const TEAM_BIOS = [
  {
    name: "Matthew Mulhall",
    title: "Sales Representative, Finally Home Agents",
    bio: "Matthew brings a strategic, calm, and confident presence to every buyer’s journey — guiding families through pricing, offers, and timing with clear next steps and thoughtful planning.",
  },
  {
    name: "Landon Mulhall",
    title: "Sales Representative, Finally Home Agents",
    bio: "Landon brings a thoughtful, people-first energy to helping buyers feel at ease, balancing neighborhood insight with a human touch that makes the process feel approachable from day one.",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  preferredConnect: [],
  areas: "",
  timeframe: "",
  honeypot: "",
};

function getTeamImage(name) {
  const match = teamMembers.find((member) => member.name === name);
  return match ? match.image : "";
}

function ChooseYourPathForm({ selectedPath }) {
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
    const errors = {};
    if (!form.name.trim()) {
      errors.name = "Name is required.";
    }
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    return errors;
  }, [form.email, form.name]);

  const visibleErrors = showErrors ? validations : {};

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleConnectOption = (option) => {
    setForm((prev) => {
      const exists = prev.preferredConnect.includes(option);
      const nextPreferences = exists
        ? prev.preferredConnect.filter((item) => item !== option)
        : [...prev.preferredConnect, option];
      trackEvent("Preferred Contact", {
        route: "/choose-your-path",
        option,
        selected: !exists,
      });
      return { ...prev, preferredConnect: nextPreferences };
    });
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
      payload.append("form_name", "Choose Your Path — Buyer Connect");
      payload.append("_subject", "Choose Your Path Buyer Lead");
      payload.append("page_route", "/choose-your-path");
      payload.append("buyer_name", form.name.trim());
      payload.append("buyer_email", form.email.trim());
      payload.append("_replyto", form.email.trim());
      if (form.phone.trim()) payload.append("buyer_phone", form.phone.trim());
      if (form.preferredConnect.length > 0) {
        payload.append("preferred_way_to_connect", form.preferredConnect.join(", "));
      }
      if (form.areas.trim()) payload.append("areas_considering", form.areas.trim());
      if (form.timeframe) payload.append("timeframe_to_buy", form.timeframe);
      if (selectedPath) payload.append("chosen_path", selectedPath);

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

      trackEvent("Form Submit", {
        route: "/choose-your-path",
        preferred_connect: form.preferredConnect.join(", "),
      });

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
          <h3 className="text-2xl font-semibold">Thanks — we’ll be in touch shortly.</h3>
          <p className="mt-3 text-emerald-800">
            We’ll reach out in the way you requested to start the conversation.
          </p>
        </div>
        <a
          href="#connect"
          className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
        >
          Back to the form
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

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="phone">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Preferred way to connect</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {CONNECT_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            >
              <input
                type="checkbox"
                checked={form.preferredConnect.includes(option)}
                onChange={() => toggleConnectOption(option)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="areas">
          Areas you’re considering
        </label>
        <input
          id="areas"
          name="areas"
          value={form.areas}
          onChange={updateField}
          placeholder="Uxbridge, Newmarket, Stouffville..."
          className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="timeframe">
          Timeframe to buy
        </label>
        <select
          id="timeframe"
          name="timeframe"
          value={form.timeframe}
          onChange={updateField}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select a timeframe</option>
          {TIMEFRAME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
          {submitting ? "Sending…" : "Connect With Us"}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          We respect your privacy — we’ll contact you in the way you selected.
        </p>
      </div>
    </form>
  );
}

export default function ChooseYourPathPage() {
  const [selectedPath, setSelectedPath] = useState("");
  const contactConfig = useContactConfig();
  const schedulingUrl = contactConfig?.schedulingUrl || "/contact";
  const schedulingIsExternal = /^https?:\/\//i.test(schedulingUrl);

  useEffect(() => {
    trackEventOnce("Page View – Choose Your Path", { route: "/choose-your-path" });
  }, []);

  const teamWithImages = useMemo(
    () =>
      TEAM_BIOS.map((member) => ({
        ...member,
        image: getTeamImage(member.name),
      })),
    [],
  );

  const handleUsClick = () => {
    setSelectedPath("Finally Home Agents");
    trackEvent("Click – US CTA", { route: "/choose-your-path" });
  };

  const handleThemClick = () => {
    setSelectedPath("Other Agent Options");
    trackEvent("Click – THEM CTA", { route: "/choose-your-path" });
  };

  return (
    <>
      <DynamicMetaTags {...CHOOSE_PATH_ROUTE_META} />

      <HeaderShell />

      <main className="bg-white text-slate-900">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pt-20">
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Buy With Clarity. Connect With Confidence.
              </h1>
              <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
                A friendly, low-pressure way to start your home buying conversation — choose how you want to connect.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#connect"
                  onClick={handleUsClick}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-green px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-green/30 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] sm:w-auto"
                >
                  Work with Finally Home Agents
                </a>
                <a
                  href="#choice"
                  onClick={handleThemClick}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
                >
                  Explore Other Agent Options
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="choice" className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">
                Your Next Step
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Choose the path that feels right.
              </h2>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col justify-between rounded-[32px] border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Us — Finally Home Agents
                  </p>
                  <p className="text-base text-slate-600">
                    Partner with a team that brings clarity, strategy, and purposeful planning to your buyer journey. We start with your goals, keep
                    communication clear, and help you feel confident as you move forward.
                  </p>
                </div>
                <a
                  href="#connect"
                  onClick={handleUsClick}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-green/30 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
                >
                  Work with Finally Home Agents
                </a>
              </div>
              <div className="flex flex-col justify-between rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Them — Other Agent Options
                  </p>
                  <p className="text-base text-slate-600">
                    If you prefer to explore agent options independently or at your own pace, keep going — you can decide what feels right for you
                    without structured guidance.
                  </p>
                </div>
                <a
                  href="#connect"
                  onClick={handleThemClick}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Explore Other Agent Options
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center sm:text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                About Us
              </h2>
              <p className="text-base text-slate-600 sm:max-w-3xl">
                We’re Matthew and Landon Mulhall — the Finally Home Agents team focused on helping buyers move with clarity, confidence, and local
                insight across the NorthSide GTA.
              </p>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {teamWithImages.map((member) => (
                <article
                  key={member.name}
                  className="grid grid-cols-1 items-center gap-8 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-100/60 backdrop-blur-sm sm:p-8 lg:grid-cols-[auto,1fr]"
                >
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-[220px] rounded-[30px] bg-gradient-to-tr from-emerald-300 via-emerald-400 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-200/60">
                      <div className="rounded-[24px] border border-emerald-100 bg-white p-3">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-auto w-full rounded-[20px] object-cover"
                          loading="lazy"
                        />
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
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SellerReviewsSection />
          </div>
        </section>

        <section id="connect" className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Let’s Talk About Your Home Goals
                </h2>
                <p className="text-base text-slate-600">
                  We’ll reach out to connect in the way that works best for you — phone, video, coffee, or in person. No pressure, just a
                  conversation.
                </p>
                <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    What to expect
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {[
                      "We respond quickly with the next best step.",
                      "Your preferred connection style stays front and center.",
                      "You’ll always speak directly with Matthew or Landon.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-[32px] border border-emerald-200 bg-white p-6 shadow-2xl shadow-emerald-200/70 sm:p-8">
                <ChooseYourPathForm selectedPath={selectedPath} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600/80">
              Prefer to schedule time directly?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Book a Buyer Strategy Call
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Pick a time that fits your schedule and we’ll bring the plan.
            </p>
            <a
              href={schedulingUrl}
              target={schedulingIsExternal ? "_blank" : undefined}
              rel={schedulingIsExternal ? "noopener noreferrer" : undefined}
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Book a Buyer Strategy Call
            </a>
          </div>
        </section>

        <section className="bg-emerald-950 py-14 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to connect?</h2>
            <p className="text-base text-emerald-100/90">
              Tell us what you’re looking for and we’ll make the next step feel easy.
            </p>
            <a
              href="#connect"
              onClick={handleUsClick}
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
            >
              Connect With Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
