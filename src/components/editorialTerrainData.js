export const FILTERS = [
  { id: "commute", label: "Commute", icon: "car", towns: ["aurora", "newmarket", "east-gwillimbury", "stouffville", "georgina"] },
  { id: "lake", label: "Lake Life", icon: "boat", towns: ["georgina", "scugog"] },
  { id: "walk", label: "Walkability", icon: "walk", towns: ["aurora", "newmarket", "stouffville"] },
  { id: "trails", label: "Trails", icon: "tree", towns: ["uxbridge", "scugog", "georgina", "east-gwillimbury"] },
  { id: "value", label: "Space + Value", icon: "home", towns: ["georgina", "east-gwillimbury", "uxbridge", "scugog"] },
];

export const COMMUNITIES = [
  {
    id: "georgina", name: "Georgina", subtitle: "Keswick · Sutton", url: "/communities/georgina", image: "/Images/georgina-banner.jpg", travel: "~ 55 min", commuteScore: 72, balanceScore: 78,
    path: "M490 106 L590 76 660 91 730 78 805 91 875 126 875 194 490 194Z", label: [683, 145], dot: [684, 116],
    highlights: [
      { icon: "tree", title: "4-season lake lifestyle", detail: "Beaches, boating, year-round recreation" },
      { icon: "people", title: "Spacious, family-friendly communities", detail: "More home for your lifestyle" },
      { icon: "leaf", title: "Nature at your doorstep", detail: "Trails, conservation and green space" },
    ],
  },
  {
    id: "east-gwillimbury", name: "East Gwillimbury", subtitle: "Holland Landing", url: "/communities/east-gwillimbury", image: "/Images/eastgwillimbury-banner.jpg", travel: "~ 45 min", commuteScore: 78, balanceScore: 50,
    path: "M420 194 L680 194 680 315 420 315Z", label: [550, 251], dot: [550, 216],
    highlights: [
      { icon: "home", title: "Space for growing families", detail: "Newer homes and generous properties" },
      { icon: "car", title: "GO and 404 connections", detail: "Flexible routes for commuters" },
      { icon: "leaf", title: "Countryside close to town", detail: "Open space minutes from Newmarket" },
    ],
  },
  {
    id: "newmarket", name: "Newmarket", subtitle: "Old Main", url: "/communities/newmarket", image: "/Images/newmarket-banner.jpg", travel: "~ 40 min", commuteScore: 84, balanceScore: 30,
    path: "M420 315 L548 315 548 407 420 407Z", label: [483, 357], dot: [483, 329],
    highlights: [
      { icon: "walk", title: "Walkable historic Main Street", detail: "Independent dining and local events" },
      { icon: "people", title: "Full-service regional hub", detail: "Shopping, health care and recreation" },
      { icon: "car", title: "Strong GO connections", detail: "Direct rail and highway options" },
    ],
  },
  {
    id: "aurora", name: "Aurora", subtitle: "Town Park", url: "/communities/aurora", image: "/Images/aurora-banner.jpg", travel: "~ 35 min", commuteScore: 90, balanceScore: 18,
    path: "M420 407 L548 407 548 510 420 510Z", label: [483, 455], dot: [483, 426],
    highlights: [
      { icon: "home", title: "Mature neighbourhoods", detail: "Leafy streets and established homes" },
      { icon: "people", title: "Parks and cultural amenities", detail: "A polished town-centre lifestyle" },
      { icon: "car", title: "Fast southbound access", detail: "GO rail, Highway 404 and Yonge Street" },
    ],
  },
  {
    id: "stouffville", name: "Whitchurch–Stouffville", subtitle: "Stouffville", url: "/communities/stouffville", image: "/Images/stouffville-banner.jpg", travel: "~ 45 min", commuteScore: 76, balanceScore: 42,
    path: "M548 315 L680 315 680 510 548 510Z", label: [614, 404], dot: [614, 351],
    highlights: [
      { icon: "walk", title: "Main Street character", detail: "Local shops, patios and community events" },
      { icon: "tree", title: "Trails and countryside", detail: "Nature starts at the edge of town" },
      { icon: "car", title: "GO rail to Toronto", detail: "A practical weekday connection" },
    ],
  },
  {
    id: "uxbridge", name: "Uxbridge", subtitle: "Trail Capital", url: "/communities/uxbridge", image: "/Images/uxbridge-banner.jpg", travel: "~ 60 min", commuteScore: 60, balanceScore: 82,
    path: "M680 194 L875 194 875 510 680 510Z", label: [776, 354], dot: [776, 322],
    highlights: [
      { icon: "tree", title: "Canada's Trail Capital", detail: "An exceptional network of routes" },
      { icon: "leaf", title: "Rolling countryside", detail: "Conservation land and rural views" },
      { icon: "walk", title: "Independent main-street life", detail: "A close-knit local centre" },
    ],
  },
  {
    id: "scugog", name: "Scugog", subtitle: "Port Perry · Lake Scugog", url: "/communities/scugog", image: "/Images/scugog-banner.jpg", travel: "~ 70 min", commuteScore: 48, balanceScore: 94,
    path: "M875 194 L1055 194 1070 374 1035 510 875 510Z", label: [970, 405], dot: [970, 372],
    highlights: [
      { icon: "boat", title: "Port Perry waterfront", detail: "A lively centre on Lake Scugog" },
      { icon: "tree", title: "Lake-oriented recreation", detail: "Boating, parks and four seasons" },
      { icon: "home", title: "Generous rural space", detail: "Farms, villages and larger properties" },
    ],
  },
];

export function getBalanceMatches(balance, count = 2) {
  return [...COMMUNITIES]
    .sort((a, b) => Math.abs(a.balanceScore - balance) - Math.abs(b.balanceScore - balance))
    .slice(0, count);
}

export const CONTEXT = [
  { name: "Bradford", path: "M165 125 L235 105 305 135 340 113 370 128 398 112 420 135 420 315 165 315Z", label: [275, 240], dot: [275, 215] },
  { name: "King", path: "M165 315 L420 315 420 510 165 510Z", label: [280, 402], dot: [280, 377] },
  { name: "Vaughan", path: "M165 510 L360 510 360 640 165 640Z", label: [260, 570], dot: [260, 545] },
  { name: "Richmond Hill", path: "M360 510 L548 510 548 640 360 640Z", label: [453, 570], dot: [453, 545] },
  { name: "Markham", path: "M548 510 L680 510 680 640 548 640Z", label: [614, 570], dot: [614, 545] },
  { name: "Pickering", path: "M680 510 L810 510 810 640 680 640Z", label: [745, 570], dot: [745, 545] },
  { name: "Ajax", path: "M810 510 L905 510 905 640 810 640Z", label: [858, 570], dot: [858, 545] },
  { name: "Whitby", path: "M905 510 L1010 510 1010 640 905 640Z", label: [957, 570], dot: [957, 545] },
  { name: "Oshawa", path: "M1010 510 L1140 510 1140 640 1010 640Z", label: [1074, 570], dot: [1074, 545] },
];
