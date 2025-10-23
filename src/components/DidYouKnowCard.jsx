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
    <div
      className={`flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur transition duration-500 ease-out ${className}`}
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-100">
          Did You Know?
        </span>
        <p className="mt-4 text-lg font-medium text-white sm:text-xl">
          {fact}
        </p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />
        Rotating insights
      </div>
    </div>
  );
}
