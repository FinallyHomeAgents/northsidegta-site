// src/QuickContactCard.js
import React, { useMemo, useState } from "react";

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
  // Use the full Formspree endpoint (best: keep as URL, not an id)
  formspreeEndpoint = "https://formspree.io/f/xanbzajw",
}) {
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
      // Formspree works great with FormData
      const payload = new FormData();
      payload.append("email", email);
      if (name) payload.append("name", name);
      if (phone) payload.append("phone", phone);
      payload.append("areas", towns.join(", "));
      payload.append("contactPreference", pref);
      payload.append("notUnderContract", notUnderContract ? "Yes" : "No");
      payload.append("form_name", "NorthSide GTA Quick Contact");

      // Pass through UTM params if present
      const params = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(
        (k) => {
          const v = params.get(k);
          if (v) payload.append(k, v);
        }
      );

      // ✅ Use the endpoint directly (no string building)
      const res = await fetch(formspreeEndpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Form submit failed");
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
      <div className="rounded-2xl border shadow-sm bg-white/90 backdrop-blur p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-semibold">Thanks — you’re one step closer.</h3>
            <p className="mt-1 text-gray-600">
              We’ll send hand-picked insights for{" "}
              <span className="font-medium">
                {towns.length ? towns.join(", ") : "the NorthSide GTA"}
              </span>{" "}
              to <span className="font-medium">{email}</span>. For a faster reply,
              you can also message us on WhatsApp — we’re quick there.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
            >
              <span className="inline-block w-5 h-5 rounded-full bg-[#25D366]" />
              Continue on WhatsApp (fast)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-2xl border shadow-sm bg-white/90 backdrop-blur",
        "transition-all duration-300",
        open ? "p-5 md:p-6" : "p-4 md:p-5",
      ].join(" ")}
    >
      {!open && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Want more info about the NorthSide GTA?
            </h3>
            <p className="text-gray-600 text-sm">
              Get curated listings & local insights — or tap WhatsApp for a faster response.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Email me updates
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
              title="Faster (premium) reply"
            >
              WhatsApp (fast)
            </a>
          </div>
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">
                Want more info about the NorthSide GTA?
              </h3>
              <p className="text-gray-600">
                Tell us where you’re looking or tap WhatsApp for a faster response.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
              title="Faster (premium) reply"
            >
              <span className="inline-block w-5 h-5 rounded-full bg-[#25D366]" />
              WhatsApp (fast)
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Left column */}
            <div className="md:col-span-1 space-y-3">
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

              <div className="block">
                <span className="text-sm font-medium">Contact preference</span>
                <div className="mt-1 inline-flex rounded-lg border p-1 bg-white">
                  {["Email", "WhatsApp", "Either"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={[
                        "px-3 py-1.5 rounded-md text-sm font-medium transition",
                        pref === opt
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

            {/* Right column */}
            <div className="md:col-span-2">
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

              <div className="mt-4 space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={notUnderContract}
                    onChange={(e) => setNotUnderContract(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm I’m <strong>not currently under contract</strong> with another real estate brokerage.
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  By submitting, you agree to receive information from Finally Home Agents. You can unsubscribe anytime.
                </p>
              </div>
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
