import React from "react";
import Button from "../ui/Button";
import { trackEvent } from "../../utils/analytics";

export default function ContactHero({
  config,
  onPrimaryClick,
  whatsappHref,
}) {
  const handlePrimary = () => {
    trackEvent("hero_cta_click", { route: "/contact", cta: "send_message" });
    if (onPrimaryClick) onPrimaryClick();
  };

  const handleSecondary = (e) => {
    trackEvent("hero_cta_click", { route: "/contact", cta: "chat_whatsapp" });
    trackEvent("click_whatsapp", { route: "/contact", source: "hero" });
    if (!whatsappHref) {
      e.preventDefault();
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-50 via-white to-transparent" />
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 py-16 sm:py-20">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 mb-4">
          Finally Home Agents
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
          {config.heroHeadline}
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
          {config.heroSubhead}
        </p>
        <p className="mt-3 text-sm sm:text-base text-emerald-700 font-medium">
          {config.responsePledge}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={handlePrimary}>
            {config.heroPrimaryCtaLabel || "Send a Message"}
          </Button>
          {whatsappHref && (
            <a
              className="inline-flex items-center justify-center rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-3 text-lg font-medium transition"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSecondary}
            >
              {config.heroSecondaryCtaLabel || "Chat on WhatsApp"}
            </a>
          )}
        </div>
        {config.coverageLine && (
          <p className="mt-6 text-sm sm:text-base text-slate-500">
            {config.coverageLine}
          </p>
        )}
      </div>
    </section>
  );
}
