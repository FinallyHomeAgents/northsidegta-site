// src/components/LeadForm.jsx
import React from "react";

const DEFAULT_HELPER =
  "Once you submit, the full list will be sent instantly by email. We’ll also share our contact info so you can quickly book a showing or ask questions about any property.";

export default function LeadForm({
  slug,
  title,
  realmLink,
  ctaText = "Send Me the Listings",
  helperText = DEFAULT_HELPER,
  onSuccessRedirect,
}) {
  const [state, setState] = React.useState({
    name: "",
    email: "",
    phone: "",
    casl: false,
    notRepresented: false,
  });
  const [status, setStatus] = React.useState({ loading: false, ok: false, err: "" });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, ok: false, err: "" });

    // simple validation
    if (!state.name || !state.email) {
      setStatus({ loading: false, ok: false, err: "Please enter your name and email." });
      return;
    }
    if (!state.casl || !state.notRepresented) {
      setStatus({
        loading: false,
        ok: false,
        err: "Please check the consent boxes to continue.",
      });
      return;
    }

    try {
      const res = await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          slug,
          title,
          realmLink,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus({ loading: false, ok: true, err: "" });

      if (onSuccessRedirect) {
        window.location.href = onSuccessRedirect;
      }
    } catch (err) {
      setStatus({ loading: false, ok: false, err: "Sorry, something went wrong. Please try again." });
    }
  }

  return (
    <div style={styles.card}>
      <form onSubmit={onSubmit}>
        <label style={styles.label}>
          Full Name
          <input
            name="name"
            autoComplete="name"
            value={state.name}
            onChange={onChange}
            placeholder="Jane Doe"
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={onChange}
            placeholder="you@email.com"
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={state.phone}
            onChange={onChange}
            placeholder="(555) 555-5555"
            required
            style={styles.input}
          />
        </label>

        <label style={styles.check}>
          <input
            type="checkbox"
            name="notRepresented"
            checked={state.notRepresented}
            onChange={onChange}
            required
          />
          <span style={{ marginLeft: 8 }}>
            I confirm I’m not currently under contract with another real estate brokerage/agent.
          </span>
        </label>

        <label style={styles.check}>
          <input
            type="checkbox"
            name="casl"
            checked={state.casl}
            onChange={onChange}
            required
          />
          <span style={{ marginLeft: 8 }}>
            I consent to receive emails from NorthSide GTA about this request. I can unsubscribe at any time.
          </span>
        </label>

        <button type="submit" disabled={status.loading} style={styles.cta}>
          {status.loading ? "Sending…" : ctaText}
        </button>

        {status.err && <p style={{ color: "#c0392b", marginTop: 10 }}>{status.err}</p>}
        {status.ok && !onSuccessRedirect && (
          <p style={{ color: "#2ecc71", marginTop: 10 }}>
            Success! Check your inbox—the link should arrive within 10 seconds.
          </p>
        )}

        {helperText && <p style={styles.helper}>{helperText}</p>}
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    border: "1px solid rgba(0,0,0,.06)",
    width: "100%",
  },
  label: { display: "block", fontWeight: 600, fontSize: 14, marginBottom: 10 },
  input: {
    marginTop: 6,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    outline: "none",
    fontSize: 16,
  },
  check: { display: "flex", alignItems: "flex-start", fontSize: 13, margin: "10px 0" },
  cta: {
    marginTop: 10,
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    background: "#0B6E4F", // brand-ish green; change if you prefer
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  helper: { marginTop: 16, fontSize: 12.5, lineHeight: 1.6, color: "#475569" },
};