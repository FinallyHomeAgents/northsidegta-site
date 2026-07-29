import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import georginaMovingGuideModule from "./content/movingFromToronto/georgina";

const { georginaMovingGuide, buildMovingGuideSchema } = georginaMovingGuideModule;

export default function MovingToGeorginaFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={georginaMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
