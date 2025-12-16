import React, { useMemo, useRef, useState } from "react";
import MembershipCard from "../components/brand/MembershipCard";
import {
  DEFAULT_CARD_NUMBER,
  INTERESTS,
  KEY_BENEFITS,
  MEMBER_TYPES,
  PRIMARY_TOWNS,
  buildCardLabel,
  buildTownDisplay,
} from "./membershipContent";

const MembershipRegistrationBlock = ({
  id = "membership-register",
  className = "bg-gray-50 text-slate-900",
  contentWrapperClassName = "",
  innerClassName = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8",
  previewWrapperClassName = "",
  onRegistrationStateChange,
}) => {
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

  React.useEffect(() => {
    if (typeof onRegistrationStateChange === "function") {
      onRegistrationStateChange({ form, cardNumber, cardLabel, cardTown, isSubmitted });
    }
  }, [form, cardNumber, cardLabel, cardTown, isSubmitted, onRegistrationStateChange]);

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
    <section className={`${className}`} id={id}>
      <div className={`${innerClassName} ${contentWrapperClassName}`}>
        {isSubmitted ? (
          <div className="-mt-10 bg-white border border-emerald-50 rounded-3xl shadow-lg shadow-emerald-500/5 p-10 text-center flex flex-col items-center gap-6">
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
                View / Save Card
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
              >
                Continue to NorthSide GTA
              </a>
            </div>

            <div className="w-full max-w-4xl rounded-3xl border border-emerald-100 bg-emerald-50/40 shadow-inner shadow-emerald-100/60 p-6 space-y-4 text-left">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-800">Welcome to NorthSide GTA</p>
                <p className="text-base text-slate-700">Your membership is official.</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-slate-900/80">
                <video
                  className="w-full h-full"
                  src="/videos/northside-pass.mp4"
                  controls
                  playsInline
                  preload="none"
                  poster="/images/northside-pass-poster.svg"
                  muted
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
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
                    We occasionally share real estate–related updates. This helps ensure we only send that content to people who are free to receive it and that we respect existing brokerage relationships.
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

            <div className={`bg-white rounded-3xl shadow-lg shadow-emerald-500/5 border border-emerald-50 p-6 sm:p-8 flex flex-col gap-6 ${previewWrapperClassName}`}>
              <div className="w-full flex justify-center" ref={cardRef}>
                <MembershipCard
                  fullName={(form.fullName || "Your Name").trim()}
                  town={cardTown}
                  memberId={cardNumber}
                  cardLabel={cardLabel}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {KEY_BENEFITS.slice(0, 2).map((benefit) => (
                  <div key={benefit.title} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 shadow-inner shadow-emerald-100/40">
                    <h3 className="text-sm font-semibold text-emerald-900">{benefit.title}</h3>
                    <p className="mt-1 text-xs text-emerald-800/90">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MembershipRegistrationBlock;
