import React, { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import MembershipCard from "./components/brand/MembershipCard";
import { exportCardAsPng } from "./lib/membership/export-card";

const PRIMARY_TOWNS = [
  "Uxbridge",
  "Aurora",
  "Newmarket",
  "Stouffville",
  "East Gwillimbury",
  "Georgina",
  "Scugog",
  "Considering a move to the NorthSide GTA",
];

const MEMBER_TYPES = ["Buyer", "Seller", "Local Resident", "Just Exploring"];
const INTERESTS = ["Community events", "TasteHub food rankings", "Market insights"];
const DEFAULT_CARD_NUMBER = "00000000";
const FUTURE_RESIDENT_LABEL = "Future NorthSide GTA Resident";

const KEY_BENEFITS = [
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
    title: "Member-only experiences (coming soon)",
    description: "Future NorthSide GTA community events designed exclusively for members.",
  },
  {
    title: "Local business perks (coming soon)",
    description:
      "Exclusive offers from local businesses who support and celebrate the NorthSide GTA community.",
  },
];

const buildCardLabel = (primaryTown) => {
  if (!primaryTown) return "NorthSide GTA Member";
  if (primaryTown === "Considering a move to the NorthSide GTA") {
    return FUTURE_RESIDENT_LABEL;
  }
  return `${primaryTown} Member`;
};

const buildTownDisplay = (primaryTown) => {
  if (!primaryTown || primaryTown === "Considering a move to the NorthSide GTA") {
    return "NorthSide GTA";
  }
  return primaryTown;
};

