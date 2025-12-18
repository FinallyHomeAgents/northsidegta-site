import React from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "../components/HeaderShell";
import MembershipCard from "../components/brand/MembershipCard";
import MembershipRegistrationBlockV2 from "./MembershipRegistrationBlockV2";
import { DEFAULT_CARD_NUMBER, buildCardLabel, buildTownDisplay } from "./membershipContent";

const benefits = [
  {
    title: "TasteHub",
    description: "Vote on food spots and see real rankings from locals across the NorthSide GTA.",
  },
  {
    title: "Local Events",
    description: "Know what’s happening across the NorthSide GTA every month.",
  },
  {
    title: "Insights",
    description: "Guides and intel to help you pick the right NorthSide town.",
  },
  {
    title: "Direct access to us",
    description: "Updates plus a direct line to Finally Home Agents when you need us.",
  },
];

const membershipTiers = [
  {
    name: "Member (Free)",
    perks: [
      "TasteHub access",
      "Local Events",
      "Insights library",
      "Newsletter + updates",
      "Direct access to us",
    ],
  },
  {
    name: "Founding Member (Free for now)",
    perks: [
      "Everything in Member",
      "First access to new drops (coming soon)",
      "Restaurant perks via TasteHub partners (coming soon)",
    ],
  },
];

const unlocks = [
  {
    title: "Community Intel",
    description: "Use our insights and town guides to feel confident about where you belong next.",
  },
  {
    title: "Local Pulse",
    description: "See upcoming events, new openings, and what’s happening across the NorthSide GTA.",
  },
  {
    title: "Food Rankings",
    description: "TasteHub surfaces the best dishes and spots based on member votes, not ads.",
  },
];

const steps = [
  "Claim your pass",
  "Get your member number + updates",
  "Use tools now; perks roll out as partners join",
];

const faqs = [
  {
    question: "Is it free?",
    answer: "Yes. The NorthSide Pass is currently free for members and founding members alike.",
  },
  {
    question: "What do I get today vs later?",
    answer:
      "Today you get access to TasteHub, community event intel, NorthSide insights, and direct updates from Finally Home Agents. Future perks roll out as we add partners.",
  },
  {
    question: "Do I need to be buying/selling right now?",
    answer: "No. This pass is for locals, future movers, and anyone who wants trusted NorthSide community intel.",
  },
  {
    question: "How often will you email me?",
    answer: "Expect roughly monthly updates featuring events, TasteHub rankings, and new guides. We keep it respectful and relevant.",
  },
  {
    question: "Can I join if I’m working with another agent?",
    answer:
      "If you’re under contract with another brokerage we cannot add you to the membership list right now, but you can still explore our public resources.",
  },
];

