// Smart Fill Button Injection for Decap CMS
window.addEventListener("DOMContentLoaded", () => {
  // Retry until CMS renders the field panel
  const interval = setInterval(() => {
    // Look for the Smart Fill field wrapper
    const panel = document.querySelector('[data-field-name="smart_fill"]');

    // If panel exists and button not yet injected
    if (panel && !document.getElementById("smartFillBtn")) {
      clearInterval(interval);

      // Create the button element
      const btn = document.createElement("button");
      btn.id = "smartFillBtn";
      btn.innerText = "Smart Fill Restaurants";
      btn.style.padding = "10px 16px";
      btn.style.background = "#1a73e8";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.margin = "10px 0";
      btn.style.fontSize = "15px";
      btn.style.fontWeight = "600";

      // Inject button under the panel
      panel.appendChild(btn);

      // Handle click
      btn.addEventListener("click", async () => {
        const entry = window.CMS?.editorInstance?.entry;
        if (!entry) {
          alert("Unable to load current poll entry.");
          return;
        }

        const town = entry.getIn(["data", "town"]);
        const category = entry.getIn(["data", "category"]);
        const items = entry.getIn(["data", "ballot_items"]) || [];

        if (!town || !category) {
          alert("Please select BOTH Town and Category before running Smart Fill.");
          return;
        }

        const overwrite = confirm(
          "Smart Fill Restaurants:\n\nClick OK to OVERWRITE current items.\nClick CANCEL to APPEND new items."
        );

        try {
          const res = await fetch(
            `/api/tastehub/generate-ballot?town=${encodeURIComponent(
              town
            )}&category=${encodeURIComponent(category)}`
          );

          const data = await res.json();
          if (!Array.isArray(data)) {
            alert("Smart Fill failed — check API key or server logs.");
            return;
          }

          const newItems = overwrite ? data : items.concat(data);

          window.CMS.updateEntry(entry.get("collection"), entry.get("slug"), {
            data: entry.get("data").set("ballot_items", newItems),
          });

          alert("Smart Fill complete! Review your items and save the poll.");
        } catch (err) {
          console.error(err);
          alert("Smart Fill failed — network or server error.");
        }
      });
    }
  }, 500);
});
