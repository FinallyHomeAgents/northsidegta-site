import React, { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "../Navigation";
import CoverageStrip from "./CoverageStrip";

const HIDE_TOWN_RAIL_PREFIXES = [
  "/cms",
  "/community/events-admin",
  "/community/events-review",
  "/thank-you",
  "/listings",
  "/northside-pass-preview",
];

const shouldShowTownRail = (pathname) => (
  !HIDE_TOWN_RAIL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
);

const HeaderShellContext = createContext(false);

export function HeaderShellProvider({ children }) {
  return <HeaderShellContext.Provider value={true}>{children}</HeaderShellContext.Provider>;
}

/**
 * HeaderShell
 * Site-wide global header composed of the primary navigation and optional town shortcut rail.
 */
export default function HeaderShell({ global = false }) {
  const { pathname } = useLocation();
  const renderedByAppShell = useContext(HeaderShellContext);

  if (renderedByAppShell && !global) {
    return null;
  }

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white">
      <Navigation />
      {shouldShowTownRail(pathname) && <CoverageStrip />}
    </header>
  );
}
