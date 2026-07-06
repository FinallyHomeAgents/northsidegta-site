import React from "react";
import { trackEvent } from "../../utils/analytics";

export default function ContactFooterBand({ config, channels = [] }) {
  const callChannel = channels.find((item) => item.key === "call") || {};
  const emailChannel = channels.find((item) => item.key === "email") || {};
  const whatsappChannel = channels.find((item) => item.key === "whatsapp") || {};

  const formattedCall = callChannel.href ? callChannel.href.replace("tel:", "") : null;
  const agentCards = Array.isArray(config.footerAgents) && config.footerAgents.length > 0
    ? config.footerAgents
    : [
        {
          name: "Matthew Mulhall",
          title: "Real Estate Agent",
          descriptor: "Finally Home Agents",
          brokerage: "HomeLife Optimum Realty Brokerage",
          phoneLabel: formattedCall,
          email: emailChannel.href,
          emailLabel: "contact@finallyhomeagents.com",
        },
      ];

  const secondaryLinks = Array.isArray(config.footerSecondaryLinks)
    ? config.footerSecondaryLinks.filter((link) => link && link.href && link.label)
    : [];

  return (
    <footer className="relative mt-20 overflow-hidden rounded-t-[48px] bg-emerald-950 text-emerald-50">
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 opacity-95"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.5),_transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          {agentCards.map((agent) => (
            <article
              key={agent.name}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-lg shadow-emerald-900/30 backdrop-blur"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100">
                Finally Home Agents
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">{agent.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-emerald-100/90">
                <p>{agent.title || "Real Estate Agent"}</p>
                <p>{agent.descriptor || "Finally Home Agents"}</p>
                <p>{agent.brokerage || config.footerBrokerageCopy || "HomeLife Optimum Realty Brokerage"}</p>
              </div>

              <dl className="mt-6 space-y-3 text-sm text-emerald-100">
                {formattedCall && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.28em] text-emerald-200">Call or text</dt>
                    <dd>
                      <a
                        href={callChannel.href}
                        onClick={() =>
                          trackEvent("click_call", { route: "/contact", source: "footer" })
                        }
                        className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white transition hover:text-emerald-200"
                      >
                        <span aria-hidden className="text-emerald-200">📞</span>
                        {agent.phoneLabel || formattedCall}
                      </a>
                    </dd>
                  </div>
                )}
                {emailChannel.href && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.28em] text-emerald-200">Email</dt>
                    <dd>
                      <a
                        href={agent.email || emailChannel.href}
                        onClick={() =>
                          trackEvent("click_email", { route: "/contact", source: "footer" })
                        }
                        className="mt-1 inline-flex items-center gap-2 text-base text-emerald-100 transition hover:text-white"
                      >
                        <span aria-hidden className="text-emerald-200">✉️</span>
                        {agent.emailLabel || "contact@finallyhomeagents.com"}
                      </a>
                    </dd>
                  </div>
                )}
                {whatsappChannel.href && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.28em] text-emerald-200">Concierge WhatsApp</dt>
                    <dd>
                      <a
                        href={whatsappChannel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("click_whatsapp", { route: "/contact", source: "footer" })
                        }
                        className="mt-1 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-105"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          <WhatsAppIcon className="h-4 w-4 text-white" />
                        </span>
                        Instant concierge reply
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 text-sm text-emerald-100 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              Service area
            </p>
            {config.footerAreas && <p>{config.footerAreas}</p>}
          </div>
          {secondaryLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-emerald-100">
              {secondaryLinks.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-emerald-200/80">
          <p>© {new Date().getFullYear()} Finally Home Agents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.25c-5.37 0-9.75 4.38-9.75 9.75 0 1.72.45 3.39 1.31 4.88L2 22l5.29-1.51A9.7 9.7 0 0 0 12 21.75c5.37 0 9.75-4.38 9.75-9.75S17.37 2.25 12 2.25Zm0 17.5c-1.55 0-3.07-.41-4.42-1.2l-.32-.19-3.13.9.9-3.06-.2-.34A7.32 7.32 0 0 1 4.5 12C4.5 7.87 7.87 4.5 12 4.5s7.5 3.37 7.5 7.5-3.37 7.75-7.5 7.75Zm4.15-5.8c-.23-.12-1.35-.67-1.56-.75-.21-.08-.36-.12-.5.12-.15.23-.58.75-.71.91-.13.16-.26.18-.49.06-.23-.12-.98-.36-1.86-1.11-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.5-1.2-.69-1.64-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.4.06-.61.3-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.12.16 1.6 2.45 3.88 3.33.54.23.97.36 1.3.46.55.18 1.05.16 1.45.1.44-.07 1.35-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.09-.21-.15-.44-.27Z" />
    </svg>
  );
}
