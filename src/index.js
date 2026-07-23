import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

if (process.env.NODE_ENV === "production") {
  const logClientError = (payload) => {
    try {
      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (error) {
      // Swallow any errors from the logger itself
    }
  };

  window.onerror = function (message, source, lineno, colno, error) {
    logClientError({
      message: message?.toString?.() ?? "Unknown error",
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  window.onunhandledrejection = function (event) {
    const reason = event?.reason;
    const message =
      typeof reason === "string"
        ? reason
        : reason?.message ?? "Unhandled promise rejection";

    logClientError({
      message,
      stack: reason?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };
}

const rootElement = document.getElementById("root");
const isPrerenderedCommunity = rootElement?.dataset?.prerender === "community";

function installCommunityFormHandlers() {
  window.submitTownLead = (id, town) => {
    const nameInput = document.getElementById(`sf_name_${id}`);
    const emailInput = document.getElementById(`sf_email_${id}`);
    const phoneInput = document.getElementById(`sf_phone_${id}`);
    const timelineInput = document.getElementById(`sf_tl_${id}`);
    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    const payload = {
      name,
      email,
      phone: phoneInput?.value,
      timeline: timelineInput?.value,
      town,
      source: `NorthSide GTA Neighbourhood Guide v4 — ${town} town page`,
      timestamp: new Date().toISOString(),
    };
    fetch("/api/send-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, casl: true, notRepresented: true, title: `NorthSide GTA local guidance — ${town}`, realmLink: window.location.href }),
      credentials: "same-origin",
    }).catch(() => {});
    const button = document.querySelector(".cta-submit");
    if (button) {
      button.textContent = "✓ Request sent";
      button.disabled = true;
    }
  };

  window.submitSMSTown = (id, town) => {
    const phone = document.getElementById(`sms_${id}`)?.value.trim();
    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }
    const payload = { phone, town, source: `NorthSide SMS opt-in — ${town}`, timestamp: new Date().toISOString() };
    fetch("/api/sms-optin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    }).catch(() => {});
    const smsBox = document.getElementById(`sms_${id}`)?.closest(".sms-box");
    if (smsBox) smsBox.innerHTML = `<p style="color:rgba(255,255,255,0.8);font-size:13px;">&#10003; You're in. We'll text you new ${town} listings. Reply STOP to unsubscribe.</p>`;
  };
}

function StaticCommunityHydrator() {
  const html = useMemo(() => window.__NORTHSIDE_PRERENDERED_COMMUNITY_HTML__ || "", []);
  useEffect(() => {
    installCommunityFormHandlers();
    return () => {
      delete window.submitTownLead;
      delete window.submitSMSTown;
    };
  }, []);
  return <div data-static-community-content="" dangerouslySetInnerHTML={{ __html: html }} />;
}

if (isPrerenderedCommunity && rootElement.firstElementChild) {
  window.__NORTHSIDE_PRERENDERED_COMMUNITY_HTML__ = rootElement.firstElementChild.innerHTML;
  hydrateRoot(
    rootElement,
    <HelmetProvider>
      <StaticCommunityHydrator />
    </HelmetProvider>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
