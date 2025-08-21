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

  // form state
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

  const canSubmit =
    emailValid && towns.length > 0 && notUnderContract && !submitting;

  const toggleTown = (t) => {
    setTowns((prev) => {
      const exists = prev.includes(t);
      const next = exists ? prev.filter((x) => x !== t) : [...prev, t];
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
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(
        (k) => {
          const v = params.get(k);
          if (v) payload.append(k, v);
        }
      );

      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Network error");
      setDone(true);
    } catch (e2) {
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

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-100 shadow-sm bg-white p-5 md:p-6">
        <h3 className="text-xl font-semibold">Thanks — you’re one step closer.</h3>
        <p className="mt-1 text-gray-600">
          We’ll send hand-picked insights for{" "}
          <span className="font-medium">
            {towns.length ? towns.join(", ") : "the NorthSide GTA"}
          </span>{" "}
          to <span className="font-medium">{email}</span>. For the fastest reply,
          message us on WhatsApp.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
        >
          <FaWhatsapp className="h-5 w-5" />
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-2xl border border-emerald-100 shadow-sm bg-white",
        "transition-all duration-300",
        "p-5 md:p-6",
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-[240px] flex-1">
          <h3 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
            Find Where You Truly Belong in the NorthSide GTA
          </h3>
          <p className="text-slate-600 mt-2">
            Finally Home Agents will guide you beyond the listings — helping you
            compare communities and uncover the right fit.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              px-5 py-3 rounded-xl font-bold tracking-wide
              bg-emerald-700 text-white hover:bg-emerald-800
              shadow-[0_4px_12px_rgba(16,185,129,0.35)]
              transition
            "
          >
            START HERE
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              border-2 border-emerald-200 bg-white
              text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50
              font-semibold transition
              whitespace-nowrap
            "
            title="WhatsApp (fast)"
          >
            <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
            WhatsApp <span className="opacity-70">(fast)</span>
          </a>
        </div>
      </div>

      {/* a tiny spacer so the buttons never crowd the form */}
      <div className="h-3 md:h-4" />

      {/* FORM */}
      {open && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* LEFT COLUMN */}
            <div className="md:col-span-1 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">
                  Email<span className="text-rose-600"> *</span>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Name (optional)</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Phone (optional)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="(555) 555-5555"
                />
              </label>

              {/* Contact preference — its own fieldset to guarantee spacing */}
              <fieldset className="block">
                <legend className="text-sm font-medium">Contact preference</legend>
                <div className="mt-1 flex gap-1.5 flex-wrap">
                  {["Email", "WhatsApp", "Either"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={[
                        "px-3 py-1.5 rounded-md text-sm font-medium transition",
                        pref === opt
                          ? "bg-emerald-600 text-white"
                          : "text-gray-700 hover:bg-gray-50 border border-gray-200",
                      ].join(" ")}
                      onClick={() => setPref(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-sm font-medium">
                  Areas of interest<span className="text-rose-600"> *</span>
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={[
                      "px-3 py-1.5 rounded-full border text-sm transition",
                      allChecked
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    All of them
                  </button>

                  {TOWNS.map((t) => {
                    const on = towns.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTown(t)}
                        className={[
                          "px-3 py-1.5 rounded-full border text-sm transition",
                          on
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox — separated and given clear top margin */}
              <div className="pt-1">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={notUnderContract}
                    onChange={(e) => setNotUnderContract(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm I’m <strong>not currently under contract</strong>{" "}
                    with another real estate brokerage.
                  </span>
                </label>
              </div>

              <p className="text-xs text-gray-500">
                By submitting, you agree to receive information from Finally
                Home Agents. You can unsubscribe anytime.
              </p>
            </div>
          </div>

          {err && <p className="text-sm text-rose-600">{err}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "px-4 py-2 rounded-lg font-semibold transition",
                canSubmit
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? "Sending…" : "Send me updates"}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition"
            >
              Collapse
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
