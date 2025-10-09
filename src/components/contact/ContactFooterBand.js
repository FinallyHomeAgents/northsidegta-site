import React from "react";
import { trackEvent } from "../../utils/analytics";

export default function ContactFooterBand({ config, channels = [] }) {
  const callChannel = channels.find((item) => item.key === "call") || {};
  const emailChannel = channels.find((item) => item.key === "email") || {};

  return (
    <footer className="mt-16 rounded-3xl bg-slate-900 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Finally Home Agents</p>
            <p className="mt-2 text-lg font-semibold text-white">{config.footerBrokerageCopy}</p>
            {config.footerAreas && (
              <p className="mt-1 text-sm text-slate-300">{config.footerAreas}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {callChannel.href && (
              <a
                href={callChannel.href}
                onClick={() => trackEvent("click_call", { route: "/contact", source: "footer" })}
                className="hover:text-emerald-300 transition"
              >
                {(callChannel.label || "Call")}: {callChannel.href.replace("tel:", "")}
              </a>
            )}
            {emailChannel.href && (
              <a
                href={emailChannel.href}
                onClick={() => trackEvent("click_email", { route: "/contact", source: "footer" })}
                className="hover:text-emerald-300 transition"
              >
                {(emailChannel.label || "Email")}: contact@finallyhomeagents.com
              </a>
            )}
          </div>
        </div>

        {Array.isArray(config.footerSecondaryLinks) && config.footerSecondaryLinks.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            {config.footerSecondaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-emerald-300 transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Finally Home Agents. All rights reserved. Real Broker Ontario Ltd., Brokerage.
        </p>
      </div>
    </footer>
  );
}
