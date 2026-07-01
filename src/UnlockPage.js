import React, { useRef, useState } from "react";
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

const codeDigits = Array.from({ length: 5 });
const lockboxHeroPath = "/assets/unlock/lockbox-hero.jpg";

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
  const [codeValues, setCodeValues] = useState(Array(5).fill(""));
  const digitRefs = useRef([]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function setCodeDigits(nextDigits) {
    setCodeValues(nextDigits);
    update("code", nextDigits.join(""));
  }

  function updateCodeDigit(index, value) {
    const numeric = value.replace(/\D/g, "");
    const nextDigits = [...codeValues];

    if (numeric.length > 1) {
      numeric.slice(0, 5 - index).split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      setCodeDigits(nextDigits);
      digitRefs.current[Math.min(index + numeric.length, 4)]?.focus();
      return;
    }

    nextDigits[index] = numeric;
    setCodeDigits(nextDigits);
    if (numeric && index < 4) digitRefs.current[index + 1]?.focus();
  }

  function onCodeKeyDown(index, event) {
    if (event.key === "Backspace" && !codeValues[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }

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

  const won = result === "unlocked";

  return (
    <main className={`unlock-page ${result ? `has-result ${won ? "is-unlocked" : "is-locked"}` : ""}`}>
      <Helmet>
        <title>{result ? (won ? "Unlocked" : "Still locked") : "Unlock the Prize"} | Finally Home Agents + NorthSide GTA</title>
        <meta name="description" content="Enter your Mill Run Member Guest lockbox code for a chance to unlock the prize." />
      </Helmet>
      <section className="unlock-shell">
        <div className="brand-row" aria-label="Event sponsors">
          <img src="/Images/fha-badge.png" alt="Finally Home Agents" />
          <span />
          <img src="/Images/northsidegta-logo.svg" alt="NorthSide GTA" />
        </div>

        <div className="hero-lockup">
          <img className="lockbox-photo" src={lockboxHeroPath} alt="Finally Home Agents lockbox" />
          <p className="eyebrow">Finally Home Agents × NorthSide GTA</p>
          <h1>Unlock the <span>Prize</span></h1>
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

        {result ? (
          <section className={`result-card ${won ? "result-win" : "result-locked"}`} aria-live="polite">
            <div className="result-icon" aria-hidden="true">{won ? "✓" : "↻"}</div>
            <p className="eyebrow">Mill Run Member Guest</p>
            <h2>{won ? "You're In!" : "Not this time"}</h2>
            <p className="result-copy">
              {won
                ? "You won an entry into the 2026 Finally Home Fall Scramble. Find Matthew or Landon at the hole to confirm."
                : "Good luck on the Bonus Contest below."}
            </p>
            {won && <p className="handoff">Show this screen to Matthew or Landon.</p>}
            <button className="ghost-button" type="button" onClick={() => setResult(null)}>Try another code</button>
          </section>
        ) : (
          <form className="unlock-form" onSubmit={onSubmit} noValidate>
            <label>Name<input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required /></label>
            <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" inputMode="tel" required /></label>
            <label>Instagram Handle<input value={form.instagramHandle} onChange={(e) => update("instagramHandle", e.target.value)} placeholder="@yourhandle" autoComplete="off" required /></label>
            <fieldset className="code-label">
              <legend>5-Digit Code</legend>
              <div className="code-boxes">
                {codeDigits.map((_, index) => (
                  <input
                    key={index}
                    ref={(node) => { digitRefs.current[index] = node; }}
                    value={codeValues[index]}
                    onChange={(e) => updateCodeDigit(index, e.target.value)}
                    onKeyDown={(e) => onCodeKeyDown(index, e)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    aria-label={`Code digit ${index + 1}`}
                    required
                  />
                ))}
              </div>
            </fieldset>

            <div className="checks">
              <label><input type="checkbox" checked={form.followedFinallyHomeAgents} onChange={(e) => update("followedFinallyHomeAgents", e.target.checked)} /> I followed @FinallyHomeAgents</label>
              <label><input type="checkbox" checked={form.followedNorthSideGTA} onChange={(e) => update("followedNorthSideGTA", e.target.checked)} /> I followed @NorthSideGTA</label>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="unlock-button" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Unlock"}</button>
          </form>
        )}

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
