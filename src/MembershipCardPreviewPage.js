import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import MembershipCard from "./components/brand/MembershipCard";
import MembershipRegistrationBlock from "./membership/MembershipRegistrationBlock";
import {
  DEFAULT_CARD_NUMBER,
  KEY_BENEFITS,
  buildCardLabel,
  buildTownDisplay,
} from "./membership/membershipContent";

const HeroSection = ({ onCTAClick }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
    <div
      className="absolute inset-0 opacity-60"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(74,222,128,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(34,197,94,0.08), transparent 25%)",
      }}
    />
    <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-20 min-h-[60vh] flex items-center">
      <div className="w-full max-w-3xl space-y-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
          NorthSide GTA Membership
        </p>
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Become a NorthSide GTA Member
          </h1>
          <p className="text-lg sm:text-xl text-emerald-50/90 max-w-2xl">
            A community for people who live here, love it here, or see themselves here next.
          </p>
          <p className="text-base text-slate-200/80 max-w-2xl">
            Free to join. Built on pride, connection, and insider access to everything that makes the NorthSide GTA special.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-center lg:justify-start">
          <button
            type="button"
            onClick={onCTAClick}
            className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Join NorthSide GTA — Free
          </button>
          <span className="text-sm text-slate-200/80">Identity-first membership for the NorthSide community.</span>
        </div>
      </div>
    </div>
  </section>
);

const CardStatementSection = ({ cardRef, cardLabel, cardTown, cardNumber, form }) => (
  <section className="bg-slate-950 text-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="-mt-10 lg:-mt-14" />
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6 sm:px-10 py-10">
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="bg-black/30 rounded-3xl p-4 sm:p-6 shadow-inner shadow-black/30 w-full max-w-lg flex justify-center"
            >
              <MembershipCard
                className="scale-[1.02] sm:scale-[1.08] drop-shadow-2xl"
                fullName={(form.fullName || "Your Name").trim()}
                town={cardTown}
                memberId={cardNumber}
                cardLabel={cardLabel}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-semibold">Membership Identity</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Your official NorthSide GTA Membership Card.</h2>
              <p className="text-base text-slate-100/80 max-w-xl">
                The symbol of belonging for the NorthSide GTA — centered, elevated, and ready the moment you join.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {KEY_BENEFITS.map((benefit) => (
                <div key={benefit.title} className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-sm shadow-black/10">
                  <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-slate-100/80">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);


const FullBenefitsSection = () => (
  <section className="bg-gray-50 text-slate-900">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 font-semibold">Why Join NorthSide GTA</p>
        <h3 className="text-3xl font-bold text-slate-900">NorthSide GTA Membership isn’t a mailing list.</h3>
        <p className="text-lg text-slate-700">It’s a way to belong to the community — not just live in it.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-5">
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">A sense of belonging</h4>
            <p className="text-slate-700">
              Be part of a growing community of people who are proud to call the NorthSide GTA home — or are planning to.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">Your official NorthSide GTA Membership Card</h4>
            <p className="text-slate-700">
              A digital card that represents your connection to the area, with future perks and access tied directly to it.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">What’s happening, without the noise</h4>
            <p className="text-slate-700">
              A roughly monthly update highlighting local events, TasteHub food rankings, community highlights, and new NorthSide GTA guides.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">Member-only experiences (coming soon)</h4>
            <p className="text-slate-700">Access to future NorthSide GTA community events designed exclusively for members.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">Local business perks (coming soon)</h4>
            <p className="text-slate-700">
              Exclusive offers from local businesses who support and celebrate the NorthSide GTA community.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">Early access to what we’re building</h4>
            <p className="text-slate-700">Be first to see new NorthSide GTA maps, guides, and tools as they’re released.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-slate-900">A direct line to local expertise</h4>
            <p className="text-slate-700">
              Reach out with real estate questions anytime — without pressure, obligation, or sales tactics.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TrustClosingSection = ({ onCTAClick }) => (
  <section className="bg-gray-50 text-slate-900 pb-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-slate-900 rounded-3xl px-6 sm:px-10 py-10 text-slate-100 shadow-emerald-500/5 shadow-lg">
        <p className="text-base sm:text-lg leading-relaxed text-slate-200">
          Built by local agents who believe community comes before transactions — and relationships come before real estate.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={onCTAClick}
          className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
        >
          Join NorthSide GTA — Free
        </button>
        <p className="text-sm text-slate-600">No spam. No pressure. Just community, pride, and access.</p>
      </div>
    </div>
  </section>
);

const MembershipCardPreviewPage = () => {
  const [registrationState, setRegistrationState] = useState({
    form: {
      fullName: "",
      email: "",
      primaryTown: "",
      memberType: "",
      compliance: false,
      interests: [],
    },
    cardNumber: DEFAULT_CARD_NUMBER,
    cardLabel: buildCardLabel(""),
    cardTown: buildTownDisplay(""),
    isSubmitted: false,
  });
  const cardRef = useRef(null);

  const { form, cardNumber, cardLabel, cardTown } = registrationState;

  const handleScrollToRegistration = () => {
    document.getElementById("membership-register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>NorthSide GTA Membership</title>
        <meta
          name="description"
          content="Join the NorthSide GTA membership and get your digital card instantly."
        />
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview" />
      </Helmet>

      <HeaderShell />

      <main className="relative">
        <HeroSection onCTAClick={handleScrollToRegistration} />
        <CardStatementSection
          cardRef={cardRef}
          cardLabel={cardLabel}
          cardTown={cardTown}
          cardNumber={cardNumber}
          form={form}
        />

        <MembershipRegistrationBlock
          className="bg-gray-50 text-slate-900"
          onRegistrationStateChange={setRegistrationState}
        />

        <FullBenefitsSection />
        <TrustClosingSection onCTAClick={handleScrollToRegistration} />
      </main>
    </div>
  );
};

export default MembershipCardPreviewPage;
