// src/components/HeaderShell.jsx
import React from "react";
import Navigation from "../Navigation";
import CoverageStrip from "./CoverageStrip";

/**
 * HeaderShell
 * Wraps Navigation + CoverageStrip into ONE sticky header,
 * ensuring consistent color and attachment site-wide.
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

      {/* Brand green coverage band */}
      <CoverageStrip />
    </header>
  );
}
