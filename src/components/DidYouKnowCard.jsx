import React, { useEffect, useMemo, useRef, useState } from "react";

function useRotatingIndex(length, initialIndex, interval) {
  const safeLength = Math.max(length, 1);
  const startingIndex = ((initialIndex % safeLength) + safeLength) % safeLength;
  const [index, setIndex] = useState(startingIndex);
  const savedInterval = useRef(interval);

  useEffect(() => {
    savedInterval.current = interval;
  }, [interval]);

  useEffect(() => {
    if (safeLength <= 1) {
      return undefined;
    }

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeLength);
    }, savedInterval.current);

    return () => clearInterval(id);
  }, [safeLength]);

  useEffect(() => {
    setIndex(startingIndex);
  }, [startingIndex]);

  return index % safeLength;
}

export default function DidYouKnowCard({
  facts = [],
  initialIndex = 0,
  rotateInterval = 8000,
  className = "",
}) {
  const preparedFacts = useMemo(() => facts.filter(Boolean), [facts]);
  const currentIndex = useRotatingIndex(
    preparedFacts.length,
    initialIndex,
    Math.max(rotateInterval, 3000)
  );
  const fact = preparedFacts[currentIndex] || "";

  return (
    <div className={`group relative ${className}`}>
      <div
        className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-r from-emerald-400/40 via-emerald-500/25 to-emerald-400/40 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(3,22,18,0.55)] backdrop-blur-xl transition duration-500 ease-out group-hover:border-white/30 group-hover:bg-white/15">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_65%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10 sm:py-9">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
              Did You Know?
            </span>
            <p className="mt-4 text-lg font-medium text-white sm:text-2xl">
              {fact}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100/70 sm:self-center">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />
            Rotating insights
          </div>
        </div>
      </div>
    </div>
  );
}
