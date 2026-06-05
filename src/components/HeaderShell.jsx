import React from "react";
import { useLocation } from "react-router-dom";
import Navigation from "../Navigation";
import CoverageStrip from "./CoverageStrip";

const COMMUNITY_SHORTCUT_PATHS = [
  "/",
  "/communities",
  "/community",
  "/tastehub",
  "/aurora",
  "/newmarket",
  "/stouffville",
  "/east-gwillimbury",
  "/georgina",
  "/uxbridge",
  "/scugog",
];

const shouldShowTownRail = (pathname) => (
  COMMUNITY_SHORTCUT_PATHS.includes(pathname) ||
  pathname.startsWith("/communities/") ||
  pathname.startsWith("/community/") ||
  pathname.startsWith("/tastehub/")
);

/**
 * HeaderShell
 * Site-wide global header composed of the primary navigation and optional town shortcut rail.
 */
export default function HeaderShell() {
  const { pathname } = useLocation();

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white">
      <Navigation />
      {shouldShowTownRail(pathname) && <CoverageStrip />}
    </header>
  );
}
