import React, { useMemo, useRef } from "react";
import Navigation from "./Navigation";
import SmartContactForm from "./components/contact/SmartContactForm";
import Button from "./components/ui/Button";
// ⬇️ remove the Legacy import and the feature flag
// import LegacyContactPage from "./components/contact/LegacyContactPage";
import {
  useContactConfig,
  useContactChannels,
  // getContactFeatureEnabled, // remove this
  getJsonLd,
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
  const callChannel = useMemo(
    () => channels.find((item) => item.key === "call"),
    [channels]
  );
  const emailChannel = useMemo(
    () => channels.find((item) => item.key === "email"),
    [channels]
  );
  const textChannel = useMemo(
    () => channels.find((item) => item.key === "text"),
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

  const contactDetails = [
    callChannel?.href && {
      label: "Call",
      href: callChannel.href,
      display: callChannel.href.replace("tel:", ""),
      tracking: () => trackEvent("click_call", { route: "/contact", source: "hero" }),
    },
    textChannel?.href && {
      label: "Text",
      href: textChannel.href,
      display: textChannel.href.replace("sms:", ""),
      tracking: () => trackEvent("click_text", { route: "/contact", source: "hero" }),
    },
    emailChannel?.href && {
      label: "Email",
      href: emailChannel.href,
      display: "contact@finallyhomeagents.com",
      tracking: () => trackEvent("click_email", { route: "/contact", source: "hero" }),
    },
  ].filter(Boolean);

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
      <Navigation />
      <main className="bg-slate-50 pb-20">
        <div className="px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8">
          <section className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-700 shadow-sm lg:self-start">
                  Finally Home Agents
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl md:text-[2.75rem]">
                    {config.heroHeadline}
                  </h1>
                  <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                    {config.heroSubhead}
                  </p>
                  {config.responsePledge && (
                    <p className="text-sm font-medium text-emerald-700 sm:text-base">
                      {config.responsePledge}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
                  <Button
                    size="lg"
                    onClick={handlePrimary}
                    className="w-full max-w-xs sm:w-auto"
                  >
                    {config.heroPrimaryCtaLabel || "Send a Message"}
                  </Button>
                  {whatsappChannel?.href && (
                    <a
                      href={whatsappChannel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsapp}
                      className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-base font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-800 sm:w-auto"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-inner">
                        <WhatsAppGlyph className="h-5 w-5 text-white" />
                      </span>
                      <span className="flex flex-col text-left text-sm leading-tight">
                        <span>{config.heroSecondaryCtaLabel || "Chat on WhatsApp"}</span>
                        <span className="text-[11px] font-medium text-emerald-500">
                          Concierge replies in minutes
                        </span>
                      </span>
                    </a>
                  )}
                </div>
                {contactDetails.length > 0 && (
                  <dl className="grid gap-4 pt-4 text-left text-sm text-slate-600 sm:grid-cols-2">
                    {contactDetails.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                        <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                          {item.label}
                        </dt>
                        <dd className="mt-2 text-base font-semibold text-emerald-900">
                          <a
                            href={item.href}
                            onClick={item.tracking}
                            className="transition hover:text-emerald-600"
                          >
                            {item.display}
                          </a>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_32px_90px_rgba(16,185,129,0.18)]">
                  <img
                    src="/uploads/contact-hero-finally-home-agents.jpg"
                    alt="Clean desk scene with a smartphone, notebook, and NorthSide GTA and Finally Home Agents branding, representing how to contact the team."
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            ref={formSectionRef}
            id="contact-form"
            className="mx-auto mt-10 max-w-5xl"
          >
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-emerald-100 ring-1 ring-emerald-100 sm:p-8">
              <SmartContactForm
                config={config}
                formRef={formRef}
                whatsappChannel={whatsappChannel}
              />
            </div>
            {config.coverageLine && (
              <p className="mt-6 text-center text-sm text-slate-600">
                {config.coverageLine}
              </p>
            )}
          </section>
        </div>
      </main>
    </>
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
