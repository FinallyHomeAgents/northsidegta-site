import React from "react";
import { Link } from "react-router-dom";

export default function TownButtonLink({
  href,
  label,
  variant = "primary",
  className = "",
}) {
  if (!href || !label) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantClasses =
    variant === "secondary"
      ? "border border-white/70 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-green focus-visible:ring-white focus-visible:ring-offset-emerald-900"
      : "bg-brand-green text-white shadow transition-colors hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:ring-brand-green/50 focus-visible:ring-offset-emerald-900";

  const combinedClassName = `${baseClasses} ${variantClasses} ${className}`.trim();

  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link to={href} className={combinedClassName}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={combinedClassName}>
      {label}
    </a>
  );
}
