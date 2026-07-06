import React from "react";
import TownButtonLink from "./TownButtonLink";

export default function TownHeroCtas({
  townName,
  primaryHref,
  primaryLabel,
  secondaryHref = "/about",
  secondaryLabel = "Connect With Our Team",
}) {
  if (!townName) return null;

  const resolvedPrimaryLabel = primaryLabel || `Explore Homes in ${townName}`;

  return (
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <div className="rounded-3xl border border-white/10 bg-emerald-950/95 px-5 py-6 text-white shadow-lg sm:px-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold sm:text-xl">Thinking about {townName}?</h2>
          <p className="text-sm text-emerald-100/90 sm:text-base">
            Explore homes on the market or connect with our team to talk about your move.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <TownButtonLink
              href={primaryHref || "#"}
              label={resolvedPrimaryLabel}
              variant="primary"
            />
          </div>
          <div className="w-full sm:w-auto">
            <TownButtonLink
              href={secondaryHref}
              label={secondaryLabel}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
