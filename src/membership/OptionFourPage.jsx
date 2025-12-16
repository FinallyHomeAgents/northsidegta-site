import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import MembershipCard from "../components/brand/MembershipCard";
import { KEY_BENEFITS, DEFAULT_CARD_NUMBER, buildCardLabel, buildTownDisplay } from "./membershipContent";

const OptionFourPage = () => {
  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sampleTown = buildTownDisplay("Stouffville");
  const sampleLabel = buildCardLabel("Stouffville");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>NorthSide Pass — Option 4</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-4" />
      </Helmet>
      <HeaderShell />

      <main>
        <section className="bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <LayoutSwitcher active="/northside-pass-preview/option-4" />
              <button
                type="button"
                onClick={handleScrollToForm}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Jump to registration
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-semibold">Option 4 · Split above the fold</p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Headline and benefits left, registration right.</h1>
                <p className="text-base text-emerald-50/90 max-w-2xl">
                  A tight split keeps value framing alongside the form and preview so members understand the why instantly.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {KEY_BENEFITS.slice(0, 4).map((benefit) => (
                    <div key={benefit.title} className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-sm shadow-black/20">
                      <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{benefit.description}</p>
                    </div>
                  ))}
                </div>
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

        <section className="bg-slate-900 text-white border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-10 items-center">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-inner shadow-black/30">
              <MembershipCard
                className="scale-[1.02] drop-shadow-2xl"
                fullName="NorthSide GTA Member"
                town={sampleTown}
                memberId={DEFAULT_CARD_NUMBER}
                cardLabel={sampleLabel}
              />
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200 font-semibold">Card & identity</p>
              <h2 className="text-3xl font-bold text-white">Your card sits at the heart of the experience.</h2>
              <p className="text-base text-white/80">
                Claiming your membership assigns an identity that can unlock future experiences, perks, and community-only access.
              </p>
              <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                <li>Instantly generated card number</li>
                <li>Live preview updates as you type</li>
                <li>Community-first updates without the noise</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 text-slate-900 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
            <div className="space-y-3 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 font-semibold">Why join</p>
              <h3 className="text-3xl font-bold text-slate-900">NorthSide GTA Membership is about belonging.</h3>
              <p className="text-lg text-slate-700">Everything here builds toward pride, connection, and access.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {KEY_BENEFITS.map((benefit) => (
                <div key={benefit.title} className="rounded-3xl bg-white shadow-lg shadow-emerald-100/40 border border-emerald-50 p-5 space-y-2">
                  <h4 className="text-xl font-semibold text-slate-900">{benefit.title}</h4>
                  <p className="text-slate-700">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={handleScrollToForm}
                className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition"
              >
                Claim your NorthSide GTA membership
              </button>
              <p className="text-sm text-slate-600">Free to join. Pride-forward. Ready for future perks.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OptionFourPage;