const CombinedHeroSection = ({ onCTAClick, cardRef, cardLabel, cardTown, cardNumber, form, activated }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
    <div
      className="absolute inset-0 opacity-60"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(74,222,128,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(34,197,94,0.08), transparent 25%)",
      }}
    />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
            NorthSide GTA Membership
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Become a NorthSide GTA Member
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50/90 max-w-2xl mx-auto lg:mx-0">
              A community for people who live here, love it here, or see themselves here next.
            </p>
            <p className="text-sm sm:text-base text-slate-200/80 max-w-2xl mx-auto lg:mx-0">
              Free to join. Built on pride, connection, and insider access to everything that makes the NorthSide GTA special.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center lg:justify-start pt-1">
            <button
              type="button"
              onClick={onCTAClick}
              className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Join NorthSide GTA — Free
            </button>
            <span className="text-xs sm:text-sm text-slate-200/80">Identity-first membership for the NorthSide community.</span>
          </div>
          <p className="text-xs text-slate-300/80">No spam. No pressure. Just community, pride, and access.</p>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-[0_18px_42px_rgba(0,0,0,0.24)] ring-1 ring-white/10 p-5 sm:p-6 md:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs uppercase tracking-[0.12em] text-emerald-100 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-emerald-50">
                <span>Your official membership card</span>
                <span className="text-[10px] text-emerald-50/80">Instant preview</span>
              </div>
            </div>
            <div className="bg-black/25 rounded-2xl p-6 sm:p-7 shadow-[0_12px_28px_rgba(0,0,0,0.28)] ring-1 ring-white/15 border border-white/10 w-full flex justify-center overflow-visible relative">
              <div ref={cardRef} className="card-export-target">
                <MembershipCard
                  className="scale-[1.02] sm:scale-[1.05] drop-shadow-2xl"
                  fullName={(form.fullName || "Your Name").trim()}
                  town={cardTown}
                  memberId={cardNumber}
                  cardLabel={cardLabel}
                  activated={activated}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KEY_BENEFITS.slice(0, 4).map((benefit) => (
              <div key={benefit.title} className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-sm shadow-black/10">
                <h3 className="text-base font-semibold text-white">{benefit.title}</h3>
                <p className="mt-1.5 text-sm text-slate-100/80 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const RegistrationSection = ({
  form,
  setForm,
  handleSubmit,
  handleCheckboxChange,
  status,
  cardLabel,
  cardNumber,
  cardTown,
  activated,
}) => (
  <section className="bg-gray-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" id="membership-register">
        <div className="mt-12 sm:mt-14 grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg shadow-emerald-500/5 border border-emerald-50 p-6 sm:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Membership registration</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Claim your NorthSide GTA membership</h2>
            <p className="text-base text-slate-600 max-w-2xl">
              Fill in your details to generate your membership identity. Your card number is assigned instantly, and your preview updates live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value.slice(0, 30) }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Example: Matthew Mulhall"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="primaryTown">
                  Primary Town of Interest
                </label>
                <select
                  id="primaryTown"
                  required
                  value={form.primaryTown}
                  onChange={(e) => setForm((prev) => ({ ...prev, primaryTown: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select a town</option>
                  {PRIMARY_TOWNS.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-sm font-semibold text-slate-800 mb-2">Member Type</span>
                <div className="grid grid-cols-2 gap-2">
                  {MEMBER_TYPES.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 cursor-pointer hover:border-emerald-600 bg-white"
                    >
                      <input
                        type="radio"
                        name="memberType"
                        value={type}
                        checked={form.memberType === type}
                        onChange={(e) => setForm((prev) => ({ ...prev, memberType: e.target.value }))}
                        className="text-emerald-700 focus:ring-emerald-600"
                        required
                      />
                      <span className="text-sm text-slate-800">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-800 mb-2">Interests (optional)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INTERESTS.map((interest) => (
                  <label
                    key={interest}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 cursor-pointer hover:border-emerald-600 bg-white"
                  >
                    <input
                      type="checkbox"
                      value={interest}
                      checked={form.interests.includes(interest)}
                      onChange={() => handleCheckboxChange(interest)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-sm text-slate-800">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={form.compliance}
                  onChange={(e) => setForm((prev) => ({ ...prev, compliance: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-emerald-700 focus:ring-emerald-600"
                  required
                />
                <span>
                  I confirm that I am not currently under contract with another real estate brokerage.
                </span>
              </label>
              <p className="text-xs text-slate-500">
                We occasionally share real estate–related updates. This helps ensure we only send that content to people who are
                free to receive it and that we respect existing brokerage relationships.
              </p>
            </div>

            {status.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {status.error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                disabled={status.submitting}
              >
                {status.submitting ? "Creating your card..." : "Create my membership"}
              </button>
              <p className="text-sm text-slate-600">Card number is assigned instantly on submission.</p>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-100/70 border border-emerald-50 p-8 sm:p-10 md:p-11 flex flex-col gap-6 overflow-visible relative">
          <div className="w-full flex justify-center pt-3 pb-3 overflow-visible px-3">
            <MembershipCard
              fullName={(form.fullName || "Your Name").trim()}
              town={cardTown}
              memberId={cardNumber}
              cardLabel={cardLabel}
              activated={activated}
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Live Card Preview</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <span className="font-semibold">Card label:</span> {cardLabel}
              </li>
              <li>
                <span className="font-semibold">Member name:</span> {form.fullName || "Your Name"}
              </li>
              <li>
                <span className="font-semibold">Card number:</span> {cardNumber || DEFAULT_CARD_NUMBER}
              </li>
            </ul>
            <p className="text-xs text-slate-500">
              The card updates automatically as you fill in the form. Card numbers are zero-padded (00000001, 00000002, ...).
            </p>
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
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    primaryTown: "",
    memberType: "",
    compliance: false,
    interests: [],
  });
  const [cardNumber, setCardNumber] = useState(DEFAULT_CARD_NUMBER);
  const [status, setStatus] = useState({ submitting: false, error: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const cardRef = useRef(null);

  const cardLabel = useMemo(() => buildCardLabel(form.primaryTown), [form.primaryTown]);
  const cardTown = useMemo(() => buildTownDisplay(form.primaryTown), [form.primaryTown]);

  const handleCheckboxChange = (interest) => {
    setForm((prev) => {
      const hasInterest = prev.interests.includes(interest);
      const nextInterests = hasInterest
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: nextInterests };
    });
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    const safeId = (cardNumber || DEFAULT_CARD_NUMBER).toString().padStart(8, "0");

    try {
      await exportCardAsPng(cardRef.current, `northside-gta-member-${safeId}.png`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Unable to download membership card", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: false, error: "" });

    if (!form.compliance) {
      setStatus({ submitting: false, error: "Please confirm you are not under contract with another brokerage." });
      return;
    }

    if (!form.fullName || !form.email || !form.primaryTown || !form.memberType) {
      setStatus({ submitting: false, error: "Please complete all required fields." });
      return;
    }

    setStatus({ submitting: true, error: "" });

    try {
      const response = await fetch("/api/membership/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          primaryTown: form.primaryTown,
          memberType: form.memberType,
          interests: form.interests,
          complianceConfirmed: form.compliance,
          cardLabel,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.success) {
        setStatus({
          submitting: false,
          error: result?.error || "We were unable to create your membership right now.",
        });
        return;
      }

      setCardNumber(result.cardNumber || DEFAULT_CARD_NUMBER);
      setIsSubmitted(true);
      setStatus({ submitting: false, error: "" });
    } catch (error) {
      setStatus({
        submitting: false,
        error: "Something went wrong while creating your card. Please try again.",
      });
    }
  };

  const handleViewCard = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
          <CombinedHeroSection
            onCTAClick={handleScrollToRegistration}
            cardRef={cardRef}
            cardLabel={cardLabel}
            cardTown={cardTown}
            cardNumber={cardNumber}
            form={form}
            activated={isSubmitted}
          />

        <section className="bg-gray-50 text-slate-900" id="membership-register">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            {isSubmitted ? (
              <div className="-mt-14 bg-white border border-emerald-50 rounded-3xl shadow-lg shadow-emerald-500/5 p-10 text-center flex flex-col items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Membership Created</p>
                  <h2 className="text-4xl font-bold text-slate-900">Welcome to NorthSide GTA</h2>
                  <p className="text-base text-slate-600">Your official membership card has been created.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleViewCard}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                  >
                    View Card
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-base font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                  >
                    Download Card (PNG)
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                  >
                    Continue to NorthSide GTA
                  </a>
                </div>
              </div>
            ) : (
              <RegistrationSection
                form={form}
                setForm={setForm}
                handleSubmit={handleSubmit}
                handleCheckboxChange={handleCheckboxChange}
                status={status}
                cardLabel={cardLabel}
                cardNumber={cardNumber}
                cardTown={cardTown}
                activated={isSubmitted}
              />
            )}
          </div>
        </section>

        <FullBenefitsSection />
        <TrustClosingSection onCTAClick={handleScrollToRegistration} />
      </main>
    </div>
  );
};

export default MembershipCardPreviewPage;
