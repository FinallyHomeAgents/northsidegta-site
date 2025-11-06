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
  variant = "standard",
}) {
  const preparedFacts = useMemo(() => facts.filter(Boolean), [facts]);
  const currentIndex = useRotatingIndex(
    preparedFacts.length,
    initialIndex,
    Math.max(rotateInterval, 3000)
  );
  const fact = preparedFacts[currentIndex] || "";

  const configs = {
    standard: {
      outerGlow: true,
      container:
        "rounded-[36px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(3,22,18,0.55)] backdrop-blur-xl transition duration-500 ease-out group-hover:border-white/30 group-hover:bg-white/15",
      inner:
        "relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10 sm:py-9",
      kicker:
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-100",
      fact:
        "mt-3 font-medium text-white text-lg sm:text-2xl",
      status:
        "flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-100/70 sm:self-center",
      copyWrap: "max-w-3xl",
    },
    compact: {
      outerGlow: true,
      container:
        "rounded-[28px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(3,22,18,0.55)] backdrop-blur-xl transition duration-500 ease-out group-hover:border-white/30 group-hover:bg-white/15 sm:rounded-[32px]",
      inner:
        "relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-6",
      kicker:
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-[6px] text-[9px] font-semibold uppercase tracking-[0.32em] text-emerald-100",
      fact:
        "mt-3 font-medium text-white text-[15px] leading-snug sm:text-lg",
      status:
        "flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-[6px] text-[9px] font-semibold uppercase tracking-[0.32em] text-emerald-100/70 sm:self-center",
      copyWrap: "max-w-2xl",
    },
    heroTicker: {
      outerGlow: false,
      container:
        "rounded-none border border-white/10 bg-gradient-to-r from-emerald-950/88 via-emerald-900/82 to-emerald-950/88 shadow-[0_32px_90px_rgba(2,18,12,0.65)] backdrop-blur-xl",
      inner:
        "relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-[22px]",
      kicker:
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-[5px] text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-100/90",
      fact:
        "mt-3 font-medium text-white text-[15px] leading-snug sm:mt-2 sm:text-base md:text-[17px]",
      status:
        "flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-[5px] text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-100/75 sm:self-center",
      copyWrap: "max-w-2xl",
    },
  };

  const {
    outerGlow,
    container,
    inner,
    kicker,
    fact: factClasses,
    status,
    copyWrap,
  } = configs[variant] || configs.standard;

  return (
    <div className={`group relative ${className}`}>
      {outerGlow ? (
        <div
          className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-r from-emerald-400/40 via-emerald-500/25 to-emerald-400/40 blur-2xl"
          aria-hidden
        />
      ) : null}
      <div className={`relative overflow-hidden ${container}`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_65%)]"
          aria-hidden
        />
        <div className={inner}>
          <div className={copyWrap}>
            <span className={kicker}>Did You Know?</span>
            <p className={factClasses}>{fact}</p>
          </div>
          <div className={status}>
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />
            Rotating insights
          </div>
        </div>
      </div>
    </div>
  );
}