const NorthsidePassPreviewV2Page = () => {
  const handleScrollToForm = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToBenefits = () => {
    document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sampleTown = buildTownDisplay("Aurora");
  const sampleLabel = buildCardLabel("Aurora");

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Helmet>
        <title>NorthSide Pass — Preview V2</title>
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview-v2" />
      </Helmet>

      <HeaderShell />

      <main className="relative">
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute right-4 bottom-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">NorthSide Pass</p>
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">Claim your NorthSide Pass</h1>
                  <p className="text-lg text-emerald-50/90 max-w-2xl">
                    Free membership for locals and future NorthSide GTA movers. Get our best community finds and direct access to
                    Finally Home Agents.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleScrollToForm}
                    className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-[0_14px_48px_rgba(16,185,129,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_70px_rgba(16,185,129,0.35)]"
                  >
                    Claim your Pass
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollToBenefits}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base sm:text-lg font-semibold text-white backdrop-blur hover:bg-white/10"
                  >
                    See what’s included
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-emerald-500/25 via-emerald-400/10 to-transparent blur-3xl" aria-hidden="true" />
                <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-[0_30px_120px_rgba(0,0,0,0.6)] space-y-6">
                  <div className="absolute inset-x-10 -top-3 h-10 bg-emerald-400/30 blur-xl rounded-full" aria-hidden="true" />
                  <div className="relative grid place-items-center">
                    <div className="w-full max-w-[520px] aspect-[420/265] grid place-items-center">
                      <div className="rounded-3xl bg-black/70 border border-white/5 shadow-[0_30px_120px_rgba(16,185,129,0.4)] transition duration-700 ease-out w-full h-full grid place-items-center">
                        <MembershipCard
                          className="membership-card--fluid drop-shadow-[0_20px_80px_rgba(16,185,129,0.25)]"
                          fullName="NorthSide GTA Member"
                          town={sampleTown}
                          memberId={DEFAULT_CARD_NUMBER}
                          cardLabel={sampleLabel}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl bg-black/40 border border-white/10 p-3">
                    <div className="relative aspect-[9/16] max-h-[85vh] grid place-items-center overflow-hidden rounded-xl">
                      <video
                        className="h-full w-full object-contain"
                        src="/videos/northside-pass.mp4"
                        autoPlay
                        loop
                        controls
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">Benefits</p>
              <h2 className="text-3xl font-bold text-white">What the pass includes.</h2>
              <p className="text-base text-white/70 max-w-3xl">FanAccess-style rows with the same NorthSide GTA membership content.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 grid place-items-center text-sm font-semibold">
                    ★
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">Membership types</p>
              <h3 className="text-3xl font-bold text-white">Pick how you join.</h3>
              <p className="text-base text-white/70 max-w-3xl">Two membership options, both free — with perks rolling out as we onboard partners.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {membershipTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xl font-semibold text-white">{tier.name}</h4>
                  </div>
                  <div className="mt-4 space-y-2">
                    {tier.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2 text-sm text-white/80">
                        <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="rounded-2xl bg-black/40 border border-white/10 p-3">
                      <div className="grid place-items-center">
                        <MembershipCard
                          className="membership-card--fluid drop-shadow-[0_20px_80px_rgba(16,185,129,0.25)]"
                          fullName="NorthSide GTA Member"
                          town={sampleTown}
                          memberId={DEFAULT_CARD_NUMBER}
                          cardLabel={tier.name}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">What the Pass unlocks</p>
              <h3 className="text-3xl font-bold text-white">Your access as a member.</h3>
              <p className="text-base text-white/70 max-w-3xl">A three-tile grid showing the tools you can use today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {unlocks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                >
                  <h4 className="text-xl font-semibold text-white">{item.title}</h4>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">How it works</p>
              <h3 className="text-3xl font-bold text-white">Three simple steps.</h3>
              <p className="text-base text-white/70 max-w-3xl mx-auto">Claim, get your member number, and start using the tools now.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] space-y-3"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 grid place-items-center text-base font-semibold">
                    {index + 1}
                  </div>
                  <h4 className="text-xl font-semibold text-white">{step}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {index === 0 && "Tap Claim your Pass above or jump to the form below."}
                    {index === 1 && "We’ll assign your membership number instantly and share timely updates."}
                    {index === 2 && "Explore TasteHub, events, and insights now; perks unlock as partners join."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">Join the community</p>
              <h3 className="text-3xl font-bold text-white">Claim your NorthSide Pass</h3>
              <p className="text-base text-white/70 max-w-3xl mx-auto">
                Same form and validation rules as our current preview page — with the working card preview and gated compliance checkbox.
              </p>
            </div>

            <MembershipRegistrationBlockV2
              className="bg-transparent text-white"
              tone="dark"
              innerClassName="max-w-6xl mx-auto"
              contentWrapperClassName="px-4 sm:px-6 lg:px-8 pb-8"
              previewWrapperClassName="bg-slate-950/70 border border-white/10 text-white shadow-[0_25px_80px_rgba(16,185,129,0.25)]"
            />
          </div>
        </section>

        <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-t border-white/10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200 font-semibold">FAQ</p>
              <h3 className="text-3xl font-bold text-white">Questions, answered.</h3>
              <p className="text-base text-white/70">Five quick answers about the NorthSide Pass.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-left text-lg font-semibold text-white">
                    <span>{faq.question}</span>
                    <span className="text-emerald-200 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NorthsidePassPreviewV2Page;
