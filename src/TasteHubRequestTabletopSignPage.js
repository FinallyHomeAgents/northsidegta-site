import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderShell from "./components/HeaderShell";
import Footer from "./Footer";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";

const ROLE_OPTIONS = ["Owner", "Manager", "Staff"];
const TOWN_OPTIONS = [
  "Uxbridge",
  "Stouffville",
  "East Gwillimbury",
  "Newmarket",
  "Georgina",
  "Scugog",
  "Aurora",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState = {
  restaurantName: "",
  contactName: "",
  role: "",
  email: "",
  phone: "",
  town: "",
  website: "",
  nickname: "",
};

const isValidPhone = (value) => String(value || "").replace(/\D/g, "").length >= 10;

function validateForm(values) {
  const errors = {};
  if (!values.restaurantName.trim()) errors.restaurantName = "Restaurant name is required.";
  if (!values.contactName.trim()) errors.contactName = "Contact name is required.";
  if (!values.role) errors.role = "Select a role.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (!values.phone.trim()) {
    errors.phone = "Phone is required.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!values.town) errors.town = "Select a town.";
  return errors;
}

export default function TasteHubRequestTabletopSignPage() {
  const [form, setForm] = useState(() => ({ ...initialFormState }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const meta = useMemo(() => {
    const base = getStaticRouteMeta("/tastehub/request-tabletop-sign") || {};
    return {
      ...base,
      route: "/tastehub/request-tabletop-sign",
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (form.nickname.trim()) {
      setStatus("success");
      return;
    }

    try {
      setStatus("submitting");
      const response = await fetch("/api/tastehub/request-tabletop-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: form.restaurantName.trim(),
          contactName: form.contactName.trim(),
          role: form.role,
          email: form.email.trim(),
          phone: form.phone.trim(),
          town: form.town,
          website: form.website.trim(),
          nickname: form.nickname.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Submission failed. Please try again.");
      }

      setStatus("success");
      setForm({ ...initialFormState });
      setErrors({});
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error.message || "Submission failed. Please try again.");
    }
  };

  const isSubmitting = status === "submitting";
  const valueCards = [
    {
      title: "Get Seen",
      description: "Your restaurant appears on TasteHub when locals search where to eat.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      title: "Get Votes",
      description: "Guests scan the sign and vote instantly from their phone.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 7.5h8.5M6 12h8.5M6 16.5h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M15.75 7.5 18 9.75l3.75-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Get More Traffic",
      description: "Top-voted spots become go-to recommendations in the community.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M5 15.5c2.5 0 4-2.5 6.5-2.5s4 2.5 7.5 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5 9.5c2.5 0 4-2.5 6.5-2.5s4 2.5 7.5 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];
  const localGuideBullets = ["No ads", "No paid placements", "Just real votes from real locals"];

  return (
    <>
      <DynamicMetaTags {...meta} />
      <HeaderShell />
      <main className="flex-1 bg-[#f8fbf6] text-slate-900">
        <section className="relative overflow-hidden bg-[#0b2f1a] text-white">
          <div className="absolute inset-0 opacity-35" aria-hidden>
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-200 blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:pb-20">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/90">
                NorthSide TasteHub
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                More Votes. More Visibility. More Traffic.
              </h1>
              <p className="max-w-xl text-lg text-emerald-50/90 sm:text-xl">
                NorthSide TasteHub helps locals discover where to eat — and helps great restaurants stand out.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#request-tabletop-sign"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
                >
                  Request a Tabletop Sign
                </a>
                <p className="text-sm text-emerald-50/80">
                  Free for selected restaurants • limited quantities available
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-emerald-950/30 via-transparent to-emerald-900/40" />
              <img
                src="/Images/tastehub/request-tabletop-sign/hero.png"
                alt="TasteHub tabletop sign on a counter in a busy restaurant"
                className="relative h-full w-full rounded-[32px] object-cover shadow-[0_30px_80px_rgba(6,55,24,0.35)]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">How it drives traffic</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {valueCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-emerald-100/70 bg-white p-6 shadow-[0_18px_50px_rgba(6,55,24,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    {card.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(6,55,24,0.1)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Think of TasteHub as the NorthSide GTA’s local food guide — decided by the community.
                </h2>
                <p className="text-sm text-slate-600">
                  The restaurants people consistently choose naturally rise to the top. Category winners receive a
                  NorthSide TasteHub Award for display in-store.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {localGuideBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      ✓
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
          <div className="grid gap-6 rounded-3xl border border-emerald-100/70 bg-white p-8 shadow-[0_20px_60px_rgba(6,55,24,0.08)] lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
                <path
                  d="M12 3.75 14.4 8.4 19.5 9.2l-3.6 3.5.9 5.1L12 15.9l-4.8 1.9.9-5.1L4.5 9.2l5.1-.8L12 3.75Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">NorthSide TasteHub Awards</h2>
              <p className="mt-3 text-sm text-slate-600">
                Top-voted restaurants in each town and category receive a TasteHub Award (window decal / framed
                recognition) to display in-store — helping customers instantly recognize local favourites.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(6,55,24,0.08)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-900">Matthew &amp; Landon</h2>
                <p className="text-sm font-semibold text-emerald-700">Finally Home Agents / NorthSide GTA</p>
                <p className="max-w-2xl text-sm text-slate-600">
                  “We built TasteHub to help locals discover the best places to eat — and to help great restaurants get
                  the recognition they deserve. Small businesses are the heart of every town we work in.”
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src="/Images/matthew.jpg"
                  alt="Matthew, NorthSide GTA co-founder"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <img
                  src="/Images/landon.jpg"
                  alt="Landon, NorthSide GTA co-founder"
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-4 sm:px-8 lg:px-12">
          <div
            id="request-tabletop-sign"
            className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-[0_24px_80px_rgba(6,55,24,0.16)] sm:p-8"
          >
            {status === "success" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">Request received</h2>
                <p className="text-sm text-slate-600">
                  We’ll confirm your feature spot and coordinate pickup or delivery.
                </p>
                <Link
                  to="/tastehub"
                  className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Back to TasteHub →
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-900">Request your tabletop sign</h2>
                  <p className="text-sm text-slate-500">We’ll confirm availability and share the next steps.</p>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div>
                      <label className="text-sm font-semibold text-slate-700" htmlFor="restaurantName">
                        Restaurant Name
                      </label>
                      <input
                        id="restaurantName"
                        name="restaurantName"
                        value={form.restaurantName}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="Restaurant name"
                        aria-invalid={Boolean(errors.restaurantName)}
                        aria-describedby={errors.restaurantName ? "restaurantName-error" : undefined}
                        required
                      />
                      {errors.restaurantName && (
                        <p id="restaurantName-error" className="mt-2 text-xs text-rose-600">
                          {errors.restaurantName}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="contactName">
                          Contact Name
                        </label>
                        <input
                          id="contactName"
                          name="contactName"
                          value={form.contactName}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          placeholder="Full name"
                          aria-invalid={Boolean(errors.contactName)}
                          aria-describedby={errors.contactName ? "contactName-error" : undefined}
                          required
                        />
                        {errors.contactName && (
                          <p id="contactName-error" className="mt-2 text-xs text-rose-600">
                            {errors.contactName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="role">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          aria-invalid={Boolean(errors.role)}
                          aria-describedby={errors.role ? "role-error" : undefined}
                          required
                        >
                          <option value="">Select a role</option>
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.role && (
                          <p id="role-error" className="mt-2 text-xs text-rose-600">
                            {errors.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          placeholder="you@restaurant.com"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          required
                        />
                        {errors.email && (
                          <p id="email-error" className="mt-2 text-xs text-rose-600">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          placeholder="(###) ###-####"
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? "phone-error" : undefined}
                          required
                        />
                        {errors.phone && (
                          <p id="phone-error" className="mt-2 text-xs text-rose-600">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="town">
                          Town
                        </label>
                        <select
                          id="town"
                          name="town"
                          value={form.town}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          aria-invalid={Boolean(errors.town)}
                          aria-describedby={errors.town ? "town-error" : undefined}
                          required
                        >
                          <option value="">Select a town</option>
                          {TOWN_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.town && (
                          <p id="town-error" className="mt-2 text-xs text-rose-600">
                            {errors.town}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700" htmlFor="website">
                          Website/Instagram <span className="text-xs font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                          id="website"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          placeholder="https:// or @handle"
                        />
                      </div>
                    </div>

                    <input
                      name="nickname"
                      value={form.nickname}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    {errorMessage && (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Submitting…" : "Request a Tabletop Sign"}
                    </button>
                  </form>
                </>
              )}
            </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
