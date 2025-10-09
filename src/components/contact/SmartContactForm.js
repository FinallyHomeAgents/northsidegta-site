import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import { getFormEndpoint } from "./contactConfig";
import { trackEvent } from "../../utils/analytics";

const INTENT_OPTIONS = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "browse", label: "Just browsing" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SmartContactForm({ config, formRef }) {
  const [intent, setIntent] = useState("buy");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [buyerOptIn, setBuyerOptIn] = useState(false);
  const [sellerOptIn, setSellerOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [honeypot, setHoneypot] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const utm = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  const validations = useMemo(() => {
    const errs = {};
    if (!name.trim()) {
      errs.name = "Name is required.";
    }
    if (!email.trim() && !phone.trim()) {
      errs.contact = "Provide at least an email or phone number.";
    } else {
      if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
        errs.email = "Enter a valid email.";
      }
      const numeric = phone.replace(/[^0-9]/g, "");
      if (phone.trim() && numeric.length < 10) {
        errs.phone = "Enter a valid phone number.";
      }
    }
    return errs;
  }, [name, email, phone]);

  const visibleErrors = showErrors ? validations : {};
  const hasValidationErrors = Object.keys(validations).length > 0;
  const showAllGood =
    !hasValidationErrors &&
    name.trim().length > 1 &&
    (email.trim().length > 0 || phone.trim().length > 0);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (honeypot) {
      return;
    }

    if (hasValidationErrors) {
      setShowErrors(true);
      Object.entries(validations).forEach(([field, reason]) => {
        trackEvent("contact_form_validation_error", {
          route: "/contact",
          field,
          reason,
        });
      });
      return;
    }

    setSubmitting(true);
    setShowErrors(false);

    try {
      const payload = new FormData();
      payload.append("name", name);
      if (email) payload.append("email", email);
      if (phone) payload.append("phone", phone);
      payload.append("intent", intent);
      if (message) payload.append("message", message);
      if (intent === "buy" && buyerOptIn) {
        payload.append("wantListings", "Yes");
      }
      if (intent === "sell" && sellerOptIn) {
        payload.append("wantHomeValue", "Yes");
      }

      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        const value = utm.get(key);
        if (value) payload.append(key, value);
      });

      const response = await fetch(formEndpoint, {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSuccess(true);
      trackEvent("contact_form_success_view", { route: "/contact" });
      trackEvent("contact_form_submit", {
        route: "/contact",
        buyer_or_seller: intent,
        opted_home_value: intent === "sell" && sellerOptIn,
        opted_daily_listings: intent === "buy" && buyerOptIn,
        provided_email: Boolean(email),
        provided_phone: Boolean(phone),
        utm_source: utm.get("utm_source") || "",
        utm_campaign: utm.get("utm_campaign") || "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-xl font-semibold text-emerald-900">We received your message!</h3>
        <p className="mt-2 text-emerald-800">{config.formThankYouMessage}</p>
        <p className="mt-4 text-sm text-emerald-700">
          Prefer instant answers? Message us on WhatsApp or call — we usually reply in minutes.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef || null} onSubmit={onSubmit} className="space-y-5" aria-live="assertive">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-700">Tell us about your move</legend>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">I’m looking to</p>
        <div className="flex flex-wrap gap-2">
          {INTENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                "px-4 py-2 rounded-full border text-sm font-medium transition " +
                (intent === option.value
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-600")
              }
              onClick={() => setIntent(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Your name"
            aria-invalid={Boolean(visibleErrors.name)}
          />
          {visibleErrors.name && (
            <p className="text-sm text-rose-600">{visibleErrors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com"
            aria-invalid={Boolean(visibleErrors.email)}
          />
          {visibleErrors.email && (
            <p className="text-sm text-rose-600">{visibleErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="(xxx) xxx-xxxx"
            aria-invalid={Boolean(visibleErrors.phone)}
          />
          {visibleErrors.phone && (
            <p className="text-sm text-rose-600">{visibleErrors.phone}</p>
          )}
          {visibleErrors.contact && (
            <p className="text-sm text-rose-600">{visibleErrors.contact}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
            Message (optional)
          </label>
          <textarea
            id="contact-message"
            rows={intent === "browse" ? 2 : 4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={
              intent === "sell"
                ? "Share your property address or timing"
                : intent === "buy"
                ? "Tell us about the home you’re after"
                : "How can we help?"
            }
          />
        </div>
      </div>

      {intent === "sell" && (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={sellerOptIn}
            onChange={(e) => setSellerOptIn(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Want a free home value estimate?</span>
        </label>
      )}

      {intent === "buy" && (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={buyerOptIn}
            onChange={(e) => setBuyerOptIn(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Want listings emailed daily?</span>
        </label>
      )}

      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {showAllGood && (
        <p className="text-sm text-emerald-600">Your message looks great — send it when you’re ready.</p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
