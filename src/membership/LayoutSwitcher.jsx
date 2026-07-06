import React from "react";
import { Link } from "react-router-dom";

const OPTIONS = [
  { label: "Option 1", path: "/northside-pass-preview/option-1" },
  { label: "Option 2", path: "/northside-pass-preview/option-2" },
  { label: "Option 3", path: "/northside-pass-preview/option-3" },
  { label: "Option 4", path: "/northside-pass-preview/option-4" },
  { label: "Option 5", path: "/northside-pass-preview/option-5" },
];

const LayoutSwitcher = ({ active, tone = "dark" }) => {
  const isLight = tone === "light";
  const wrapperClass = isLight
    ? "border-slate-200 bg-white text-slate-800"
    : "border-white/15 bg-white/10 text-white";
  const activeClass = isLight ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm";
  const inactiveClass = isLight ? "text-slate-700 hover:bg-slate-100" : "text-white/90 hover:bg-white/10";

  return (
    <nav
      className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-sm backdrop-blur ${wrapperClass}`}
    >
      {OPTIONS.map((option) => {
        const isActive = active === option.path;
        return (
          <Link
            key={option.path}
            to={option.path}
            className={`rounded-full px-3 py-1 font-semibold transition ${isActive ? activeClass : inactiveClass}`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default LayoutSwitcher;
