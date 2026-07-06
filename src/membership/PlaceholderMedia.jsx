import React from "react";

const shapeStyles = {
  hero: "w-full h-full min-h-[60vh] rounded-[28px]", // hero will often be absolutely positioned
  circle: "w-28 h-28 rounded-full", // default circle size; can be overridden by parent width classes
  banner: "w-full aspect-[16/9] rounded-2xl",
  panel: "w-full aspect-[4/3] rounded-3xl",
};

const PlaceholderMedia = ({ label = "", shape = "panel", className = "" }) => {
  const baseStyle = shapeStyles[shape] || shapeStyles.panel;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black ${baseStyle} ${className}`}
      aria-label={label}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_35%)]" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
        {label}
      </div>
    </div>
  );
};

export default PlaceholderMedia;
