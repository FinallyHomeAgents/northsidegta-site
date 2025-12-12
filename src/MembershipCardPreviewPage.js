import React, { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import HeaderShell from "./components/HeaderShell";
import MembershipCard from "./components/brand/MembershipCard";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>NorthSide GTA Membership</title>
        <meta
          name="description"
          content="Join the NorthSide GTA membership and get your digital card instantly."
        />
        <link rel="canonical" href="https://www.northsidegta.ca/northside-pass-preview" />
      </Helmet>

      <HeaderShell />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
            NorthSide GTA Membership Registration
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Claim Your Membership Card</h1>
          <p className="text-slate-600 mt-3 max-w-3xl">
            Fill out the quick form to generate your official NorthSide GTA membership card. Your card number
            is assigned instantly and the preview updates live as you type.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center gap-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Membership Created</p>
              <h2 className="text-3xl font-bold text-slate-900">Welcome to NorthSide GTA</h2>
              <p className="text-base text-slate-600">Your official membership card has been created.</p>
            </div>

            <div ref={cardRef} className="flex justify-center w-full">
              <MembershipCard
                className="scale-[1.04] md:scale-110 drop-shadow-2xl transition-transform duration-300"
                fullName={(form.fullName || "Your Name").trim()}
                town={cardTown}
                memberId={cardNumber}
                cardLabel={cardLabel}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleViewCard}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 shadow-sm transition hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
              >
                View / Save Card
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-slate-900 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
              >
                Continue to NorthSide GTA
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
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
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:border-green-600"
                      >
                        <input
                          type="radio"
                          name="memberType"
                          value={type}
                          checked={form.memberType === type}
                          onChange={(e) => setForm((prev) => ({ ...prev, memberType: e.target.value }))}
                          className="text-green-700 focus:ring-green-600"
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
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:border-green-600"
                    >
                      <input
                        type="checkbox"
                        value={interest}
                        checked={form.interests.includes(interest)}
                        onChange={() => handleCheckboxChange(interest)}
                        className="text-green-700 focus:ring-green-600"
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
                    className="mt-1 h-4 w-4 text-green-700 focus:ring-green-600"
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
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {status.error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-white font-semibold shadow-sm transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                  disabled={status.submitting}
                >
                  {status.submitting ? "Creating your card..." : "Create my membership"}
                </button>
                <p className="text-sm text-slate-600">Card number is assigned instantly on submission.</p>
              </div>
            </form>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full flex justify-center">
                <MembershipCard
                  fullName={(form.fullName || "Your Name").trim()}
                  town={cardTown}
                  memberId={cardNumber}
                  cardLabel={cardLabel}
                />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 w-full">
                <h2 className="text-lg font-semibold text-slate-900">Live Card Preview</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
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
                <p className="mt-3 text-xs text-slate-500">
                  The card updates automatically as you fill in the form. Card numbers are zero-padded (00000001, 00000002, ...).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipCardPreviewPage;
