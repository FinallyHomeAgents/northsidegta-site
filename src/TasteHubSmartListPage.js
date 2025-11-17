import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_LIMIT = 20;

const TOWNS = [
  "Georgina",
  "East Gwillimbury",
  "Newmarket",
  "Aurora",
  "Stouffville",
  "Uxbridge",
  "Scugog",
];

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

function TasteHubSmartListPage() {
  const [town, setTown] = useState("");
  const [townArea, setTownArea] = useState("");
  const [category, setCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [townAreas, setTownAreas] = useState([]);
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/tastehub/categories", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok && Array.isArray(payload.categories)) {
          setCategories(payload.categories);
        }
      } catch (err) {
        console.error("[TasteHubSmartList] Failed to load categories", err);
      }
    };

    const loadTownAreas = async () => {
      try {
        const response = await fetch("/api/tastehub/town-areas", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok && Array.isArray(payload.townAreas)) {
          setTownAreas(payload.townAreas);
        }
      } catch (err) {
        console.error("[TasteHubSmartList] Failed to load town areas", err);
      }
    };

    loadCategories();
    loadTownAreas();
  }, []);

  useEffect(() => {
    setTownArea("");
  }, [town]);

  const filteredAreas = useMemo(() => {
    if (!town) return [];
    return townAreas.filter(area => area.town === town);
  }, [town, townAreas]);

  const selectedCategory = useMemo(() => categories.find(entry => entry.slug === category), [categories, category]);

  const handleSubmit = async event => {
    event.preventDefault();
    setCopied(false);
    setError("");

    const trimmedTown = town.trim();
    const trimmedArea = townArea.trim();
    const trimmedCategory = category.trim();
    const trimmedCustomCategory = customCategory.trim();
    const parsedLimit = Number(limit) || DEFAULT_LIMIT;

    const effectiveCategory =
      useCustomCategory && trimmedCustomCategory
        ? trimmedCustomCategory
        : selectedCategory?.name || selectedCategory?.slug || trimmedCategory;

    if (!trimmedTown || !effectiveCategory) {
      setError("Please select a Town and a Category (or enter a custom one).");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("/api/tastehub/smart-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          town: trimmedTown,
          area: trimmedArea,
          category: effectiveCategory,
          limit: parsedLimit,
        }),
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
            Generate a copy-friendly list of restaurants to paste into TasteHub polls. Pick a town and optional area, choose a
            category (or override it), then paste the results into your ballots.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Town</span>
            <select
              value={town}
              onChange={e => setTown(e.target.value)}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
                background: "#fff",
              }}
            >
              <option value="" disabled>
                Select a town
              </option>
              {TOWNS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Town Area / Hamlet</span>
            <select
              value={townArea}
              onChange={e => setTownArea(e.target.value)}
              disabled={!town || !filteredAreas.length}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
                background: "#fff",
                color: !town || !filteredAreas.length ? "#94a3b8" : "#0f172a",
              }}
            >
              <option value="">
                {town ? `All areas in ${town}` : "Select a town first"}
              </option>
              {filteredAreas.map(area => (
                <option key={area.slug} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
            {!town && (
              <small style={{ color: "#64748b" }}>Choose a town to see its areas (optional).</small>
            )}
          </label>

          <label style={fieldStyle}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Category</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={useCustomCategory}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5f5",
                padding: "12px 14px",
                fontSize: "15px",
                background: useCustomCategory ? "#e2e8f0" : "#fff",
                color: useCustomCategory ? "#94a3b8" : "#0f172a",
              }}
            >
              <option value="">Select a category</option>
              {categories.map(item => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            {!categories.length && (
              <small style={{ color: "#64748b" }}>
                Categories are managed in CMS. If none appear, add some in TasteHub Categories.
              </small>
            )}
          </label>

          <div style={{ ...fieldStyle, gap: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0f172a" }}>
              <input
                type="checkbox"
                checked={useCustomCategory}
                onChange={e => setUseCustomCategory(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontWeight: 600 }}>Use custom category instead</span>
            </label>
            {useCustomCategory && (
              <input
                type="text"
                placeholder="Enter a custom category (e.g. dessert)"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                style={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5f5",
                  padding: "12px 14px",
                  fontSize: "15px",
                }}
              />
            )}
          </div>

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
