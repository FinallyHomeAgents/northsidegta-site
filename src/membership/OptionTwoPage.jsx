import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import { KEY_BENEFITS } from "./membershipContent";

const OptionTwoPage = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>NorthSide Pass — Option 2</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-2" />
      </Helmet>
      <HeaderShell />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white border-b border-emerald-100/60">
          {!prefersReducedMotion ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/videos/northside-pass.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/northside-pass-poster.svg"
            />
          ) : (
            <div
              className="absolute inset-0 h-full w-full bg-center bg-cover"
              style={{ backgroundImage: "url(/images/northside-pass-poster.svg)" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/75 to-white/85 mix-blend-multiply" aria-hidden="true" />

          <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <LayoutSwitcher active="/northside-pass-preview/option-2" tone="light" />
              <button
                type="button"
                onClick={handleScrollToForm}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur hover:border-emerald-300"
              >
                Registration
              </button>
            </div>

            <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-xl shadow-emerald-100/70 border border-emerald-100 p-4 sm:p-8">
              <div className="text-center space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Option 2 · Framed registration</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Registration centered in a premium card.</h1>
                <p className="text-base text-slate-600 max-w-2xl mx-auto">
                  The form and live preview sit together inside a luxe container. Benefits wrap the experience on desktop, while mobile stacks the registration first.
                </p>
              </div>

              <div className="mt-8">
                <MembershipRegistrationBlock
                  className="bg-transparent text-slate-900"
                  innerClassName="w-full"
                  contentWrapperClassName="p-0"
                />
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
