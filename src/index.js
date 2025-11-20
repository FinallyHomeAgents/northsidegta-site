import React from "react";
import ReactDOM from "react-dom/client";
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
