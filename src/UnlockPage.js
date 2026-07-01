import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./UnlockPage.css";

const initialForm = {
  name: "",
  phone: "",
  instagramHandle: "",
  code: "",
  followedFinallyHomeAgents: false,
  followedNorthSideGTA: false,
};

function validate(form) {
  if (!form.name.trim()) return "Name is required.";
  if (!form.phone.trim()) return "Phone is required.";
  if (!form.instagramHandle.trim()) return "Instagram handle is required.";
  if (!form.code.trim()) return "5-digit code is required.";
  if (!/^\d{5}$/.test(form.code)) return "Code must be exactly 5 numeric digits.";
  if (!form.followedFinallyHomeAgents && !form.followedNorthSideGTA) {
    return "Check at least one follow box to play.";
  }
  return "";
}

export default function UnlockPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const message = validate(form);
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, pageUrl: window.location.href }),
      });
      const data = await response.json();
      if (response.status === 429) {
        setError(data.error || "Too many attempts. Please try again later.");
        return;
      }
      setResult(data.unlocked ? "unlocked" : "locked");
    } catch {
      setError("We couldn't reach the lockbox. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const won = result === "unlocked";
    return (
      <main className={`unlock-page result-page ${won ? "is-unlocked" : "is-locked"}`}>
        <Helmet><title>{won ? "Unlocked" : "Still locked"} | Mill Run Member Guest</title></Helmet>
        <section className="result-card" aria-live="polite">
          <p className="eyebrow">Mill Run Member Guest</p>
          <h1>{won ? "Unlocked." : "Still locked."}</h1>
          <p className="result-copy">
            {won
              ? "You won an entry into the 2026 Finally Home Fall Scramble."
              : "Thanks for playing. Winners announced at dinner."}
          </p>
          {won && <p className="handoff">We’ll be in contact with you.</p>}
          <button className="ghost-button" type="button" onClick={() => setResult(null)}>Try another code</button>
        </section>
      </main>
    );
  }

  return (
    <main className="unlock-page">
      <Helmet>
        <title>Unlock the Prize | Finally Home Agents + NorthSide GTA</title>
        <meta name="description" content="Enter your Mill Run Member Guest lockbox code for a chance to unlock the prize." />
      </Helmet>
      <section className="unlock-shell">
        <div className="brand-row" aria-label="Event sponsors">
          <img src="/Images/fha-badge.png" alt="Finally Home Agents" />
          <span />
          <img src="/Images/northsidegta-logo.svg" alt="NorthSide GTA" />
        </div>

        <div className="hero-lockup">
          <div className="lockbox-visual" aria-hidden="true">
            <div className="lockbox-shackle" />
            <div className="lockbox-body">
              <img src="/Images/fha-badge.png" alt="" />
              <strong>LOCKBOX</strong>
              <small>Mill Run</small>
            </div>
          </div>
          <p className="eyebrow">Finally Home Agents × NorthSide GTA</p>
          <h1>Unlock the Prize</h1>
          <p className="subheadline">Follow us. Enter your code. Crack the lockbox.</p>
        </div>

        <div className="prize-card">
          <span>Prize</span>
          <strong>Entry into the 2026 Finally Home Fall Scramble</strong>
        </div>

        <ol className="steps-card">
          <li>Follow @FinallyHomeAgents on Instagram</li>
          <li>Follow @NorthSideGTA for a bonus chance</li>
          <li>Enter your 5-digit lockbox code</li>
          <li>If it unlocks, show Matthew or Landon at the hole</li>
        </ol>

        <form className="unlock-form" onSubmit={onSubmit} noValidate>
          <label>Name<input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required /></label>
          <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" required /></label>
          <label>Instagram Handle<input value={form.instagramHandle} onChange={(e) => update("instagramHandle", e.target.value)} placeholder="@yourhandle" autoComplete="off" required /></label>
          <label className="code-label">5-Digit Code<input value={form.code} onChange={(e) => update("code", e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" pattern="[0-9]*" maxLength="5" placeholder="•••••" required /></label>

          <div className="checks">
            <label><input type="checkbox" checked={form.followedFinallyHomeAgents} onChange={(e) => update("followedFinallyHomeAgents", e.target.checked)} /> I followed @FinallyHomeAgents</label>
            <label><input type="checkbox" checked={form.followedNorthSideGTA} onChange={(e) => update("followedNorthSideGTA", e.target.checked)} /> I followed @NorthSideGTA</label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="unlock-button" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Unlock"}</button>
        </form>

        <section className="birdie-card">
          <p className="eyebrow">Bonus contest</p>
          <h2>Longest Birdie of the Day</h2>
          <p>The longest made birdie on this hole wins an entry into the 2026 Finally Home Fall Scramble.</p>
          <p>Matthew and Landon will be on the green to witness and measure every birdie.</p>
        </section>

        <footer>Finally Home Agents | NorthSide GTA<br />Mill Run Member Guest Tournament</footer>
      </section>
    </main>
  );
}
