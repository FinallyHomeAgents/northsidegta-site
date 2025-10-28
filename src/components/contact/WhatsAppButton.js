import React from "react";
import classNames from "classnames";

export const WhatsAppGlyph = React.memo(function WhatsAppGlyph({
  className = "h-4 w-4 text-[#25D366]",
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 2.25c-5.37 0-9.75 4.38-9.75 9.75 0 1.72.45 3.39 1.31 4.88L2 22l5.29-1.51A9.7 9.7 0 0 0 12 21.75c5.37 0 9.75-4.389.75-9.75S17.37 2.25 12 2.25Zm0 17.5c-1.55 0-3.07-.41-4.42-1.2l-.32-.19-3.13.9.9-3.06-.2-.34A7.32 7.32 0 0 1 4.5 12C4.5 7.87 7.87 4.5 12 4.5s7.5 3.37 7.5 7.5-3.37 7.75-7.5 7.75Zm4.15-5.8c-.23-.12-1.35-.67-1.56-.75-.21-.08-.36-.12-.5.12-.15.23-.58.75-.71.91-.13.16-.26.18-.49.06-.23-.12-.98-.36-1.86-1.11-.69-.61-1.15-1.37-1.29-1.6-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.39.08-.16.04-.3-.02-.42-.06-.12-.5-1.2-.69-1.64-.18-.44-.37-.38-.5-.39h-.43c-.15 0-.4.06-.61.3-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.12.16 1.6 2.45 3.88 3.33.54.23.97.36 1.3.46.55.18 1.05.16 1.45.1.44-.07 1.35-.55 1.55-1.09.19-.54.19-1 .13-1.09-.06-.09-.21-.15-.44-.27Z"
      />
    </svg>
  );
});

const BASE_CLASSES =
  "group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:border-white/40 hover:bg-white/20";

const ICON_WRAPPER_CLASSES =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-inner shadow-black/30 transition group-hover:scale-105";

const TEXT_STACK_CLASSES = "flex flex-col text-left text-base leading-tight";

const SUBTITLE_CLASSES = "text-xs font-medium text-emerald-100";

const DEFAULT_SUBTITLE = "Message your agent instantly";

const WhatsAppButton = React.forwardRef(function WhatsAppButton(
  {
    href,
    label = "Chat on WhatsApp",
    subtitle = DEFAULT_SUBTITLE,
    className = "",
    onClick,
    ...anchorProps
  },
  ref
) {
  if (!href) return null;

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={classNames(BASE_CLASSES, className)}
      {...anchorProps}
    >
      <span className={ICON_WRAPPER_CLASSES}>
        <WhatsAppGlyph className="h-5 w-5 text-white" />
      </span>
      <span className={TEXT_STACK_CLASSES}>
        <span>{label}</span>
        {subtitle ? <span className={SUBTITLE_CLASSES}>{subtitle}</span> : null}
      </span>
    </a>
  );
});

export default WhatsAppButton;
