import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import auroraMovingGuideModule from "./content/movingFromToronto/aurora";

const { auroraMovingGuide, buildMovingGuideSchema } = auroraMovingGuideModule;

export default function MovingToAuroraFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={auroraMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
