import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { getSocialLinks } from "../data/socialLinks";

export const SOCIAL_ICON_MAP = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
};

export default function SocialFollowStrip({ alignment = "center" }) {
  const socials = React.useMemo(() => getSocialLinks(), []);

  if (socials.length === 0) {
    return null;
  }

  const justifyClass =
    alignment === "start"
      ? "justify-center sm:justify-start"
      : "justify-center";

  return (
    <div className="border-t border-b border-emerald-100 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.38em] text-emerald-700">
          Follow us
        </span>
        <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${justifyClass} w-full sm:w-auto`}>
          {socials.map((item) => {
            const Icon = SOCIAL_ICON_MAP[item.key] || FaInstagram;
            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700 transition hover:bg-emerald-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
