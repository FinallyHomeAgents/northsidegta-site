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

export default function QuickContactCard({
  formspreeId = "xanbzajw",
  variant = "default",
  className = "",
}) {
  // collapsed/expanded
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

  const canSubmit = emailValid && towns.length > 0 && notUnderContract && !submitting;

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

      // Pass basic UTM through if present
      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
        const v = params.get(k);
        if (v) payload.append(k, v);
      });

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

  const overlay = variant === "overlay";

  const baseContainer = overlay
    ? "rounded-[28px] transition-all duration-300"
    : "rounded-2xl transition-all duration-300";

  const containerClasses = [
    baseContainer,
    overlay
      ? open
        ? "flex h-full flex-col overflow-hidden overflow-y-auto border border-white/14 bg-emerald-950/75 p-5 md:p-6 shadow-[0_32px_90px_rgba(2,15,10,0.5)] backdrop-blur-xl"
        : "flex h-full flex-col justify-between border border-white/14 bg-emerald-950/65 p-5 md:p-6 shadow-[0_32px_90px_rgba(2,15,10,0.45)] backdrop-blur-xl"
      : open
      ? "border border-emerald-200 bg-white/95 p-4 md:p-5 shadow-sm"
      : "border border-white/25 bg-white/5 p-4 md:p-5 shadow-sm backdrop-blur-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const overlayInputBase =
    "mt-1 w-full rounded-lg border bg-emerald-950/50 text-emerald-50 placeholder-white/60";
  const overlayInputValid = "border-white/18 focus:border-emerald-300 focus:ring-emerald-300";
  const overlayInputInvalid = "border-rose-400 focus:border-rose-400 focus:ring-rose-300";
  const defaultInputBase = "mt-1 w-full rounded-lg border";
  const defaultInputValid = "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500";
  const defaultInputInvalid = "border-rose-500 focus:border-rose-500 focus:ring-rose-500";

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white/95 shadow-sm p-5 md:p-6">
        <h3 className="text-xl font-semibold">Thanks — you’re one step closer.</h3>
        <p className="mt-1 text-gray-700">
          We’ll send hand-picked insights for{" "}
          <span className="font-medium">
            {towns.length ? towns.join(", ") : "the NorthSide GTA"}
          </span>{" "}
          to <span className="font-medium">{email}</span>. For the fastest reply, message us on
          WhatsApp.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border-2 border-emerald-300 text-emerald-700 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition font-semibold"
        >
          <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Collapsed = premium “Match” block */}
      {!open && (
        <div
          className={`text-center text-white ${
            overlay ? "flex h-full flex-col gap-4" : "space-y-3"
          }`}
        >
          <div className={overlay ? "space-y-1" : "space-y-1.5"}>
            <span
              className={`inline-flex items-center justify-center rounded-full border ${
                overlay
                  ? "border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80"
                  : "hidden"
              }`}
            >
              Match Concierge
            </span>
            <h3
              className={`${
                overlay
                  ? "text-[20px] md:text-[24px] font-black tracking-tight text-white"
                  : "text-[22px] md:text-[26px] font-extrabold tracking-tight text-white"
              }`}
            >
              Your NorthSide GTA Match
            </h3>
            <p
              className={`${
                overlay
                  ? "text-[12px] leading-relaxed text-white/90 md:text-[13px]"
                  : "text-[13px] text-emerald-100/80 md:text-sm"
              }`}
            >
              Compare the towns we move clients through every week — with pricing, commute, and
              school context curated for your inbox.
            </p>
          </div>

          <div
            className={`flex flex-col items-center justify-center ${
              overlay ? "gap-2 md:flex-row" : "gap-2.5 sm:flex-row"
            }`}
          >
            {/* START HERE (primary) */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="
                px-5 py-2.5 rounded-xl font-bold tracking-wide
                bg-emerald-700 text-white hover:bg-emerald-800
                shadow-[0_4px_12px_rgba(16,185,129,0.35)]
                transition
              "
            >
              START HERE
            </button>

            {/* WhatsApp (fast) — brand look + logo */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                border border-white/40 bg-white/10 text-white
                hover:border-white/70 hover:bg-white/20
                font-semibold transition
                ${overlay ? "w-full justify-center md:w-auto" : ""}
              `}
              title="WhatsApp (fast)"
            >
              <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
              WhatsApp <span className="opacity-70">(fast)</span>
            </a>

            {/* small time badge */}
            <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
              2 min
            </span>
          </div>

          {/* Value bullets */}
          <div className={overlay ? "flex-1" : ""}>
            <ul
              className={`${
                overlay
                  ? "space-y-1 text-[12px] leading-relaxed text-white/85"
                  : "space-y-1 text-[13px] leading-relaxed text-emerald-100/85"
              }`}
            >
              {[
                "Top-3 towns matched to your lifestyle & budget",
                "Scorecard: prices, commute, schools, vibe",
                "VIP alerts for good-fit listings & off-market talk",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-left">
                  <span
                    className={`mt-1 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-semibold leading-4 ${
                      overlay
                        ? "bg-white/15 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & footnote */}
          <div className={`space-y-1 text-[11px] ${overlay ? "" : "text-emerald-100/70"}`}>
            <div
              className={`uppercase tracking-[0.28em] ${
                overlay ? "text-white/70" : "text-emerald-100/70"
              }`}
            >
              Finally Home Agents • NorthSide GTA
            </div>
            <div className={overlay ? "text-white/60" : "text-emerald-100/60"}>
              No spam. Unsubscribe anytime.
            </div>
          </div>
        </div>
      )}

      {/* Expanded = full form */}
      {open && (
        <form
          onSubmit={handleSubmit}
          className={`space-y-5 ${overlay ? "text-emerald-50/90" : ""}`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3
                className={`text-xl md:text-2xl font-semibold ${
                  overlay ? "text-white" : "text-emerald-900"
                }`}
              >
                Your NorthSide GTA Match
              </h3>
              <p
                className={overlay ? "text-emerald-50/80" : "text-gray-700"}
              >
                Tell us where you’re looking — we’ll build your shortlist. Or tap WhatsApp for a faster response.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                overlay
                  ? "border-2 border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
                  : "border-2 border-emerald-300 text-emerald-700 bg-white hover:border-emerald-400 hover:bg-emerald-50"
              }`}
              title="WhatsApp (fast)"
            >
              <FaWhatsapp className="h-5 w-5" style={{ color: "#25D366" }} />
              WhatsApp (fast)
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              {/* Email with live validation message */}
              <label className="block">
                <span
                  className={`text-sm font-medium ${
                    overlay ? "text-emerald-50" : ""
                  }`}
                >
                  Email
                  <span className={overlay ? "text-rose-300" : "text-rose-600"}> *</span>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={[
                    overlay ? overlayInputBase : defaultInputBase,
                    overlay
                      ? email && !emailValid
                        ? overlayInputInvalid
                        : overlayInputValid
                      : email && !emailValid
                      ? defaultInputInvalid
                      : defaultInputValid,
                  ].join(" ")}
                  placeholder="you@example.com"
                />
                {email && !emailValid && (
                  <p className={`mt-1 text-sm ${overlay ? "text-rose-300" : "text-rose-600"}`}>
                    Please enter a valid email address (e.g. name@example.com).
                  </p>
                )}
              </label>

              <label className="block">
                <span
                  className={`text-sm font-medium ${
                    overlay ? "text-emerald-50" : ""
                  }`}
                >
                  Name (optional)
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={[
                    overlay ? overlayInputBase : defaultInputBase,
                    overlay ? overlayInputValid : defaultInputValid,
                  ].join(" ")}
                  placeholder="Jane Doe"
                />
              </label>

              <label className="block">
                <span
                  className={`text-sm font-medium ${
                    overlay ? "text-emerald-50" : ""
                  }`}
                >
                  Phone (optional)
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={[
                    overlay ? overlayInputBase : defaultInputBase,
                    overlay ? overlayInputValid : defaultInputValid,
                  ].join(" ")}
                  placeholder="(555) 555-5555"
                />
              </label>

              <div className="block">
                <span
                  className={`text-sm font-medium ${
                    overlay ? "text-emerald-50" : ""
                  }`}
                >
                  Contact preference
                </span>
                <div
                  className={`mt-1 inline-flex rounded-lg border p-1 ${
                    overlay ? "border-white/18 bg-emerald-950/40" : "border-emerald-300 bg-white"
                  }`}
                >
                  {["Email", "WhatsApp", "Either"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={[
                        "px-3 py-1.5 rounded-md text-sm font-medium transition",
                        overlay
                          ? pref === opt
                            ? "bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                            : "text-emerald-100 hover:bg-white/10"
                          : pref === opt
                          ? "bg-emerald-600 text-white"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                      onClick={() => setPref(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <span
                className={`text-sm font-medium ${
                  overlay ? "text-emerald-50" : ""
                }`}
              >
                Areas of interest
                <span className={overlay ? "text-rose-300" : "text-rose-600"}> *</span>
              </span>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleAll}
                  className={[
                    "px-3 py-1.5 rounded-full border text-sm transition",
                    overlay
                      ? allChecked
                        ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                        : "border-white/18 text-emerald-100 hover:bg-white/10"
                      : allChecked
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-emerald-300 hover:bg-gray-50",
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
                        overlay
                          ? on
                            ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                            : "border-white/18 text-emerald-100 hover:bg-white/10"
                          : on
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-emerald-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={notUnderContract}
                    onChange={(e) => setNotUnderContract(e.target.checked)}
                    className={`mt-1 rounded focus:ring-emerald-500 ${
                      overlay
                        ? "border-white/20 bg-emerald-950/40 text-emerald-400"
                        : "border-emerald-400 text-emerald-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      overlay ? "text-emerald-50/85" : "text-gray-800"
                    }`}
                  >
                    I confirm I’m <strong>not currently under contract</strong> with another real
                    estate brokerage.
                  </span>
                </label>
                <p className={`text-xs ${overlay ? "text-emerald-100/70" : "text-gray-600"}`}>
                  By submitting, you agree to receive information from Finally Home Agents. You can
                  unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>

          {err && (
            <p className={`text-sm ${overlay ? "text-rose-300" : "text-rose-600"}`}>{err}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "px-4 py-2 rounded-lg font-semibold transition",
                overlay
                  ? canSubmit
                    ? "bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.5)] hover:bg-emerald-400"
                    : "bg-white/10 text-emerald-100/60 cursor-not-allowed"
                  : canSubmit
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-emerald-200 text-emerald-900/60 cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? "Sending…" : "Send me updates"}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg border transition ${
                overlay
                  ? "border-white/25 bg-white/10 text-emerald-50 hover:bg-white/20"
                  : "border-emerald-300 text-gray-800 bg-white hover:bg-emerald-50"
              }`}
            >
              Collapse
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
