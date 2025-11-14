// Smart Fill Button Injection for Decap CMS
window.addEventListener("DOMContentLoaded", () => {
  const interval = setInterval(() => {
    // Try all possible Smart Fill panel selectors
    const panel =
      document.querySelector('[data-field-name="smart_fill_restaurants"]') ||
      document.querySelector('[data-field-name="smart_fill"]') ||
      document.querySelector("div.SmartFillRestaurants") ||
      document.querySelector(".SmartFillRestaurants");

    if (panel && !document.getElementById("smartFillBtn")) {
      clearInterval(interval);

      const btn = document.createElement("button");
      btn.id = "smartFillBtn";
      btn.innerText = "Smart Fill Restaurants";
      btn.style.padding = "10px 16px";
      btn.style.background = "#32610E"; // NorthSide GTA green
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.margin = "10px 0 20px 0";
      btn.style.fontSize = "15px";
      btn.style.fontWeight = "600";

      panel.appendChild(btn);

      btn.addEventListener("click", async () => {
        const entry = window.CMS?.editorInstance?.entry;

        if (!entry) {
          alert("Unable to load poll entry.");
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
          "Smart Fill Restaurants:\n\nClick OK to OVERWRITE existing items.\nClick CANCEL to APPEND."
        );

        try {
          const res = await fetch(
            `/api/tastehub/generate-ballot?town=${encodeURIComponent(town)}&category=${encodeURIComponent(category)}`
          );

          const data = await res.json();

          if (!Array.isArray(data)) {
            alert("Smart Fill failed — invalid response.");
            return;
          }

          const newItems = overwrite ? data : items.concat(data);

          window.CMS.updateEntry(entry.get("collection"), entry.get("slug"), {
            data: entry.get("data").set("ballot_items", newItems),
          });

          alert("Smart Fill complete! Review and save the poll.");
        } catch (err) {
          console.error(err);
          alert("Smart Fill failed — network or server error.");
        }
      });
    }
  }, 300);
});
