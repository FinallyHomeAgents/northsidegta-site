// src/TownRouter.js
import React from "react";
import { Route } from "react-router-dom";
import townsData from "./towns.json";
import TownPage from "./TownPage"; // exact casing

// Works whether towns.json is an array, keyed object, or wrapped under towns
function normalizeTowns(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.towns)) return data.towns;
  if (data && typeof data === "object") return Object.values(data);
  return [];
}

function getSlugs() {
  return normalizeTowns(townsData)
    .map((t) => (t && t.slug ? String(t.slug).toLowerCase() : null))
    .filter(Boolean)
    .sort();
}

export const TOWN_SLUGS = getSlugs();

// Generate <Route> entries for short URLs like /aurora
export function buildTownRoutes() {
  return TOWN_SLUGS.map((slug) => (
    <Route key={slug} path={`/${slug}`} element={<TownPage />} />
  ));
}
