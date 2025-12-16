import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import { KEY_BENEFITS } from "./membershipContent";

const OptionThreePage = () => {
  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Helmet>
        <title>NorthSide Pass — Option 3</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-3" />
      </Helmet>
      <HeaderShell />

      <main className="relative pb-20">
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-3">
            <LayoutSwitcher active="/northside-pass-preview/option-3" tone="light" />
            <button
              type="button"
              onClick={handleScrollToForm}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-slate-300"
            >
              Scroll to registration
            </button>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Option 3 · Sticky registration</p>
                <h1 className="text-4xl font-bold text-slate-900 leading-tight">Registration stays in view as you explore benefits.</h1>
                <p className="text-base text-slate-600 max-w-2xl">
                  Desktop keeps the form anchored on the right while the story and benefits flow on the left. On mobile, the form leads and a sticky CTA returns you to it.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {KEY_BENEFITS.map((benefit) => (
                  <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-slate-700">{benefit.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-900">Identity-first membership</h2>
                <p className="text-base text-slate-600 max-w-3xl">
                  Your membership card unlocks experiences as they roll out. Stay connected to what’s happening without the noise.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-10">
              <MembershipRegistrationBlock
                className="bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200"
                innerClassName="p-0"
                contentWrapperClassName="p-4 sm:p-6"
              />
            </div>
          </div>
        </section>

        <div className="lg:hidden fixed bottom-4 inset-x-4">
          <button
            type="button"
            onClick={handleScrollToForm}
            className="w-full rounded-full bg-brand-green px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-400/30"
          >
            Claim your card
          </button>
        </div>
      </main>
    </div>
  );
};

export default OptionThreePage;
