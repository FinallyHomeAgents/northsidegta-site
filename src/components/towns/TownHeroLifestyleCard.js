import React, { useId, useMemo, useState } from "react";

function splitParagraphs(text) {
  if (!text) return [];
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function TownHeroLifestyleCard({ title, teaser, fullText }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const paragraphs = useMemo(() => splitParagraphs(fullText), [fullText]);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div
      className="bg-white/92 backdrop-blur-sm shadow-xl rounded-2xl p-4 sm:p-5 text-slate-800 flex flex-col max-h-[70%] md:max-h-[75%] overflow-hidden border border-emerald-50/70 min-h-0"
    >
      <div className="space-y-2">
        {title && (
          <h2 className="text-xl sm:text-2xl font-semibold text-emerald-900">
            {title}
          </h2>
        )}
        {teaser && (
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
            {teaser}
          </p>
        )}
      </div>

      <div
        id={contentId}
        aria-hidden={!expanded}
        className={`mt-2 space-y-3 text-sm sm:text-base text-slate-800 leading-relaxed transition-all duration-300 min-h-0 ${
          expanded
            ? "overflow-y-auto max-h-[320px] sm:max-h-[360px] md:max-h-[420px] pr-1"
            : "overflow-hidden max-h-0 opacity-0"
        }`}
      >
        {paragraphs.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-900 self-start"
      >
        {expanded ? "Show less" : "Read more about living in Uxbridge"}
        <span className="text-xs" aria-hidden>
          {expanded ? "▲" : "▼"}
        </span>
      </button>
    </div>
  );
}
