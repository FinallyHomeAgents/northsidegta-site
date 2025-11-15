// Smart Fill Button Injection for Decap CMS
window.addEventListener("DOMContentLoaded", () => {
  const SELECTOR_CANDIDATES = [
    '[data-testid="field-control-smart_fill"]',
    '[data-field-name="smart_fill_restaurants"]',
    '[data-field-name="smart_fill"]',
    "div.SmartFillRestaurants",
    ".SmartFillRestaurants",
  ];

  function findSmartFillPanel() {
    for (const selector of SELECTOR_CANDIDATES) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function createButton() {
    const wrapper = document.createElement("div");
    wrapper.id = "smartFillWrapper";
    wrapper.style.display = "none";
    wrapper.style.margin = "10px 0 20px";

    const button = document.createElement("button");
    button.id = "smartFillBtn";
    button.type = "button";
    button.innerText = "Smart Fill from Google";
    button.style.padding = "10px 16px";
    button.style.background = "#32610E"; // NorthSide GTA green
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.cursor = "pointer";
    button.style.fontSize = "15px";
    button.style.fontWeight = "600";

    const helperText = document.createElement("p");
    helperText.id = "smartFillStatus";
    helperText.style.margin = "8px 0 0";
    helperText.style.fontSize = "13px";
    helperText.style.color = "#475569";

    wrapper.appendChild(button);
    wrapper.appendChild(helperText);

    return { wrapper, button, helperText };
  }

  function formatErrorMessage(message) {
    return message || "Smart Fill failed — please try again.";
  }

  const interval = setInterval(() => {
    const panel = findSmartFillPanel();
    if (!panel || document.getElementById("smartFillWrapper")) {
      if (panel && document.getElementById("smartFillWrapper")) {
        clearInterval(interval);
      }
      return;
    }

    clearInterval(interval);

    const { wrapper, button, helperText } = createButton();
    panel.appendChild(wrapper);

    let isLoading = false;

    function setLoading(state) {
      isLoading = Boolean(state);
      button.disabled = isLoading;
      button.innerText = isLoading ? "Smart Filling…" : "Smart Fill from Google";
    }

    function setHelperMessage(message, isError) {
      helperText.textContent = message || "";
      helperText.style.color = isError ? "#b91c1c" : "#475569";
    }

    function getEntry() {
      return window.CMS?.editorInstance?.entry;
    }

    function getTownAndCategory(entry) {
      if (!entry || typeof entry.getIn !== "function") return { town: "", category: "" };
      const town = entry.getIn(["data", "town"]) || "";
      const category = entry.getIn(["data", "category"]) || "";
      return { town: String(town || "").trim(), category: String(category || "").trim() };
    }

    function updateVisibility() {
      const entry = getEntry();
      const { town, category } = getTownAndCategory(entry);
      const shouldShow = Boolean(town && category);
      if (!shouldShow) {
        wrapper.style.display = "none";
        setHelperMessage("", false);
        return;
      }

      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      setHelperMessage("", false);
    }

    updateVisibility();
    setInterval(updateVisibility, 500);

    async function smartFill() {
      const entry = getEntry();
      if (!entry) {
        alert("Unable to load poll entry.");
        return;
      }

      const { town, category } = getTownAndCategory(entry);

      if (!town || !category) {
        setHelperMessage("Select a Town and Category before using Smart Fill.", true);
        return;
      }

      setHelperMessage("", false);
      setLoading(true);

      try {
        const response = await fetch("/api/tastehub/smart-fill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ town, category }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = payload?.error || "Smart Fill failed.";
          setHelperMessage(formatErrorMessage(message), true);
          return;
        }

        const restaurantName = String(payload?.restaurantName || "").trim();
        const restaurantAddress = String(payload?.restaurantAddress || "").trim();

        if (!restaurantName) {
          setHelperMessage("Smart Fill did not return a restaurant name.", true);
          return;
        }

        const collection = entry.get("collection");
        const slug = entry.get("slug");
        let data = entry.get("data");

        let hasUpdatedField = false;

        const nameKeys = ["restaurant_name", "restaurantName"];
        const addressKeys = ["restaurant_address", "restaurantAddress"];

        if (data && typeof data.has === "function" && typeof data.set === "function") {
          for (const key of nameKeys) {
            if (data.has(key)) {
              data = data.set(key, restaurantName);
              hasUpdatedField = true;
            }
          }

          if (restaurantAddress) {
            for (const key of addressKeys) {
              if (data.has(key)) {
                data = data.set(key, restaurantAddress);
                hasUpdatedField = true;
              }
            }
          }
        }

        if (!hasUpdatedField) {
          setHelperMessage(
            "Smart Fill worked, but no Restaurant Name/Address fields were found to update.",
            true
          );
          return;
        }

        window.CMS.updateEntry(collection, slug, { data });
        setHelperMessage("Smart Fill complete! Review the fields before saving.", false);
      } catch (error) {
        console.error("[TasteHub Smart Fill]", error);
        setHelperMessage("Smart Fill failed — check your connection and try again.", true);
      } finally {
        setLoading(false);
      }
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isLoading) {
        smartFill();
      }
    });
  }, 300);
});
