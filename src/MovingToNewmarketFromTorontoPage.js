import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import newmarketMovingGuideModule from "./content/movingFromToronto/newmarket";

const { newmarketMovingGuide, buildMovingGuideSchema } = newmarketMovingGuideModule;

export default function MovingToNewmarketFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={newmarketMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
