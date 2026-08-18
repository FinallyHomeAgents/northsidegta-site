import React from "react";

export const TOWN_ORDER = [
  "georgina", "east-gwillimbury", "newmarket",
  "aurora", "stouffville", "uxbridge", "scugog",
];

export default function TerritoryRule({ active, tone = "light" }) {
  const on = tone === "dark" ? "bg-white" : "bg-brand-green";
  const off = tone === "dark" ? "bg-white/30" : "bg-[#DCE8C6]";
  return (
    <div className="flex w-full gap-[4px]" aria-hidden="true">
      {TOWN_ORDER.map((slug) => (
        <span
          key={slug}
          className={`h-[2px] flex-1 rounded-full transition-colors duration-200 ${slug === active ? on : off}`}
        />
      ))}
    </div>
  );
}
