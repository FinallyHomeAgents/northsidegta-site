// Inject Smart Fill button into CMS
window.addEventListener("DOMContentLoaded", () => {
  const interval = setInterval(() => {
    const panel = document.querySelector('[data-field-name="smart_fill"]');

    if (panel && !document.getElementById("smartFillBtn")) {
      clearInterval(interval);

      // Create button
      const btn = document.createElement("button");
      btn.id = "smartFillBtn";
      btn.innerText = "Smart Fill Restaurants";
      btn.style.padding = "10px 16px";
      btn.style.background = "#1a73e8";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.margin = "6px 0";

      panel.appendChild(btn);

      btn.addEventListener("click", async () => {
        const entry = window.CMS?.editorInstance?.entry;
        if (!entry) return alert("Unable to load current poll entry.");

        const town = entry.getIn(["data", "town"]);
        const category = entry.getIn(["data", "category"]);
        const items = entry.getIn(["data", "ballot_items"]) || [];

        if (!town || !category) {
          alert("Please select both Town and Category before running Smart Fill.");
          return;
        }

        const overwrite = confirm(
          "Smart Fill Restaurants:\n\nClick OK to OVERWRITE all items.\nClick Cancel to APPEND."
        );

        const res = await fetch(
          `/api/tastehub/generate-ballot?town=${encodeURIComponent(
            town
          )}&category=${encodeURIComponent(category)}`
        );

        const data = await res.json();

        if (!Array.isArray(data)) {
          return alert("Smart Fill failed. Check API or API key.");
        }

        const newItems = overwrite ? data : items.concat(data);

        window.CMS.updateEntry(entry.get("collection"), entry.get("slug"), {
          data: entry.get("data").set("ballot_items", newItems),
        });

        alert("Smart Fill complete! Review the results and save the poll.");
      });
    }
  }, 500);
});
