import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import { KEY_BENEFITS } from "./membershipContent";

const OptionOnePage = () => {
  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>NorthSide Pass — Option 1</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-1" />
      </Helmet>
      <HeaderShell />

      <main>
        <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
            <div className="flex items-center justify-between gap-4">
              <LayoutSwitcher active="/northside-pass-preview/option-1" />
              <button
                type="button"
                onClick={handleScrollToForm}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Jump to form
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div className="space-y-5 lg:pt-6">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Option 1 · Registration-first hero
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Above-the-fold registration with live card preview.
                </h1>
                <p className="text-lg text-emerald-50/90 max-w-2xl">
                  Form on the left, live preview on the right for an immediate sense of belonging.
                </p>
                <ul className="space-y-3 text-sm text-emerald-50/80">
                  {KEY_BENEFITS.slice(0, 3).map((benefit) => (
                    <li key={benefit.title} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-green" />
                      <div>
                        <p className="font-semibold text-white">{benefit.title}</p>
                        <p className="text-emerald-50/70">{benefit.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-500/20">
                <MembershipRegistrationBlock
                  className="bg-transparent text-slate-900"
                  innerClassName="p-4 sm:p-6"
                  contentWrapperClassName=""
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KEY_BENEFITS.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-sm shadow-black/30">
                <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OptionOnePage;
