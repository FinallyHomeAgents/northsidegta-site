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
        const cms = window.CMS;
        const entryDraft = cms?.getState?.().getIn(["entryDraft", "entry"]);

        if (!entryDraft) {
          alert("Unable to load poll entry.");
          return;
        }

        const town = entryDraft.getIn(["data", "town"]);
        const category = entryDraft.getIn(["data", "category"]);
        const itemsRaw = entryDraft.getIn(["data", "ballot_items"]);
        const items = Array.isArray(itemsRaw)
          ? itemsRaw
          : itemsRaw?.toJS?.() ?? [];

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

          let payload;
          try {
            payload = await res.json();
          } catch (error) {
            console.error("Smart Fill response parsing failed", error);
            alert("Smart Fill failed — invalid response.");
            return;
          }

          if (!res.ok) {
            const message = payload?.error || res.statusText || "Unknown error";
            alert(`Smart Fill failed — ${message}.`);
            return;
          }

          if (!Array.isArray(payload)) {
            const message = payload?.error || "invalid response";
            alert(`Smart Fill failed — ${message}.`);
            return;
          }

          const newItems = overwrite ? payload : items.concat(payload);
          const dataMap = entryDraft.get("data");
          const dataObj = dataMap?.toJS?.() ?? dataMap ?? {};

          const collection = entryDraft.get("collection");
          const slug = entryDraft.get("slug");

          await cms.updateEntry(collection, slug, {
            data: { ...dataObj, ballot_items: newItems },
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
