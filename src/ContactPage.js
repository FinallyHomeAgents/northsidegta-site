import React, { useMemo, useRef, useState } from "react";
import HeaderShell from "./components/HeaderShell";
import SmartContactForm from "./components/contact/SmartContactForm";
import Button from "./components/ui/Button";
// ⬇️ remove the Legacy import and the feature flag
// import LegacyContactPage from "./components/contact/LegacyContactPage";
import {
  useContactConfig,
  useContactChannels,
  // getContactFeatureEnabled, // remove this
  getJsonLd,
  getFormEndpoint,
} from "./components/contact/contactConfig";
import DynamicMetaTags from "./components/seo/DynamicMetaTags";
import { trackEvent } from "./utils/analytics";

export default function ContactPage() {
  // Always render the new version
  return <ContactPageV2 />;
}

function ContactPageV2() {
  const config = useContactConfig();
  const channels = useContactChannels(config);
  const formRef = useRef(null);
  const formSectionRef = useRef(null);

  const whatsappChannel = useMemo(
    () => channels.find((item) => item.key === "whatsapp"),
    [channels]
  );
  const jsonLd = useMemo(() => getJsonLd(config), [config]);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrimary = () => {
    trackEvent("hero_cta_click", { route: "/contact", cta: "send_message" });
    scrollToForm();
  };

  const handleWhatsapp = (event) => {
    trackEvent("hero_cta_click", { route: "/contact", cta: "chat_whatsapp" });
    trackEvent("click_whatsapp", { route: "/contact", source: "hero" });
    if (!whatsappChannel?.href) {
      event.preventDefault();
    }
  };

  return (
    <>
      <DynamicMetaTags
        route="/contact"
        documentTitle={config.seoTitle}
        title={config.seoTitle}
        description={config.seoDescription}
        canonicalUrl="https://northsidegta.ca/contact"
        ogType="website"
        ogImage={config.seoImage || undefined}
        twitterCard="summary_large_image"
        twitterImage={config.seoImage || undefined}
      >
        <script type="application/ld+json">{jsonLd}</script>
      </DynamicMetaTags>
      <HeaderShell />
      <main className="bg-slate-50 pb-20">
        <section
          className="contact-hero"
          style={{
            backgroundImage:
              "url('/uploads/contact-hero-finally-home-agents.jpg')",
          }}
        >
          <div className="contact-hero-content">
            <p className="contact-hero-eyebrow">Finally Home Agents</p>
            <h1 className="contact-hero-heading">{config.heroHeadline}</h1>
            <p className="contact-hero-subhead">{config.heroSubhead}</p>
            {config.responsePledge && (
              <p className="contact-hero-response">{config.responsePledge}</p>
            )}
            <div className="contact-hero-actions">
              <Button
                size="lg"
                onClick={handlePrimary}
                className="contact-hero-primary"
              >
                {config.heroPrimaryCtaLabel || "Send a Message"}
              </Button>
              {whatsappChannel?.href && (
                <a
                  href={whatsappChannel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsapp}
                  className="contact-hero-secondary"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-inner shadow-black/30 transition-transform duration-200 ease-out hover:scale-105">
                    <WhatsAppGlyph className="h-5 w-5 text-white" />
                  </span>
                  <span className="flex flex-col text-left text-sm leading-tight">
                    <span>{config.heroSecondaryCtaLabel || "Chat on WhatsApp"}</span>
                    <span className="text-[11px] font-medium text-emerald-100">
                      Concierge replies in minutes
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="px-4 pt-16 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-4xl">
            <CallbackFormCard />
          </section>

          <section className="mx-auto mt-16 flex max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)] lg:items-start lg:gap-12">
            <section className="order-2 space-y-6 lg:order-1" ref={formSectionRef} id="contact-form">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 pt-10 shadow-xl shadow-emerald-100 sm:p-9 sm:pt-12">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                />
                <SmartContactForm
                  config={config}
                  formRef={formRef}
                  whatsappChannel={whatsappChannel}
                />
              </div>
              {config.coverageLine && (
                <p className="text-center text-sm text-slate-600">
                  {config.coverageLine}
                </p>
              )}
            </section>
            <div className="order-1 space-y-6 lg:order-2">
              <TrustCard />
              <AgentCard
                name="Matthew Mulhall"
                teamRole="Real Estate Agent | Finally Home Agents"
                brokerage="HomeLife Optimum Realty, Brokerage"
                accent="Co-Founder, NorthSide GTA"
                imageSrc="/Images/matthew.jpg"
                imageAlt="Headshot of Matthew Mulhall, co-founder of Finally Home Agents."
              />
              <AgentCard
                name="Landon Mulhall"
                teamRole="Real Estate Agent | Finally Home Agents"
                brokerage="HomeLife Optimum Realty, Brokerage"
                accent="Co-Founder, NorthSide GTA"
                imageSrc="/Images/landon.jpg"
                imageAlt="Headshot of Landon Mulhall, co-founder of Finally Home Agents."
              />
              <section className="mt-6">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium tracking-[0.16em] uppercase text-emerald-700">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold">
                      NorthSide GTA
                    </span>
                    <span className="hidden h-px flex-1 bg-emerald-200 sm:block" />
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] tracking-[0.18em]">
                      <span>Uxbridge</span>
                      <span>Stouffville</span>
                      <span>East Gwillimbury</span>
                      <span>Newmarket</span>
                      <span>Georgina</span>
                      <span>Aurora</span>
                      <span>Scugog</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function CallbackFormCard() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formEndpoint = useMemo(() => getFormEndpoint(), []);

  const validations = useMemo(() => {
    const issues = {};
    if (!name.trim()) {
      issues.name = "Name is required.";
    }
    if (!phone.trim()) {
      issues.phone = "Phone number is required.";
    }
    return issues;
  }, [name, phone]);

  const visibleErrors = showErrors ? validations : {};

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (Object.keys(validations).length > 0) {
      setShowErrors(true);
      Object.entries(validations).forEach(([field, reason]) => {
        trackEvent("callback_form_validation_error", {
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
      payload.append("phone", phone);
      if (notes.trim()) {
        payload.append("message", notes.trim());
      }
      payload.append("source", "callback");

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
      trackEvent("callback_form_submit", { route: "/contact" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-900">We’ll be in touch shortly</h2>
        <p className="mt-2 text-sm text-slate-700">
          Thanks for your request! A member of the team will give you a call between 9am–9pm.
        </p>
      </div>
    );
  }

  const panelId = "callback-card-panel";
  const formTitleId = "callback-card-form-title";
  const headerTextId = "callback-card-heading";

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:px-8"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-labelledby={headerTextId}
      >
        <span className="inline-flex flex-none items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
          Premium callback
        </span>
        <span id={headerTextId} className="flex-1 text-sm font-semibold text-emerald-900 sm:text-base">
          Get a fast call back from our team (9am–9pm)
        </span>
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-full border border-emerald-100 text-emerald-600 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </button>

      {expanded && (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5 border-t border-emerald-100 px-6 py-6 sm:px-8"
          aria-labelledby={formTitleId}
          id={panelId}
        >
          <div className="space-y-2 text-left">
            <h2 id={formTitleId} className="text-2xl font-semibold text-emerald-950">
              Request a call back
            </h2>
            <p className="text-sm text-slate-700">
              Prefer to talk it through? Leave your details and we’ll call you back between 9am–9pm.
            </p>
          </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CallbackField
          id="callback-name"
          label="Name"
          value={name}
          onChange={setName}
          required
          placeholder="Your name"
          error={visibleErrors.name}
        />
        <CallbackField
          id="callback-phone"
          label="Phone number"
          value={phone}
          onChange={setPhone}
          required
          type="tel"
          placeholder="(xxx) xxx-xxxx"
          error={visibleErrors.phone}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="callback-notes" className="text-sm font-semibold text-emerald-900">
          Brief notes <span className="text-emerald-700/60">(optional)</span>
        </label>
        <textarea
          id="callback-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="min-h-[90px] rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-base text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Share anything helpful for our call"
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-500">
          We respond fast
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full rounded-2xl sm:w-auto"
        >
          {submitting ? "Requesting…" : "Request Call Back"}
        </Button>
      </div>
        </form>
      )}
    </div>
  );
}

function CallbackField({ id, label, value, onChange, required, placeholder, error, type = "text" }) {
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
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className={`rounded-2xl border px-4 py-3 text-base text-emerald-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
          error ? "border-rose-400" : "border-emerald-100 bg-white"
        }`}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function TrustCard() {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100">
      <h2 className="text-xl font-semibold text-emerald-950">Why you’ll love working with us</h2>
      <p className="mt-3 text-sm text-slate-700">
        Premium, concierge-level representation for buyers and sellers across the NorthSide GTA.
      </p>
      <ul className="mt-5 space-y-3 text-sm text-emerald-900">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-400" aria-hidden />
          <span>Local experts: we don’t just work here — we live here.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-400" aria-hidden />
          <span>Concierge-level guidance from first chat to closing.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-400" aria-hidden />
          <span>Fast, human replies (9am–9pm).</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-400" aria-hidden />
          <span>Neighborhood intel you won’t find on portals.</span>
        </li>
      </ul>
      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-800">
        Featured on <span className="ml-2 text-emerald-600">5.0 ★ on Google</span>
      </div>
    </div>
  );
}

function AgentCard({ name, teamRole, brokerage, accent, imageSrc, imageAlt }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg shadow-emerald-100">
      <div className="flex items-center gap-4">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-16 w-16 flex-none rounded-full object-cover shadow"
        />
        <div>
          <h3 className="text-lg font-semibold text-emerald-950">{name}</h3>
          <p className="text-sm font-medium text-emerald-900">{teamRole}</p>
          <p className="text-sm font-medium text-emerald-900">{brokerage}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            {accent}
          </p>
        </div>
      </div>
      <a
        href="#contact-form"
        onClick={() => trackEvent("agent_card_cta", { route: "/contact", agent: name })}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
      >
        Contact {name.split(" ")[0]}
        <span aria-hidden className="text-base">→</span>
      </a>
    </div>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.18l3.71-2.95a.75.75 0 1 1 .94 1.17l-4.22 3.36a.75.75 0 0 1-.94 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppGlyph({ className = "h-4 w-4 text-[#25D366]" }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 2.25c-5.37 0-9.75 4.38-9.75 9.75 0 1.72.45 3.39 1.31 4.88L2 22l5.29-1.51A9.7 9.7 0 0 0 12 21.75c5.37 0 9.75-4.38 9.75-9.75S17.37 2.25 12 2.25Zm0 17.5c-1.55 0-3.07-.41-4.42-1.2l-.32-.19-3.13.9.9-3.06-.2-.34A7.32 7.32 0 0 1 4.5 12C4.5 7.87 7.87 4.5 12 4.5s7.5 3.37 7.5 7.5-3.37 7.75-7.5 7.75Zm4.15-5.8c-.23-.12-1.35-.67-1.56-.75-.21-.08-.36-.12-.5.12-.15.23-.58.75-.71.91-.13.16-.26.18-.49.06-.23-.12-.98-.36-1.86-1.11-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.5-1.2-.69-1.64-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.4.06-.61.3-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.12.16 1.6 2.45 3.88 3.33.54.23.97.36 1.3.46.55.18 1.05.16 1.45.1.44-.07 1.35-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.09-.21-.15-.44-.27Z"
      />
    </svg>
  );
}
