// Smart Fill Button Injection for Decap CMS
window.addEventListener("DOMContentLoaded", () => {
  const SELECTOR_CANDIDATES = [
    '[data-testid="field-control-smart_fill"]',
    '[data-field-name="smart_fill_restaurants"]',
    '[data-field-name="smart_fill"]',
    "div.SmartFillRestaurants",
    ".SmartFillRestaurants",
  ];
  const SMART_FILL_ENDPOINT = "/api/tastehub/smart-fill";

  let availabilityPromise = null;

  function checkSmartFillAvailability() {
    if (!availabilityPromise) {
      availabilityPromise = fetch(SMART_FILL_ENDPOINT, { method: "HEAD" })
        .then((response) => {
          if (!response.ok) {
            console.warn(
              "[TasteHub Smart Fill] Disabled — smart fill API returned",
              response.status,
              response.statusText
            );
            return false;
          }
          return true;
        })
        .catch((error) => {
          console.warn("[TasteHub Smart Fill] Unable to verify availability", error);
          return false;
        });
    }

    return availabilityPromise;
  }

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

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value.toJS === "function") return value.toJS();
    if (typeof value.toArray === "function") return value.toArray();
    return [];
  }

  function toImmutable(value) {
    const Immutable = window.Immutable;
    if (Immutable && typeof Immutable.fromJS === "function") {
      return Immutable.fromJS(value);
    }
    return value;
  }

  function initializeSmartFill(panel) {
    checkSmartFillAvailability().then((enabled) => {
      if (!enabled) {
        return;
      }

      const { wrapper, button, helperText } = createButton();
      panel.appendChild(wrapper);

      let isLoading = false;
      let visibilityIntervalId = null;

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
      visibilityIntervalId = setInterval(() => {
        if (!document.body.contains(panel)) {
          clearInterval(visibilityIntervalId);
          return;
        }
        updateVisibility();
      }, 500);

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
          const response = await fetch(SMART_FILL_ENDPOINT, {
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

          const responseItems = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.restaurants)
            ? payload.restaurants
            : [];

          const smartFillItems = responseItems
            .map((item) => ({
              name: String(item?.name || item?.restaurantName || "").trim(),
              address: String(item?.address || item?.restaurantAddress || "").trim(),
              link: String(item?.link || "").trim(),
            }))
            .filter((item) => item.name);

          if (!smartFillItems.length) {
            setHelperMessage("Smart Fill did not return any restaurants.", true);
            return;
          }

          const collection = entry.get("collection");
          const slug = entry.get("slug");
          let data = entry.get("data");

          if (!data || typeof data.set !== "function") {
            setHelperMessage("Smart Fill could not update the poll entry.", true);
            return;
          }

          const existingItems = toArray(entry.getIn(["data", "ballot_items"]))
            .map((item) => ({
              name: String(item?.name || "").trim(),
              address: String(item?.address || "").trim(),
              link: String(item?.link || "").trim(),
            }))
            .filter((item) => item.name);

          let shouldOverwrite = true;
          if (existingItems.length) {
            shouldOverwrite = window.confirm(
              "Smart Fill Restaurants:\n\nClick OK to OVERWRITE existing items.\nClick CANCEL to APPEND."
            );
          }

          const combinedItems = shouldOverwrite ? smartFillItems : existingItems.concat(smartFillItems);

          const dedupedItems = [];
          const seenKeys = new Set();
          combinedItems.forEach((item) => {
            const key = `${item.name.toLowerCase()}|${item.address.toLowerCase()}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              dedupedItems.push(item);
            }
          });

          const updatedData = data.set("ballot_items", toImmutable(dedupedItems));

          await Promise.resolve(window.CMS.updateEntry(collection, slug, { data: updatedData }));

          const finalCount = dedupedItems.length;
          const messageAction = shouldOverwrite ? "replaced" : "updated";
          setHelperMessage(
            `Smart Fill ${messageAction} the ballot with ${finalCount} restaurant${
              finalCount === 1 ? "" : "s"
            }. Review before saving.`,
            false
          );
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
    });
  }

  const detectionInterval = setInterval(() => {
    const panel = findSmartFillPanel();
    if (!panel) {
      return;
    }

    if (document.getElementById("smartFillWrapper")) {
      clearInterval(detectionInterval);
      return;
    }

    clearInterval(detectionInterval);
    initializeSmartFill(panel);
  }, 300);
});
