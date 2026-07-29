import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import scugogMovingGuideModule from "./content/movingFromToronto/scugog";

const { scugogMovingGuide, buildMovingGuideSchema } = scugogMovingGuideModule;

export default function MovingToPortPerryScugogFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={scugogMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
