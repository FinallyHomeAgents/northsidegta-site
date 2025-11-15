// Smart Fill Button Injection for Decap CMS
window.addEventListener("DOMContentLoaded", () => {
  const interval = setInterval(() => {
    // Look for the label that belongs to the Smart Fill field
    const label = Array.from(document.querySelectorAll("label"))
      .find(l => l.textContent.trim().toLowerCase() === "smart fill restaurants");

    if (!label) return;

    // Panel is the parent wrapper of the field
    const panel = label.closest('[data-test-id="widget-control"]');

    if (!panel) return;

    // Prevent double insertion
    if (document.getElementById("smartFillBtn")) {
      clearInterval(interval);
      return;
    }

    clearInterval(interval);

    // Create button
    const btn = document.createElement("button");
    btn.id = "smartFillBtn";
    btn.innerText = "Smart Fill Restaurants";
    btn.style.padding = "10px 16px";
    btn.style.background = "#32610E";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.margin = "10px 0 20px 0";
    btn.style.fontSize = "15px";
    btn.style.fontWeight = "600";

    // Inject button UNDER the label
    panel.appendChild(btn);

    // Click handler
    btn.addEventListener("click", async () => {
      const entry = window.CMS?.editorInstance?.entry;

      if (!entry) return alert("Unable to load poll entry.");

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
          `/api/tastehub/generate-ballot?town=${encodeURIComponent(
            town
          )}&category=${encodeURIComponent(category)}`
        );

        const data = await res.json();
        if (!Array.isArray(data)) {
          alert("Smart Fill failed — invalid server response.");
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
  }, 300);
});
