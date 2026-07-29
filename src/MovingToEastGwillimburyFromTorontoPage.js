import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import eastGwillimburyMovingGuideModule from "./content/movingFromToronto/eastGwillimbury";

const { eastGwillimburyMovingGuide, buildMovingGuideSchema } =
  eastGwillimburyMovingGuideModule;

export default function MovingToEastGwillimburyFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={eastGwillimburyMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
