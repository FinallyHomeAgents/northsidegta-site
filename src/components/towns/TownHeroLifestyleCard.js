import React from "react";

export default function TownHeroLifestyleCard({ title, teaser }) {
  if (!title && !teaser) return null;

  return (
    <div className="max-w-xl rounded-2xl border border-emerald-100 bg-[#f5f8f1] p-4 text-slate-900 shadow-lg sm:p-5 md:p-6">
      {title && (
        <h2 className="text-lg font-semibold text-emerald-900 sm:text-xl mb-2">
          {title}
        </h2>
      )}
      {teaser && (
        <p className="text-sm leading-relaxed text-slate-800 sm:text-base">
          {teaser}
        </p>
      )}
    </div>
  );
}
