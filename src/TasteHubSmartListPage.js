import React, { useState } from "react";

const DEFAULT_LIMIT = 20;

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

function TasteHubSmartListPage() {
  const [town, setTown] = useState("");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setCopied(false);
    setError("");

    const trimmedTown = town.trim();
    const trimmedCategory = category.trim();
    const parsedLimit = Number(limit) || DEFAULT_LIMIT;

    if (!trimmedTown || !trimmedCategory) {
      setError("Please enter both a Town and a Type of restaurant.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("/api/tastehub/smart-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ town: trimmedTown, category: trimmedCategory, limit: parsedLimit }),
      });

      const responseClone = response.clone();
      let payload;
      try {
        payload = await responseClone.json();
      } catch (parseError) {
        const fallbackText = await response.text().catch(() => "");
        setError(
          response.ok
            ? "Smart List returned invalid JSON."
            : `Smart List failed: ${fallbackText || parseError.message}`
        );
        return;
      }

      if (!response.ok || !payload || !Array.isArray(payload.restaurants)) {
        setError(payload?.error || "Smart List did not return a restaurants list.");
        return;
      }

      const list = payload.restaurants;

      if (!list.length) {
        setOutput("No restaurants were returned. Try broadening your search.");
      } else {
        const lines = list.map(item => {
          const address = item.address?.trim() || "Address unavailable";
          const link = item.link?.trim() || "";
          const linkSection = link ? ` – ${link}` : "";
          return `${item.name} – ${address}${linkSection}`;
        });
        setOutput(lines.join("\n"));
      }
    } catch (err) {
      setError(err.message || "Smart List failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
      setError("Unable to copy to clipboard in this browser.");
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: "min(960px, 100%)",
        background: "#fff",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 45px 120px rgba(15, 23, 42, 0.25)",
        display: "grid",
        gap: "24px",
      }}>
        <div>
          <p style={{ margin: 0, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "11px" }}>
            TasteHub Utility
          </p>
          <h1 style={{ margin: "6px 0 12px", fontSize: "32px", color: "#0f172a" }}>TasteHub Smart List</h1>
          <p style={{ margin: 0, color: "#475569", maxWidth: "720px" }}>
            Generate a copy-friendly list of restaurants to paste into TasteHub polls. Choose a town and describe the category,
            then paste the results into your ballots.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Town</span>
            <input
              type="text"
              placeholder="Aurora"
              value={town}
              onChange={e => setTown(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
              }}
            />
          </label>

          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Type of restaurant</span>
            <input
              type="text"
              placeholder="Chinese food, pizza, sushi…"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
              }}
            />
          </label>

          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Max results</span>
            <input
              type="number"
              min="1"
              max="30"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
                width: "120px",
              }}
            />
          </label>

          {error && (
            <div style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: 600,
              background: loading ? "#94a3b8" : "#047857",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating…" : "Generate Smart List"}
          </button>
        </form>

        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Results</h2>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              style={{
                border: "1px solid #cbd5f5",
                borderRadius: "999px",
                padding: "8px 16px",
                background: output ? "#eef2ff" : "#e2e8f0",
                color: "#312e81",
                cursor: output ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            placeholder="Your Smart List will appear here."
            style={{
              minHeight: "260px",
              width: "100%",
              borderRadius: "16px",
              border: "1px solid #cbd5f5",
              padding: "18px",
              fontSize: "14px",
              fontFamily: "SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
              background: "#f8fafc",
              color: "#0f172a",
            }}
          />
        </div>
      </div>
    </main>
  );
}

export default TasteHubSmartListPage;
