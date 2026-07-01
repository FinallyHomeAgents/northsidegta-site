import React from "react";
import TownLivingGuide from "./components/towns/TownLivingGuide";
import { georginaLivingGuide, townLogoAssets } from "./components/towns/townLivingGuideData";

const relatedTowns = [
  ["Uxbridge", "uxbridge"], ["Newmarket", "newmarket"], ["Aurora", "aurora"],
  ["East Gwillimbury", "east-gwillimbury"], ["Stouffville", "stouffville"], ["Scugog", "scugog"],
].map(([name, slug]) => ({ name, href: `/communities/${slug}`, logo: townLogoAssets[slug] }));

export default function GeorginaLivingGuidePage() {
  return <TownLivingGuide guide={georginaLivingGuide} relatedTowns={relatedTowns} />;
}
