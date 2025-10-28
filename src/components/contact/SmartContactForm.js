import React, { useMemo, useState } from "react";
import Button from "../ui/Button";
import { getFormEndpoint } from "./contactConfig";
import { trackEvent } from "../../utils/analytics";
import { WhatsAppGlyph } from "./WhatsAppButton";

const INTENT_OPTIONS = [
  { value: "buy", label: "Buy", description: "I want help finding the right home." },
  { value: "sell", label: "Sell", description: "I’m ready to list or curious about value." },
  { value: "browse", label: "Just browsing", description: "Gathering intel for a future move." },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SmartContactForm({ config, formRef, whatsappChannel }) {
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

  const conciergeWhatsApp = whatsappChannel?.href || null;
  const whatsappBadge = whatsappChannel?.badge || config.whatsappConciergeLabel;
  const primaryPhoneLabel = config?.footerAgents?.[0]?.phoneLabel || "647-668-4646";
  const primaryPhoneHref = primaryPhoneLabel
    ? `tel:${primaryPhoneLabel.replace(/[^0-9]/g, "")}`
    : "";

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
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-xl font-semibold text-emerald-900">We received your message!</h3>
        <p className="mt-2 text-emerald-800">{config.formThankYouMessage}</p>

        <div className="mt-6 space-y-4">
          {conciergeWhatsApp && (
            <a
              href={conciergeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("click_whatsapp", { route: "/contact", source: "form_success" })
              }
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-105"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
                <WhatsAppGlyph className="h-5 w-5 text-white" />
              </span>
              <span className="flex flex-col text-left text-sm leading-tight">
                <span className="text-base font-semibold">Talk to us on WhatsApp</span>
                {whatsappBadge && (
                  <span className="text-xs text-emerald-50/90">{whatsappBadge}</span>
                )}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                <LightningIcon className="h-4 w-4" />
                Instant
              </span>
            </a>
          )}

          {primaryPhoneHref && (
            <p className="flex items-center gap-2 text-sm text-emerald-800">
              <LightningIcon className="h-4 w-4 text-emerald-500" aria-hidden />
              Prefer voice?{' '}
              <a
                href={primaryPhoneHref}
                className="font-semibold text-emerald-900 underline underline-offset-4"
              >
                Call or text {primaryPhoneLabel}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef || null}
      onSubmit={onSubmit}
      className="space-y-7"
      aria-live="assertive"
    >
      <fieldset className="rounded-3xl border border-emerald-100 bg-emerald-50/40 px-5 py-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
          Tell us about your move
        </legend>
        <p id="contact-intent-helper" className="mt-2 text-sm font-medium text-emerald-900">
          I’m looking to…
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-labelledby="contact-intent-helper">
          {INTENT_OPTIONS.map((option) => {
            const checked = intent === option.value;
            return (
              <label
                key={option.value}
                htmlFor={`intent-${option.value}`}
                className={`group flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-emerald-500 ${
                  checked
                    ? "border-emerald-500 bg-white shadow shadow-emerald-100"
                    : "border-emerald-100 bg-white/60 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-900">{option.label}</span>
                  <span
                    aria-hidden
                    className={`h-5 w-5 rounded-full border-2 transition ${
                      checked
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-emerald-200 bg-white"
                    }`}
                  >
                    <span className="sr-only">{checked ? "Selected" : ""}</span>
                  </span>
                </div>
                <span className="text-xs text-emerald-700/80">{option.description}</span>
                <input
                  id={`intent-${option.value}`}
                  type="radio"
                  name="intent"
                  value={option.value}
                  checked={checked}
                  onChange={() => setIntent(option.value)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          id="contact-name"
          label="Name"
          required
          value={name}
          onChange={setName}
          placeholder="Your name"
          error={visibleErrors.name}
        />
        <FormField
          id="contact-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={visibleErrors.email}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          id="contact-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="(xxx) xxx-xxxx"
          error={visibleErrors.phone || visibleErrors.contact}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-message" className="text-sm font-semibold text-emerald-900">
            Message <span className="text-emerald-700/60">(optional)</span>
          </label>
          <textarea
            id="contact-message"
            rows={intent === "browse" ? 3 : 4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[110px] rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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

      <div className="grid gap-3 sm:grid-cols-2">
        {intent === "sell" && (
          <ToggleField
            id="intent-sell-opt"
            checked={sellerOptIn}
            onChange={setSellerOptIn}
            label="Want a free home value estimate?"
          />
        )}
        {intent === "buy" && (
          <ToggleField
            id="intent-buy-opt"
            checked={buyerOptIn}
            onChange={setBuyerOptIn}
            label="Want listings emailed daily?"
          />
        )}
      </div>

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
        <p className="text-sm font-medium text-emerald-700">
          Your message looks great — send it when you’re ready.
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}

function FormField({ id, label, value, onChange, type = "text", required, placeholder, error }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-emerald-900">
        {label}
        {required && <span className="ml-1 text-emerald-700/60">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-2xl border px-4 py-3 text-base text-emerald-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
          error ? "border-rose-400" : "border-emerald-100 bg-white"
        }`}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function ToggleField({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-800 shadow-sm transition hover:border-emerald-300"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
      />
      <span>{label}</span>
    </label>
  );
}


function LightningIcon({ className = "h-4 w-4 text-white" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M11.3 1.3a1 1 0 0 1 1.8.7l-.4 5h4.3a1 1 0 0 1 .8 1.6l-7.5 10.5a1 1 0 0 1-1.8-.7l.4-5H4a1 1 0 0 1-.8-1.6Z" />
    </svg>
  );
}
