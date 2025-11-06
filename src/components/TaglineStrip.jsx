import React from "react";

export default function TaglineStrip({ className = "" }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="relative inline-flex w-full max-w-[600px] items-center justify-center rounded-full bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 px-5 py-2 text-[13px] font-semibold tracking-wide text-emerald-950 shadow-[0_18px_45px_rgba(6,95,70,0.32)] ring-1 ring-emerald-500/30 backdrop-blur-sm transition duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(6,95,70,0.38)] sm:px-6 sm:py-2.5 sm:text-sm md:text-base animate-hoverFloat"
      >
        <span className="text-center leading-snug">
          Helping GTA buyers find their next home north of Toronto — with us.
        </span>
      </div>
    </div>
  );
}
