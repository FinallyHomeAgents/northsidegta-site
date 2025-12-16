export const PRIMARY_TOWNS = [
  "Uxbridge",
  "Aurora",
  "Newmarket",
  "Stouffville",
  "East Gwillimbury",
  "Georgina",
  "Scugog",
  "Considering a move to the NorthSide GTA",
];

export const MEMBER_TYPES = ["Buyer", "Seller", "Local Resident", "Just Exploring"];
export const INTERESTS = ["Community events", "TasteHub food rankings", "Market insights"];
export const DEFAULT_CARD_NUMBER = "00000000";
export const FUTURE_RESIDENT_LABEL = "Future NorthSide GTA Resident";

export const KEY_BENEFITS = [
  {
    title: "A sense of belonging",
    description:
      "Be part of a growing community of people who are proud to call the NorthSide GTA home — or are planning to.",
  },
  {
    title: "What’s happening, without the noise",
    description:
      "A roughly monthly update highlighting local events, TasteHub food rankings, community highlights, and new guides.",
  },
  {
    title: "Member-only experiences (coming soon)",
    description: "Future NorthSide GTA community events designed exclusively for members.",
  },
  {
    title: "Local business perks (coming soon)",
    description:
      "Exclusive offers from local businesses who support and celebrate the NorthSide GTA community.",
  },
];

export const buildCardLabel = (primaryTown) => {
  if (!primaryTown) return "NorthSide GTA Member";
  if (primaryTown === "Considering a move to the NorthSide GTA") {
    return FUTURE_RESIDENT_LABEL;
  }
  return `${primaryTown} Member`;
};

export const buildTownDisplay = (primaryTown) => {
  if (!primaryTown || primaryTown === "Considering a move to the NorthSide GTA") {
    return "NorthSide GTA";
  }
  return primaryTown;
};
