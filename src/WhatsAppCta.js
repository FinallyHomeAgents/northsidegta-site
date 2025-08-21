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
        bg-green-600 text-white font-semibold
        px-5 py-3 rounded-xl shadow-md
        hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98]
        transition transform duration-200
        w-full text-center
      "
    >
      <FaWhatsapp className="text-xl" />
      Chat on WhatsApp
    </a>
  );
}
