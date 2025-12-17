import React from "react";
import { KEY_BENEFITS } from "./membershipContent";

const toneStyles = {
  dark: {
    label: "text-emerald-200",
    heading: "text-white",
    body: "text-slate-100/80",
    tile: "bg-white/5 border-white/10 text-white",
    tileBody: "text-slate-100/80",
    badgeBg: "bg-white/10 border-white/10 text-emerald-200",
  },
  light: {
    label: "text-emerald-700",
    heading: "text-slate-900",
    body: "text-slate-700",
    tile: "bg-white border-emerald-100 text-emerald-900",
    tileBody: "text-emerald-800/90",
    badgeBg: "bg-emerald-50 border-emerald-100 text-emerald-800",
  },
};

const CardIdentityContent = ({ tone = "dark", className = "" }) => {
  const palette = toneStyles[tone] || toneStyles.dark;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-3">
        <p className={`text-xs uppercase tracking-[0.2em] font-semibold ${palette.label}`}>Membership Identity</p>
        <h2 className={`text-3xl sm:text-4xl font-bold leading-tight ${palette.heading}`}>
          Your official NorthSide GTA Membership Card.
        </h2>
        <p className={`text-base max-w-xl ${palette.body}`}>
          The symbol of belonging for the NorthSide GTA — centered, elevated, and ready the moment you join.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {KEY_BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className={`rounded-2xl p-4 shadow-sm ${palette.tile}`}
          >
            <h3 className="text-lg font-semibold">{benefit.title}</h3>
            <p className={`mt-2 text-sm ${palette.tileBody}`}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardIdentityContent;
