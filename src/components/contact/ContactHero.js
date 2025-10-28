import React from "react";
import Button from "../ui/Button";
import { trackEvent } from "../../utils/analytics";
import WhatsAppButton, { WhatsAppGlyph } from "./WhatsAppButton";

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

  const backgroundOpacity =
    typeof config.heroBackgroundOpacity === "number"
      ? config.heroBackgroundOpacity
      : 0.28;

  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#06110d]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700"
        aria-hidden
      />
      {config.heroBackgroundImage && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${config.heroBackgroundImage})`,
            mixBlendMode: config.heroBackgroundBlendMode || "multiply",
            opacity: backgroundOpacity,
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.55),_transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-20 left-[-12%] h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-900/20 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100">
              Finally Home Agents
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
              {config.heroHeadline}
            </h1>
            <p className="mt-4 text-base text-emerald-100 sm:text-lg md:text-xl">
              {config.heroSubhead}
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-50 sm:text-base">
              {config.responsePledge}
            </p>

            <div className="mt-8 flex flex-col items-center justify-start gap-3 sm:flex-row sm:gap-4 lg:items-stretch">
              <Button
                size="lg"
                onClick={handlePrimary}
                className="w-full max-w-xs shadow-lg shadow-emerald-900/40 sm:w-auto"
              >
                {config.heroPrimaryCtaLabel || "Send a Message"}
              </Button>
              {whatsappHref && (
                <WhatsAppButton
                  href={whatsappHref}
                  onClick={handleSecondary}
                  label={config.heroSecondaryCtaLabel || "Chat on WhatsApp"}
                  className="w-full max-w-xs sm:w-auto"
                />
              )}
            </div>

            {config.coverageLine && (
              <p className="mt-8 text-sm text-emerald-100/90 sm:text-base">
                {config.coverageLine}
              </p>
            )}
          </div>

          {whatsappHref && config.whatsappConciergeLabel && (
            <div className="w-full max-w-sm self-stretch rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-black/30 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-inner">
                  <WhatsAppGlyph className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white uppercase tracking-[0.2em]">
                    Concierge WhatsApp
                  </p>
                  <p className="text-xs text-emerald-100/90">
                    {config.whatsappConciergeLabel}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-100">
                Stay connected like a pro athlete with their coach — voice notes, instant updates, and VIP listings all in one thread.
              </p>
              {config.contactMicrocopy && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
                  {config.contactMicrocopy}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

