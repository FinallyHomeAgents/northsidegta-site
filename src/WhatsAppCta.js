// src/WhatsAppCta.js
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppCtaOption1() {
  return (
    <a
      href="https://wa.me/16475064552"
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center justify-center gap-2
        bg-brand-green text-white font-semibold
        px-5 py-3 rounded-xl shadow-md
        hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] hover:scale-[1.02] active:bg-brand-green-dark active:scale-[0.98]
        transition transform duration-200
        w-full text-center
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2
      "
    >
      <FaWhatsapp className="text-xl" />
      Chat on WhatsApp
    </a>
  );
}
