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

  const meta = useMemo(
    () => getStaticRouteMeta("/tastehub/request-tabletop-sign"),
    []
  );

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

  return (
    <>
      <DynamicMetaTags {...meta} />
      <HeaderShell />
      <main className="flex-1 bg-[#f8fbf6] text-slate-900">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3a20] via-[#0f4c2a] to-[#f59e0b]">
          <div className="absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute -left-12 top-12 h-64 w-64 rounded-full bg-emerald-300 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-16 pt-20 text-white sm:px-8 md:pb-20 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/90">
              NorthSide TasteHub
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              50 Restaurants Will Be Featured on NorthSide TasteHub
            </h1>
            <p className="max-w-2xl text-lg text-emerald-50/90 sm:text-xl">
              Selected spots receive priority visibility across the NorthSide GTA — plus a tabletop sign that makes it
              easy for guests to vote and support you.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#request-tabletop-sign"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
              >
                Claim My Spot
              </a>
              <p className="text-sm text-emerald-50/80">
                Featured listing first. Tabletop sign included.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:px-8 lg:flex-row lg:items-start lg:px-12">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "Locals vote for the places they actually return to",
                  "Restaurants with more votes appear higher in TasteHub results",
                  "Higher visibility leads to more local discovery",
                  "We provide a tabletop sign so guests can vote in seconds",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_20px_60px_rgba(6,55,24,0.12)]">
              <h3 className="text-xl font-semibold text-slate-900">Limited to 50 tabletop signs this round</h3>
              <p className="mt-3 text-sm text-slate-600">
                To keep TasteHub curated and meaningful, we’re limiting tabletop signs to the first 50 restaurants that
                request a feature spot. Once filled, requests close.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-6">
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
                    <p className="text-sm text-slate-500">Takes ~30 seconds. No fees. No contracts.</p>
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
                      {isSubmitting ? "Submitting…" : "Claim My Spot"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
