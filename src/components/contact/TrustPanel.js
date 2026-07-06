import React from "react";
import Card from "../ui/Card";

export default function TrustPanel({ config }) {
  const bullets = config.trustBullets || [];
  const badges = config.trustBadges || [];

  if (bullets.length === 0 && badges.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-6 bg-white/90 backdrop-blur">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Why you’ll love working with us</h2>
        <p className="mt-2 text-slate-600 text-base">
          Premium, concierge-level representation for buyers and sellers across the NorthSide GTA.
        </p>
      </div>

      {bullets.length > 0 && (
        <ul className="space-y-3">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-800">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                ✓
              </span>
              <span className="text-base">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {badges.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Featured on</p>
          <div className="flex flex-wrap items-center gap-4">
            {badges.map((badge) => (
              <figure key={badge.label || badge.image} className="flex items-center gap-2">
                {badge.image && (
                  <img
                    src={badge.image}
                    alt={badge.alt || badge.label || "Badge"}
                    className="h-8 object-contain"
                    loading="lazy"
                  />
                )}
                {badge.label && <figcaption className="text-sm text-slate-500">{badge.label}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
