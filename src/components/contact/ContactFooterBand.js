import React from "react";
import { trackEvent } from "../../utils/analytics";

export default function ContactFooterBand({ config, channels = [] }) {
  const callChannel = channels.find((item) => item.key === "call") || {};
  const emailChannel = channels.find((item) => item.key === "email") || {};
  const whatsappChannel = channels.find((item) => item.key === "whatsapp") || {};

  const formattedCall = callChannel.href ? callChannel.href.replace("tel:", "") : null;
  const agentNames = Array.isArray(config.footerAgents)
    ? config.footerAgents.map((agent) => agent?.name).filter(Boolean)
    : [];
  const agentTitles = Array.isArray(config.footerAgents)
    ? config.footerAgents.map((agent) => agent?.title).filter(Boolean)
    : [];
  const uniqueTitles = Array.from(new Set(agentTitles));
  const agentsLine = agentNames.length > 0 ? agentNames.join(" & ") : "Matthew Mulhall & Landon Mulhall";
  const titlesLine = uniqueTitles.length > 0 ? uniqueTitles.join(" • ") : "Real Estate Agents";

  return (
    <footer className="relative mt-20 overflow-hidden rounded-t-[48px] bg-emerald-950 text-emerald-50">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 opacity-95" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.45),_transparent_65%)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
              Finally Home Agents
            </p>
            <div className="space-y-1 text-lg font-semibold text-white">
              <p>
                {agentsLine}
                <span className="mt-1 block text-sm font-medium text-emerald-100">
                  {`${titlesLine} — Finally Home Agents`}
                </span>
              </p>
              <p className="text-base text-emerald-100/90">
                {config.footerBrokerageCopy || "HomeLife Optimum Realty Brokerage"}
              </p>
            </div>
            {config.footerAreas && (
              <p className="text-sm text-emerald-100/80">{config.footerAreas}</p>
            )}
          </div>

          <div className="grid gap-6 text-sm text-white sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Concierge lines
              </p>
              {formattedCall && (
                <a
                  href={callChannel.href}
                  onClick={() => trackEvent("click_call", { route: "/contact", source: "footer" })}
                  className="flex items-center gap-2 text-lg font-semibold text-white transition hover:text-emerald-100"
                >
                  <span aria-hidden className="text-emerald-200">📞</span>
                  {formattedCall}
                </a>
              )}
              {emailChannel.href && (
                <a
                  href={emailChannel.href}
                  onClick={() => trackEvent("click_email", { route: "/contact", source: "footer" })}
                  className="flex items-center gap-2 text-base text-emerald-100 transition hover:text-white"
                >
                  <span aria-hidden className="text-emerald-200">✉️</span>
                  contact@finallyhomeagents.com
                </a>
              )}
              {whatsappChannel.href && (
                <a
                  href={whatsappChannel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("click_whatsapp", { route: "/contact", source: "footer" })}
                  className="flex items-center gap-2 text-base text-emerald-100 transition hover:text-white"
                >
                  <span aria-hidden className="text-emerald-200">💬</span>
                  Concierge WhatsApp
                </a>
              )}
            </div>

            {Array.isArray(config.footerSecondaryLinks) && config.footerSecondaryLinks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                  Stay curious
                </p>
                <div className="flex flex-col gap-2 text-emerald-100">
                  {config.footerSecondaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-emerald-200/80">
          <p>
            © {new Date().getFullYear()} Finally Home Agents. All rights reserved. HomeLife Optimum Realty Brokerage.
          </p>
        </div>
      </div>
    </footer>
  );
}
