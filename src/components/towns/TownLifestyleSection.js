import React, { useId, useMemo, useState } from "react";
import classNames from "classnames";

function normalizeParagraphs(fullText) {
  if (Array.isArray(fullText)) {
    return fullText.map((paragraph) => String(paragraph || "").trim()).filter(Boolean);
  }

  return String(fullText || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function TownLifestyleSection({
  title,
  teaser,
  fullText,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  const paragraphs = useMemo(() => normalizeParagraphs(fullText), [fullText]);

  return (
    <section
      className={classNames(
        "max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 py-8 border-t border-slate-200",
        className,
      )}
    >
      <div className="space-y-3">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">{title}</h2>
        )}
        {teaser && (
          <p className="text-base sm:text-lg text-slate-700">{teaser}</p>
        )}
        {paragraphs.length > 0 && (
          <div
            id={contentId}
            className={classNames(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
            )}
            aria-hidden={!isExpanded}
          >
            <div className="pt-1">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${contentId}-${index}`}
                  className="mt-2 text-base leading-relaxed text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
        {paragraphs.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            >
              {isExpanded ? (
                <>
                  <span aria-hidden>▲</span>
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <span aria-hidden>▼</span>
                  <span>Continue reading</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
