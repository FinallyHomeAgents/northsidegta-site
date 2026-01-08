import React, { useEffect, useMemo, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import { getFormEndpoint } from "./components/contact/contactConfig";
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

const TOWN_OPTIONS = [
  "Uxbridge",
  "Georgina",
  "Scugog",
  "Stouffville",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
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
    title: "Real Estate Agent | HomeLife Optimum Realty",
    bio: "Matthew brings a thoughtful, human-centered approach to buyer conversations in the NorthSide GTA. He listens to what matters most, prioritizes clarity in every exchange, and supports buyers so decisions feel informed and comfortable.",
  },
  {
    name: "Landon Mulhall",
    title: "Real Estate Agent | HomeLife Optimum Realty",
    bio: "Landon focuses on clear communication and supportive engagement. He helps buyers articulate their needs and keeps conversations grounded, straightforward, and reassuring throughout the journey.",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  preferredConnect: [],
  towns: [],
  otherTown: "",
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
      trackEvent("Preferred Connect Method", {
        route: "/choose-your-path",
        option,
        selected: !exists,
      });
      return { ...prev, preferredConnect: nextPreferences };
    });
  };

  const toggleTown = (town) => {
    setForm((prev) => {
      const exists = prev.towns.includes(town);
      const nextTowns = exists
        ? prev.towns.filter((item) => item !== town)
        : [...prev.towns, town];
      trackEvent("Town Selections", {
        route: "/choose-your-path",
        town,
        selected: !exists,
      });
      return { ...prev, towns: nextTowns };
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
      if (form.towns.length > 0) payload.append("towns_interested", form.towns.join(", "));
      if (form.otherTown.trim()) payload.append("other_town", form.otherTown.trim());
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

      trackEvent("Form Submission — Connect Form", {
        route: "/choose-your-path",
        preferred_connect: form.preferredConnect.join(", "),
        towns: form.towns.join(", "),
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
          href="#connect-form"
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
          Full Name<span className="text-rose-500">*</span>
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

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Towns you’re interested in</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {TOWN_OPTIONS.map((town) => (
            <label
              key={town}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
            >
              <input
                type="checkbox"
                checked={form.towns.includes(town)}
                onChange={() => toggleTown(town)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{town}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700" htmlFor="otherTown">
            Other
          </label>
          <input
            id="otherTown"
            name="otherTown"
            value={form.otherTown}
            onChange={updateField}
            placeholder="Tell us another town..."
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </fieldset>

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
          We respect your privacy — we’ll contact you based on your preferences.
        </p>
      </div>
    </form>
  );
}

export default function ChooseYourPathPage() {
  const [selectedPath, setSelectedPath] = useState("");

  useEffect(() => {
    trackEventOnce("Page View", { route: "/choose-your-path" });
  }, []);

  const teamWithImages = useMemo(
    () =>
      TEAM_BIOS.map((member) => ({
        ...member,
        image: getTeamImage(member.name),
      })),
    [],
  );

  const handleHeroClick = () => {
    setSelectedPath("Talk With Finally Home Agents");
    trackEvent("Click — Hero CTA", { route: "/choose-your-path" });
  };

  const handleUsClick = () => {
    setSelectedPath("Talk With Finally Home Agents");
    trackEvent("Click — US Advantage CTA", { route: "/choose-your-path" });
  };

  const handleFooterClick = () => {
    setSelectedPath("Talk With Finally Home Agents");
    trackEvent("Click — Footer CTA", { route: "/choose-your-path" });
  };

  return (
    <>
      <DynamicMetaTags {...CHOOSE_PATH_ROUTE_META} />

      <HeaderShell />

      <main className="bg-white text-slate-900">
        <section className="hero choose-path-hero relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
            <div className="mx-auto max-w-4xl space-y-6 rounded-[32px] bg-black/40 px-6 py-10 text-center text-white shadow-2xl shadow-black/30 backdrop-blur-sm sm:px-10">
              <div className="space-y-2">
                <p className="text-xl font-medium sm:text-2xl">
                  Ready to find the right agent for your buying journey?
                </p>
                <p className="text-xl font-medium sm:text-2xl">You have come to the right place.</p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight drop-shadow sm:text-5xl lg:text-6xl">
                Buy With Clarity. Connect With Confidence.
              </h1>
              <p className="mx-auto max-w-3xl text-base text-white/90 drop-shadow sm:text-lg">
                A buyer experience built around your priorities — starting with a conversation that feels human and supportive.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#connect-form"
                  onClick={handleHeroClick}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-green px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-green/30 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] sm:w-auto"
                >
                  Talk With Finally Home Agents
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Why Work With Finally Home Agents
              </h2>
            </div>
            <div className="mt-8">
              <div className="rounded-[36px] border border-emerald-100 bg-emerald-50 p-8 text-slate-900 shadow-xl shadow-emerald-100/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  Finally Home Agents • HomeLife Optimum Realty
                </p>
                <p className="mt-4 text-base text-slate-700">
                  Work with Matthew &amp; Landon Mulhall of Finally Home Agents at HomeLife Optimum Realty — serving the NorthSide GTA. Your experience includes:
                </p>
                <ul className="mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                  {[
                    "Listening first: We begin with what matters most to you — your goals, priorities, and comfort level.",
                    "Clear communication: You’ll always know what’s happening, what comes next, and why.",
                    "Human-centered support: Your needs guide each step; the process feels supportive, not pressured.",
                    "NorthSide GTA insight: We bring community understanding — how neighbourhoods feel, not just how listings read.",
                    "Flexible connection: Choose phone, video, coffee, or in-person — we follow your lead.",
                    "No obligation conversation: The first step is always a conversation — not a contract.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#connect-form"
                  onClick={handleUsClick}
                  className="mt-8 inline-flex items-center justify-center rounded-2xl bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]"
                >
                  Talk With Finally Home Agents
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-10">
              <div className="space-y-4 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Meet the Finally Home Agents
                </h2>
                <p className="mx-auto max-w-3xl text-base text-slate-600">
                  We’re Matthew and Landon Mulhall — the Finally Home Agents team focused on helping buyers move with clarity, confidence, and local insight across the NorthSide GTA.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {teamWithImages.map((member) => (
                  <article
                    key={member.name}
                    className="flex flex-col items-center gap-5 rounded-[28px] border border-emerald-100 bg-white p-6 text-center shadow-xl shadow-emerald-100/60 sm:flex-row sm:text-left"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-32 w-32 overflow-hidden rounded-full border border-emerald-200 shadow-lg shadow-emerald-100/60">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
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
          </div>
        </section>

        <section id="connect-form" className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Let’s Connect — Your Way
              </h2>
              <p className="mx-auto max-w-3xl text-base text-slate-600">
                Tell us a bit about what you’re looking for — we’ll reach out in the way you prefer. No pressure, just a conversation.
              </p>
            </div>
            <div className="mt-8 rounded-[32px] border border-emerald-200 bg-slate-50 p-6 shadow-2xl shadow-emerald-200/70 sm:p-8">
              <ChooseYourPathForm selectedPath={selectedPath} />
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SellerReviewsSection />
          </div>
        </section>

        <section className="bg-emerald-950 py-14 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to Connect?</h2>
            <p className="text-base text-emerald-100/90">
              Tell us what you’re looking for and we’ll make the next step feel easy.
            </p>
            <a
              href="#connect-form"
              onClick={handleFooterClick}
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
