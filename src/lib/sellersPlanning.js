export function getSellerAttribution({ search = "", referrer = "", landingPage = "", currentPageUrl = "" } = {}) {
  const params = new URLSearchParams(search || "");
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || "",
    referrer: referrer || "",
    landing_page: landingPage || currentPageUrl || "",
  };
}

export function validateSellerPlanningForm(form = {}) {
  const errors = {};

  const email = form.email || "";
  const phone = form.phone || "";
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasValidPhone = phone.replace(/\D/g, "").length >= 10;

  if (!String(form.name || "").trim() || (!hasValidEmail && !hasValidPhone)) {
    errors.contact = "Please add your name and either a valid email or phone number.";
  }

  if (!form.notUnderContract) {
    errors.notUnderContract =
      "Please confirm you are not currently under contract with another real estate brokerage for this property.";
  }

  if (!form.contactConsent) {
    errors.contactConsent = "Please confirm Matthew or Landon may contact you about your selling plans.";
  }

  return errors;
}

export function buildSellerPlanningPayload({ form = {}, attribution = {}, currentPageUrl = "", timestamp = new Date().toISOString() } = {}) {
  return {
    ...form,
    goals: Array.isArray(form.goals) ? form.goals.join(", ") : form.goals || "",
    address: form.address || "Private",
    not_under_contract: form.notUnderContract ? "Yes" : "No",
    contact_consent: form.contactConsent ? "Yes" : "No",
    _source: "sellers-page",
    _page_url: currentPageUrl || attribution.landing_page || "",
    _timestamp: timestamp,
    ...attribution,
    current_page_url: currentPageUrl || attribution.landing_page || "",
    submission_timestamp: timestamp,
    _subject: `New Seller Planning Request — ${form.community || "Unknown community"}`,
    _replyto: form.email || undefined,
  };
}

export function fireSellerConversionEvents(targetWindow = typeof window !== "undefined" ? window : undefined) {
  if (!targetWindow) return;
  targetWindow.dataLayer = targetWindow.dataLayer || [];
  targetWindow.dataLayer.push({ event: "seller_submit" });
  if (typeof targetWindow.fbq === "function") {
    targetWindow.fbq("trackCustom", "SellerSubmit");
  }
}
