import React from "react";
import Navigation from "../Navigation";
import CoverageStrip from "./CoverageStrip";

/**
 * HeaderShell
 * Site-wide global header composed of the primary navigation and NorthSide town rail.
 */
export default function HeaderShell() {
  return (
    <header role="banner" className="sticky top-0 z-50 bg-white">
      <Navigation />
      <CoverageStrip />
    </header>
  );
}
