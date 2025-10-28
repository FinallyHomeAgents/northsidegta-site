// src/Footer.js
import React from "react";
import { FaInstagram } from "react-icons/fa";
import { getSocialLinks } from "./data/socialLinks";
import { SOCIAL_ICON_MAP } from "./components/SocialFollowStrip";

export default function Footer() {
  const socials = React.useMemo(() => getSocialLinks(), []);

  return (
    <footer className="bg-white/90 py-8 text-center text-sm text-gray-600">
      {socials.length > 0 && (
        <div className="mb-4 flex justify-center gap-3">
          {socials.map((item) => {
            const Icon = SOCIAL_ICON_MAP[item.key] || FaInstagram;
            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-700 transition hover:bg-emerald-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}
      <div>
        © 2025 NorthSide GTA | Finally Home Agents{' '}
        <span aria-hidden="true">•</span>{' '}
        <a
          href="/events/archive"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Past Events Archive
        </a>
      </div>
    </footer>
  );
}
