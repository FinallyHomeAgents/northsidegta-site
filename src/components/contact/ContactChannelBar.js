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
    <aside className="relative z-30">
      <div className="hidden md:flex items-center justify-center gap-4 py-4">
        {channels.map((item) => (
          <ChannelButton key={item.key} item={item} onClick={() => handleClick(item.key)} />
        ))}
      </div>

      <div className="md:hidden fixed inset-x-4 bottom-safe-bar">
        <div className="flex flex-col items-center gap-2">
          {microcopy && (
            <div className="rounded-full bg-white/90 backdrop-blur text-emerald-700 text-xs font-medium px-4 py-1 shadow">
              {microcopy}
            </div>
          )}
          <div className="w-full rounded-2xl bg-slate-900/95 text-white shadow-lg shadow-slate-900/20 ring-1 ring-black/10">
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
      </div>
    </aside>
  );
}

function ChannelButton({ item, onClick, compact = false }) {
  if (!item?.href) return null;
  const label = item.label || CTA_LABELS[item.key] || "Contact";
  const target = getTargetForHref(item.href);
  const rel = getRel(item.href);

  const baseClasses = compact
    ? "flex-1 text-center text-xs font-semibold tracking-wide px-2 py-3"
    : "px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-emerald-400 hover:text-emerald-600 transition";

  return (
    <a
      href={item.href}
      target={target}
      rel={rel}
      className={classNames(baseClasses, {
        "hover:bg-emerald-50": !compact,
        "hover:bg-white/90": compact,
      })}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {label}
    </a>
  );
}
