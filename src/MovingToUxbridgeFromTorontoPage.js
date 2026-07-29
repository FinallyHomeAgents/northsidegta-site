import React from "react";
import MovingFromTorontoPage from "./components/movingFromToronto/MovingFromTorontoPage";
import uxbridgeMovingGuideModule from "./content/movingFromToronto/uxbridge";

const { uxbridgeMovingGuide, buildMovingGuideSchema } = uxbridgeMovingGuideModule;

export default function MovingToUxbridgeFromTorontoPage() {
  return (
    <MovingFromTorontoPage
      content={uxbridgeMovingGuide}
      buildSchema={buildMovingGuideSchema}
    />
  );
}
