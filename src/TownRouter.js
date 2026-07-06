// src/TownRouter.js
import React from "react";
import { Route } from "react-router-dom";
import towns from "./towns.json";
import TownPage from "./TownPage"; // exact casing

// Works whether towns.json is an array or an object keyed by slug
function getSlugs() {
  if (Array.isArray(towns)) {
    return towns
      .map((t) => (t && t.slug ? String(t.slug).toLowerCase() : null))
      .filter(Boolean)
      .sort();
  }
  return Object.keys(towns).map((s) => s.toLowerCase()).sort();
}

export const TOWN_SLUGS = getSlugs();

// Generate <Route> entries for short URLs like /aurora
export function buildTownRoutes() {
  return TOWN_SLUGS.map((slug) => (
    <Route key={slug} path={`/${slug}`} element={<TownPage />} />
  ));
}
