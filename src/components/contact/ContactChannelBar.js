import React from "react";
import classNames from "classnames";
import { trackEvent } from "../../utils/analytics";

const CTA_LABELS = {
  call: "Call",
  text: "Text",
  email: "Email",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
};

const ICONS = {
  call: PhoneIcon,
  text: MessageIcon,
  email: MailIcon,
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};

function getTargetForHref(href) {
  if (!href) return undefined;
  if (href.startsWith("http")) return "_blank";
  return undefined;
}

function getRel(href) {
  if (!href) return undefined;
  if (href.startsWith("http")) return "noopener noreferrer";
  return undefined;
}

export default function ContactChannelBar({ channels, microcopy }) {
  if (!channels || channels.length === 0) return null;

  const handleClick = (key) => {
    trackEvent(`click_${key}`, { route: "/contact", source: "channel_bar" });
  };

  return (
    <aside className="relative z-30 -mt-12 mb-6 md:mb-10">
      <div className="mx-auto hidden max-w-6xl px-4 md:block">
        <div className="rounded-3xl bg-white/95 shadow-xl shadow-emerald-900/5 backdrop-blur ring-1 ring-emerald-100">
          <div className="flex flex-col gap-6 px-6 py-7 lg:px-9">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
                  Concierge desk
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-800">
                  {microcopy || "We usually reply in minutes."}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold uppercase tracking-[0.25em]">
                  Premium access
                </span>
                <span>Call · Text · Email · WhatsApp · Social</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {channels.map((item) => (
                <ChannelButton key={item.key} item={item} onClick={() => handleClick(item.key)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed inset-x-4 bottom-safe-bar">
        <div className="rounded-3xl bg-emerald-900/95 p-4 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/30 backdrop-blur">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
              Concierge desk
            </span>
            <span className="text-emerald-200/80">Always on</span>
          </div>
          {(microcopy || "We usually reply in minutes.") && (
            <p className="mt-2 text-[11px] font-medium text-emerald-100/90">
              {microcopy || "We usually reply in minutes."}
            </p>
          )}
          <div className="flex divide-x divide-white/10">
            {channels.map((item) => (
              <ChannelButton
                key={item.key}
                item={item}
                compact
                onClick={() => handleClick(item.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function ChannelButton({ item, onClick, compact = false }) {
  if (!item?.href) return null;
  const label = item.label || CTA_LABELS[item.key] || "Contact";
  const target = getTargetForHref(item.href);
  const rel = getRel(item.href);
  const highlight = Boolean(item.highlight);

  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";
  const baseClasses = compact
    ? `group flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-semibold tracking-wide transition ${focusRing}`
    : `group inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition ${focusRing}`;

  const palette = highlight
    ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-emerald-900/20 hover:brightness-105"
    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-emerald-400 hover:text-emerald-600";

  const compactPalette = highlight
    ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-emerald-900/20"
    : "bg-white/10 text-white";

  const iconWrapper = classNames(
    "flex items-center justify-center rounded-full transition",
    compact ? "h-9 w-9" : "h-9 w-9",
    highlight
      ? "bg-white/20 text-white"
      : compact
      ? "bg-white/10 text-emerald-100"
      : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
  );

  const IconComponent = ICONS[item.key];

  return (
    <a
      href={item.href}
      target={target}
      rel={rel}
      className={classNames(baseClasses, compact ? compactPalette : palette)}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {IconComponent && (
        <span className={iconWrapper} aria-hidden>
          <IconComponent className={highlight ? "h-4 w-4 text-white" : "h-4 w-4 text-emerald-600"} />
        </span>
      )}
      {compact ? (
        <>
          <span>{label}</span>
          {highlight && item.badge && (
            <span className="text-[10px] font-medium leading-3 text-emerald-100/90">{item.badge}</span>
          )}
        </>
      ) : (
        <span className="text-left leading-tight">
          <span className="block">{label}</span>
          {highlight && item.badge && (
            <span className="block text-[11px] font-medium text-emerald-100/90">{item.badge}</span>
          )}
        </span>
      )}
    </a>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6.62 3.1a1.5 1.5 0 0 1 2.14 0l1.94 1.94a1.5 1.5 0 0 1 0 2.12l-.97.97a12.05 12.05 0 0 0 4.14 4.14l.97-.97a1.5 1.5 0 0 1 2.12 0l1.94 1.94a1.5 1.5 0 0 1 0 2.14l-1.37 1.37c-.65.65-1.6.9-2.47.63a15.94 15.94 0 0 1-6.44-3.9 15.94 15.94 0 0 1-3.9-6.44c-.27-.87-.02-1.82.63-2.47Z" />
    </svg>
  );
}

function MessageIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M5 4h14a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H9l-3.8 2.85A1 1 0 0 1 4 19.5V6a2 2 0 0 1 1-2Z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 7 8-5H4l8 5Zm-8 5h16V9.25l-8 5-8-5V17Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.25c-5.37 0-9.75 4.38-9.75 9.75 0 1.72.45 3.39 1.31 4.88L2 22l5.29-1.51A9.7 9.7 0 0 0 12 21.75c5.37 0 9.75-4.38 9.75-9.75S17.37 2.25 12 2.25Zm0 17.5c-1.55 0-3.07-.41-4.42-1.2l-.32-.19-3.13.9.9-3.06-.2-.34A7.32 7.32 0 0 1 4.5 12C4.5 7.87 7.87 4.5 12 4.5s7.5 3.37 7.5 7.5-3.37 7.75-7.5 7.75Zm4.15-5.8c-.23-.12-1.35-.67-1.56-.75-.21-.08-.36-.12-.5.12-.15.23-.58.75-.71.91-.13.16-.26.18-.49.06-.23-.12-.98-.36-1.86-1.11-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.5-1.2-.69-1.64-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.4.06-.61.3-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.12.16 1.6 2.45 3.88 3.33.54.23.97.36 1.3.46.55.18 1.05.16 1.45.1.44-.07 1.35-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.09-.21-.15-.44-.27Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5Zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5Zm5.25-4.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13 10h3.5L16 14h-3v7h-3v-7H8v-4h2V8.25C10 5.9 11.57 4 14.3 4H17v4h-2.7c-.2 0-.3.1-.3.3V10Z" />
    </svg>
  );
}
