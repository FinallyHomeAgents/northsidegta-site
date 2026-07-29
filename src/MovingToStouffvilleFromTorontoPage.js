import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import stouffvilleMovingGuideModule from "./content/movingFromToronto/stouffville";

const { stouffvilleMovingGuide, buildMovingGuideSchema } = stouffvilleMovingGuideModule;

export default function MovingToStouffvilleFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={stouffvilleMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
