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
                <a
                  className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:border-white/40 hover:bg-white/20 sm:w-auto"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSecondary}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-inner shadow-black/30 transition group-hover:scale-105">
                    <WhatsAppGlyph className="h-5 w-5 text-white" />
                  </span>
                  <span className="flex flex-col text-left text-base leading-tight">
                    <span>{config.heroSecondaryCtaLabel || "Chat on WhatsApp"}</span>
                    <span className="text-xs font-medium text-emerald-100">
                      Message your agent instantly
                    </span>
                  </span>
                </a>
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
