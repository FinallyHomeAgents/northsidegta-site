import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import { KEY_BENEFITS } from "./membershipContent";

const OptionTwoPage = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [showSoundCta, setShowSoundCta] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = true;

    const attemptAutoplay = videoEl.play();

    if (attemptAutoplay?.catch) {
      attemptAutoplay.catch(() => setAutoplayFailed(true));
    }
  }, [prefersReducedMotion]);

  const handleScrollToForm = () => {
    const target = document.getElementById("claim") || document.getElementById("membership-register");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEnableSound = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    try {
      videoEl.muted = false;
      await videoEl.play();
      setAutoplayFailed(false);
      setShowSoundCta(false);
    } catch (error) {
      setAutoplayFailed(true);
      setShowSoundCta(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>NorthSide Pass — Option 2</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-2" />
      </Helmet>
      <HeaderShell />

      <main className="pb-14">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white border-b border-emerald-100/60">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/75 to-white/85 mix-blend-multiply" aria-hidden="true" />

          <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <LayoutSwitcher active="/northside-pass-preview/option-2" tone="light" />
              <button
                type="button"
                onClick={handleScrollToForm}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur hover:border-emerald-300"
              >
                Registration
              </button>
            </div>

            <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-xl shadow-emerald-100/70 border border-emerald-100 p-4 sm:p-7 space-y-6">
              <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-8 lg:gap-10 items-center">
                <div className="space-y-4 text-center lg:text-left">
                  <div className="flex flex-col items-center lg:items-start gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Option 2 · Framed registration</p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-semibold shadow-sm">
                      Claim Your Pass
                      <span aria-hidden="true">⬇</span>
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">Registration centered in a premium card.</h1>
                  <p className="text-base text-slate-600 max-w-2xl mx-auto lg:mx-0">
                    A tight, two-column layout that keeps the live preview elevated while you claim your NorthSide GTA Pass.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={handleScrollToForm}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40"
                    >
                      Claim Your NorthSideGTA Pass
                    </button>
                    <span className="text-sm text-emerald-800/80 flex items-center gap-1">
                      <span aria-hidden="true">▾</span> Scroll to registration
                    </span>
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-[460px]">
                  <div className="relative aspect-[9/16] max-h-[78vh] lg:max-h-[70vh] grid place-items-center rounded-3xl border border-emerald-100 bg-slate-900/70 p-3 shadow-lg shadow-emerald-500/10">
                    {!prefersReducedMotion ? (
                      <video
                        ref={videoRef}
                        className="h-full w-full object-contain rounded-2xl"
                        src="/videos/northside-pass.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        controls
                        poster="/images/northside-pass-poster.svg"
                      />
                    ) : (
                      <img
                        src="/images/northside-pass-poster.svg"
                        alt="NorthSide Pass preview"
                        className="w-full max-h-[85vh] object-contain rounded-2xl"
                      />
                    )}
                    {!prefersReducedMotion && showSoundCta && !autoplayFailed && (
                      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
                        <div className="pointer-events-auto inline-flex rounded-full bg-white/95 px-4 py-2 shadow-lg shadow-emerald-500/20">
                          <button
                            type="button"
                            onClick={handleEnableSound}
                            className="text-sm font-semibold text-emerald-800"
                          >
                            Play with sound
                          </button>
                        </div>
                      </div>
                    )}
                    {!prefersReducedMotion && autoplayFailed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleEnableSound}
                          className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition"
                        >
                          Play with sound
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <MembershipRegistrationBlock
                  id="claim"
                  className="bg-transparent text-slate-900"
                  innerClassName="w-full"
                  contentWrapperClassName="p-0"
                  previewWrapperClassName="xl:min-w-[440px] xl:max-w-[520px] xl:shrink-0"
                />
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {KEY_BENEFITS.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-emerald-100 bg-white/70 backdrop-blur p-4 shadow-inner shadow-emerald-100/40"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-emerald-700 font-semibold">Benefit</p>
                    <h3 className="text-base font-semibold text-emerald-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-emerald-800/90">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OptionTwoPage;
