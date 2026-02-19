import React, { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import HeaderShell from "./components/HeaderShell";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { getStaticRouteMeta } from "./components/seo/staticRouteMetaExports";
import ReviewsCarousel from "./components/contact/ReviewsCarousel";
import { CANONICAL_TESTIMONIALS } from "./data/testimonials";

const COFFEE_ROUTE_META = getStaticRouteMeta("/coffee") || {};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REVIEWS = CANONICAL_TESTIMONIALS.map((review) => ({
  id: review.id,
  name: review.shortName || review.name,
  rating: review.rating || 5,
  quote: review.quote,
  date: review.date,
}));

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  postalCode: "",
  notes: "",
  website: "",
};

function startOfDay(date) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  return local;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 21; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break;
      const hh = `${hour}`.padStart(2, "0");
      const mm = `${minute}`.padStart(2, "0");
      const value = `${hh}:${mm}`;
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      slots.push({
        value,
        label: date.toLocaleTimeString("en-CA", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function monthLabel(date) {
  return date.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

function selectedSummary(dateKey, time) {
  if (!dateKey || !time) return "";
  const date = new Date(`${dateKey}T00:00:00`);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildCalendarDays(currentMonth) {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  return cells;
}

export function BookCoffeeAliasPage() {
  return <Navigate to="/coffee" replace />;
}

export default function CoffeePage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const validations = useMemo(() => {
    const nextErrors = {};
    if (!selectedDate) nextErrors.time = "Pick a date.";
    if (!selectedTime) nextErrors.time = "Pick a time.";
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) nextErrors.phone = "Valid phone is required.";
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) nextErrors.email = "Valid email is required.";
    if (!form.address1.trim()) nextErrors.address1 = "Address line 1 is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    return nextErrors;
  }, [form, selectedDate, selectedTime]);

  const requestedTimeLabel = selectedSummary(selectedDate, selectedTime);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    const normalized = startOfDay(date);
    if (normalized < today) return;
    setSelectedDate(formatDateKey(date));
  };

  const moveMonth = (offset) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (Object.keys(validations).length > 0) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        sourceUrl: typeof window !== "undefined" ? window.location.href : "https://northsidegta.ca/coffee",
      };

      const response = await fetch("/api/coffee-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to send request.");
      }

      setSuccess(true);
      setForm({ ...INITIAL_FORM });
      setShowErrors(false);
    } catch (submitError) {
      setError(submitError.message || "Unable to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DynamicMetaTags
        route="/coffee"
        documentTitle={COFFEE_ROUTE_META.documentTitle || "Book a Coffee | Finally Home Agents"}
        title={COFFEE_ROUTE_META.title || "Book a Coffee | Finally Home Agents"}
        description={
          COFFEE_ROUTE_META.description
          || "Book a coffee with Finally Home Agents. Pick a day and time from 9am to 9pm and we will confirm by text or email."
        }
        canonicalUrl={COFFEE_ROUTE_META.canonicalUrl || "https://northsidegta.ca/coffee"}
        ogType="website"
      />
      <HeaderShell />
      <main className="bg-slate-50 pb-20">
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="grid gap-8 rounded-[32px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Finally Home Agents</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">Book the coffee.</h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                Pick a day and start time (9am–9pm). We&apos;ll confirm the time and location.
              </p>
              <p className="mt-2 text-sm text-slate-500">No pressure. This is just a quick intro.</p>

              <div className="mt-8 rounded-3xl border border-slate-200 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => moveMonth(-1)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{monthLabel(currentMonth)}</p>
                  <button
                    type="button"
                    onClick={() => moveMonth(1)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <span key={`empty-${index}`} className="h-10" aria-hidden />;
                    }
                    const isPast = startOfDay(day) < today;
                    const dateKey = formatDateKey(day);
                    const isSelected = dateKey === selectedDate;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateChange(day)}
                        className={`h-10 rounded-xl text-sm font-medium transition ${
                          isSelected
                            ? "bg-emerald-700 text-white"
                            : isPast
                            ? "cursor-not-allowed bg-slate-100 text-slate-300"
                            : "border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Choose a start time</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setSelectedTime(slot.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        selectedTime === slot.value
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      {slot.label.replace(" ", "")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-sm sm:p-7">
              <p className="text-sm font-semibold text-emerald-700">Requested time: {requestedTimeLabel || "Pick a date and time"}</p>

              {success ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                  <h2 className="text-2xl font-semibold text-emerald-900">Thanks — we’ll be in contact to confirm the time and location.</h2>
                  <p className="mt-3 text-sm text-emerald-800">
                    Your request is pending. Requested time: <strong>{requestedTimeLabel}</strong>.
                  </p>
                </div>
              ) : (
                <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                  <input
                    type="text"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                    value={form.website}
                    onChange={updateField}
                    className="hidden"
                    aria-hidden="true"
                  />
                  {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                  <FormField name="fullName" label="Full Name" value={form.fullName} onChange={updateField} error={showErrors ? validations.fullName : ""} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField name="phone" label="Phone" value={form.phone} onChange={updateField} error={showErrors ? validations.phone : ""} />
                    <FormField name="email" type="email" label="Email" value={form.email} onChange={updateField} error={showErrors ? validations.email : ""} />
                  </div>
                  <FormField name="address1" label="Address Line 1" value={form.address1} onChange={updateField} error={showErrors ? validations.address1 : ""} />
                  <FormField name="address2" label="Address Line 2 (optional)" value={form.address2} onChange={updateField} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField name="city" label="City" value={form.city} onChange={updateField} error={showErrors ? validations.city : ""} />
                    <FormField name="postalCode" label="Postal Code" value={form.postalCode} onChange={updateField} error={showErrors ? validations.postalCode : ""} />
                  </div>
                  <FormField name="notes" label="Notes (optional)" value={form.notes} onChange={updateField} as="textarea" rows={3} />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Sending…" : "Request this time"}
                  </button>
                  <p className="text-xs text-slate-500">Requests aren’t auto-confirmed. We’ll confirm by text/email.</p>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-emerald-950 px-6 py-10 sm:px-10">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Real Google Reviews</h2>
            <p className="mt-3 text-base text-emerald-100">From real clients we&apos;ve represented.</p>
            <div className="mt-8">
              <ReviewsCarousel reviews={REVIEWS} disclaimer="Real reviews from real clients." />
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-14 max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
          <a className="font-semibold text-emerald-700 underline-offset-2 hover:underline" href="tel:+16476684646">
            Prefer texting? Tap to call/text: 647-668-4646
          </a>
          <p className="mt-4 text-xs uppercase tracking-[0.26em] text-slate-500">Finally Home Agents — HomeLife Optimum Realty</p>
        </footer>
      </main>
    </>
  );
}

function FormField({ as = "input", error, label, ...props }) {
  const Component = as;
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <Component
        {...props}
        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
