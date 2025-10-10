
// src/QuickContactCard.js
import React, { useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const TOWNS = [
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Stouffville",
  "Uxbridge",
  "Scugog",
];

const WHATSAPP_NUMBER_E164 = "16476684646"; // no '+' for wa.me
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER_E164}`;

export default function QuickContactCard({ formspreeId = "xanbzajw" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pref, setPref] = useState("Either");
  const [notUnderContract, setNotUnderContract] = useState(false);
  const [towns, setTowns] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  const emailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const canSubmit = emailValid && towns.length > 0 && notUnderContract && !submitting;

  const toggleTown = (town) => {
    setTowns((prev) => {
      const exists = prev.includes(town);
      const next = exists ? prev.filter((item) => item !== town) : [...prev, town];
      setAllChecked(next.length === TOWNS.length);
      return next;
    });
  };

  const toggleAll = () => {
    if (allChecked) {
      setAllChecked(false);
      setTowns([]);
    } else {
      setAllChecked(true);
      setTowns([...TOWNS]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!canSubmit) {
      setErr("Please complete the required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("email", email);
      if (name) payload.append("name", name);
      if (phone) payload.append("phone", phone);
      payload.append("areas", towns.join(", "));
      payload.append("contactPreference", pref);
      payload.append("notUnderContract", notUnderContract ? "Yes" : "No");

      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        const value = params.get(key);
        if (value) payload.append(key, value);
      });

      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Network error");
      setDone(true);
    } catch (error) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappHref = useMemo(() => {
    const msg = `Hi Finally Home Agents! I'm interested in homes around ${
      towns.length ? towns.join(", ") : "the NorthSide GTA"
    }. Can you help?`;
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
  }, [towns]);

  const baseInputClass =
    "mt-1 w-full rounded-2xl border border-emerald-200/70 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60";
  const chipBaseClass =
    "rounded-full border border-emerald-200/70 bg-white/90 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50";
  const chipActiveClass =
    "border-transparent bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-emerald-400";

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/95 p-6 text-slate-900 shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100/60">
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
          aria-hidden
        />
        <div className="pointer-events-none absolute -top-16 right-[-18%] h-44 w-44 rounded-full bg-emerald-200/35 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-[-22%] h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />
        <div className="relative space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">Thanks — you’re one step closer.</h3>
          <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
            We’ll send hand-picked insights for{' '}
            <span className="font-semibold text-slate-900">
              {towns.length ? towns.join(', ') : 'the NorthSide GTA'}
            </span>{' '}
            to <span className="font-semibold text-slate-900">{email}</span>. For the fastest reply, continue the conversation on WhatsApp.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60 sm:w-auto"
          >
            <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
            Continue on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/95",
        "shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100/60 backdrop-blur",
        "transition-all duration-300",
        open ? "p-6 sm:p-7" : "p-5 sm:p-6",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-24 left-[-18%] h-48 w-48 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 right-[-22%] h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden />

      <div className="relative">
        {!open && (
          <div className="space-y-5 text-slate-900">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700">
                Concierge Match
              </span>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                Your NorthSide GTA Match
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Get a personalized shortlist of towns with insider notes, commute times, and price ranges — built by Finally Home Agents.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                START HERE
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-base font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                title="WhatsApp (fast)"
              >
                <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
                WhatsApp <span className="text-emerald-500/80">(fast)</span>
              </a>

              <span className="inline-flex items-center self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 sm:self-auto">
                ≈2 min
              </span>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              {[
                "Top-3 towns matched to your lifestyle & budget",
                "Scorecard: prices, commute, schools, vibe",
                "VIP alerts for good-fit listings & off-market talk",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-[11px] font-semibold text-white shadow-sm">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-500/80">
              <span>★★★★★ Google reviews</span>
              <span>No spam — unsubscribe anytime</span>
            </div>
          </div>
        )}

        {open && (
          <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
            <div className="flex flex-col gap-3 border-b border-emerald-100/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
                  Your Match
                </span>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                  Your NorthSide GTA Match
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Tell us where you’re looking — we’ll build your shortlist. Prefer WhatsApp? Tap the concierge button.
                </p>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                title="WhatsApp (fast)"
              >
                <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
                WhatsApp (fast)
              </a>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-4 md:col-span-1">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Email<span className="text-rose-500"> *</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={[
                      baseInputClass,
                      email && !emailValid
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-300/70"
                        : "",
                    ].join(" ")}
                    placeholder="you@example.com"
                  />
                  {email && !emailValid && (
                    <p className="mt-2 text-xs font-semibold text-rose-500">
                      Please enter a valid email (name@example.com).
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Name (optional)</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={baseInputClass}
                    placeholder="Jane Doe"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Phone (optional)</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={baseInputClass}
                    placeholder="(647) 555-1234"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-slate-700">Contact preference</span>
                  <div className="mt-2 inline-flex rounded-full border border-emerald-200/70 bg-white/70 p-1 shadow-inner shadow-emerald-100">
                    {["Email", "WhatsApp", "Either"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={[
                          "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                          pref === option
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow"
                            : "text-emerald-700 hover:bg-emerald-50",
                        ].join(" ")}
                        onClick={() => setPref(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Areas of interest<span className="text-rose-500"> *</span>
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className={[chipBaseClass, allChecked ? chipActiveClass : ""].join(" ")}
                    >
                      All of them
                    </button>
                    {TOWNS.map((town) => {
                      const selected = towns.includes(town);
                      return (
                        <button
                          key={town}
                          type="button"
                          onClick={() => toggleTown(town)}
                          className={[chipBaseClass, selected ? chipActiveClass : ""].join(" ")}
                        >
                          {town}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-emerald-100/70 bg-emerald-50/50 p-4">
                  <label className="flex items-start gap-3 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={notUnderContract}
                      onChange={(e) => setNotUnderContract(e.target.checked)}
                      className="mt-1 rounded-md border-emerald-300 text-emerald-600 focus:ring-emerald-500/70"
                    />
                    <span>
                      I confirm I’m <strong>not currently under contract</strong> with another real estate brokerage.
                    </span>
                  </label>
                  <p className="text-xs text-emerald-700/80">
                    By submitting, you agree to receive information from Finally Home Agents. You can unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>

            {err && <p className="text-sm font-semibold text-rose-500">{err}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300",
                  canSubmit
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/25 hover:from-emerald-500 hover:to-emerald-400"
                    : "cursor-not-allowed bg-emerald-200 text-emerald-800/60",
                ].join(" ")}
              >
                {submitting ? "Sending…" : "Send me updates"}
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-100 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                Collapse
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
