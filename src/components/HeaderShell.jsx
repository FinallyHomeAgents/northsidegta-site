// src/components/HeaderShell.jsx
import React from "react";
import Navigation from "../Navigation";

/**
 * HeaderShell
 * Shared top header wrapper for site navigation.
 */
export default function HeaderShell() {
  return (
    <header
      role="banner"
      className="
        sticky top-0 z-50
        bg-white
      "
    >
      {/* Your existing toolbar */}
      <Navigation />

    </header>
  );
}
