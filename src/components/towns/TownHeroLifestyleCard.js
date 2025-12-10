import React, { useId, useMemo, useState } from "react";

export default function TownHeroLifestyleCard({ title, teaser, fullText }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const paragraphs = useMemo(() => {
    if (!fullText) return [];
    return fullText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [fullText]);

  if (!title && !teaser) return null;

  return (
    <div className="max-w-2xl rounded-2xl border border-emerald-100 bg-[#f5f8f1] p-4 text-slate-900 shadow-lg sm:p-5 md:p-6">
      {title && (
        <h2 className="mb-2 text-lg font-semibold text-emerald-900 sm:text-xl">
          {title}
        </h2>
      )}
      <div
        id={contentId}
        className={`text-sm leading-relaxed text-slate-800 transition-all duration-200 sm:text-base ${
          expanded
            ? "max-h-60 sm:max-h-72 overflow-y-auto pr-1"
            : "max-h-28 sm:max-h-32 overflow-hidden"
        }`}
      >
        {teaser && <p>{teaser}</p>}
        {expanded &&
          paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-3">
              {paragraph}
            </p>
          ))}
      </div>
      {fullText && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-900"
        >
          {expanded ? "Show less" : "Read more about living in Uxbridge"}
          <span className="text-xs">{expanded ? "▴" : "▾"}</span>
        </button>
      )}
    </div>
  );
}
