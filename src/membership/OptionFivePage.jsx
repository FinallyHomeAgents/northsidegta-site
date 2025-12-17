import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import LayoutSwitcher from "./LayoutSwitcher";
import MembershipRegistrationBlock from "./MembershipRegistrationBlock";
import MembershipCard from "../components/brand/MembershipCard";
import { DEFAULT_CARD_NUMBER, buildCardLabel, buildTownDisplay } from "./membershipContent";

const heroBullets = [
  "Live preview, instant member ID, zero fluff.",
  "What’s happening, without the noise.",
  "Built by local agents who put community first.",
];

const cinematicBenefits = [
  {
    title: "A sense of belonging",
    description:
      "Be part of a growing community of people who are proud to call the NorthSide GTA home — or are planning to.",
  },
  {
    title: "What’s happening, without the noise",
    description:
      "A roughly monthly update highlighting local events, TasteHub food rankings, community highlights, and new guides.",
  },
  {
    title: "Early access (coming soon)",
    description: "Be first to see new NorthSide GTA maps, guides, and tools as they’re released.",
  },
  {
    title: "Local business perks (coming soon)",
    description: "Exclusive offers from local businesses who support and celebrate the NorthSide GTA community.",
  },
];

const OptionFivePage = () => {
  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sampleTown = buildTownDisplay("Aurora");
  const sampleLabel = buildCardLabel("Aurora");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>NorthSide Pass — Option 5</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview/option-5" />
      </Helmet>

      <HeaderShell />

      <main className="relative">
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 opacity-60" aria-hidden="true">
            <div
              className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl"
              aria-hidden="true"
            />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="flex items-center justify-between gap-3 mb-10">
              <LayoutSwitcher active="/northside-pass-preview/option-5" />
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Option 5 · Cinematic
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                    Become a NorthSide GTA Member
                  </h1>
                  <p className="text-lg text-emerald-50/90 max-w-2xl">
                    A community for people who live here, love it here, or see themselves here next.
                  </p>
                  <p className="text-base text-white/70 max-w-2xl">
                    Free to join. Built on pride, connection, and insider access to everything that makes the NorthSide GTA special.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {heroBullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 shadow-inner shadow-emerald-500/10"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handleScrollToForm}
                      className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-[0_14px_48px_rgba(16,185,129,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_70px_rgba(16,185,129,0.35)]"
                    >
                      Claim Your Free NorthSide Pass
                    </button>
                    <p className="text-sm text-white/60">Identity-first membership for the NorthSide community.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-emerald-500/25 via-emerald-400/10 to-transparent blur-3xl" aria-hidden="true" />
                <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
                  <div className="absolute inset-x-10 -top-3 h-10 bg-emerald-400/30 blur-xl rounded-full" aria-hidden="true" />
                  <div className="relative grid place-items-center">
                    <div className="rounded-3xl bg-black/70 border border-white/5 shadow-[0_30px_120px_rgba(16,185,129,0.4)] transition duration-700 ease-out">
                      <MembershipCard
                        className="scale-[1.06] drop-shadow-[0_20px_80px_rgba(16,185,129,0.25)]"
                        fullName="NorthSide GTA Member"
                        town={sampleTown}
                        memberId={DEFAULT_CARD_NUMBER}
                        cardLabel={sampleLabel}
                      />
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-white/70 text-center">Live card preview updates as you type.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 bg-slate-950/90 py-12 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(74,222,128,0.08),transparent_25%)]" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">Claim flow</p>
              <h2 className="text-3xl font-bold text-white">Scroll down and claim your card instantly.</h2>
              <p className="text-base text-white/70 max-w-3xl">
                The form, validation, and live preview remain unchanged — now wrapped in a cinematic shell with clear focus and hierarchy.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/5 px-6 sm:px-8 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">NorthSide Pass</p>
                  <p className="text-base text-white/80">Live preview, instant member ID, zero fluff.</p>
                </div>
                <button
                  type="button"
                  onClick={handleScrollToForm}
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  Jump to form
                </button>
              </div>

              <MembershipRegistrationBlock
                className="bg-transparent text-white"
                innerClassName="p-0"
                contentWrapperClassName="p-4 sm:p-6 lg:p-8"
                previewWrapperClassName="bg-slate-950/70 border border-white/10 text-white shadow-[0_25px_80px_rgba(16,185,129,0.25)]"
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">Membership benefits</p>
              <h3 className="text-3xl font-bold text-white">Cinematic, clear, and built to convert.</h3>
              <p className="text-base text-white/70 max-w-3xl">The same benefits — framed in high-contrast panels for quick scanning.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {cinematicBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                >
                  <div className="absolute inset-0 opacity-60 bg-gradient-to-br from-emerald-500/10 via-transparent to-slate-900" aria-hidden="true" />
                  <div className="relative space-y-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 grid place-items-center text-sm font-semibold">
                      ★
                    </div>
                    <h4 className="text-xl font-semibold text-white">{benefit.title}</h4>
                    <p className="text-sm text-white/70 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 sm:px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-semibold">Trust & philosophy</p>
                <h3 className="text-3xl font-bold text-white">Not a mailing list. A membership built with intent.</h3>
                <p className="text-base text-white/75 max-w-4xl">
                  Built by local agents who believe community comes before transactions — and relationships come before real estate.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <button
                type="button"
                onClick={handleScrollToForm}
                className="inline-flex items-center justify-center rounded-full bg-brand-green px-7 py-3 text-lg font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5"
              >
                Join NorthSide GTA — Free
              </button>
              <p className="text-sm text-white/65 max-w-2xl">No spam. No pressure. Just community, pride, and access.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OptionFivePage;
