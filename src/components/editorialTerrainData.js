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
    path: "M420 194 L680 194 680 300 420 300Z", label: [550, 247], dot: [550, 216],
    highlights: [
      { icon: "home", title: "Space for growing families", detail: "Newer homes and generous properties" },
      { icon: "car", title: "GO and 404 connections", detail: "Flexible routes for commuters" },
      { icon: "leaf", title: "Countryside close to town", detail: "Open space minutes from Newmarket" },
    ],
  },
  {
    id: "newmarket", name: "Newmarket", subtitle: "Old Main", url: "/communities/newmarket", image: "/Images/newmarket-banner.jpg", travel: "~ 40 min", commuteScore: 84, balanceScore: 30,
    path: "M420 300 L548 300 548 385 420 385Z", label: [483, 339], dot: [483, 313],
    highlights: [
      { icon: "walk", title: "Walkable historic Main Street", detail: "Independent dining and local events" },
      { icon: "people", title: "Full-service regional hub", detail: "Shopping, health care and recreation" },
      { icon: "car", title: "Strong GO connections", detail: "Direct rail and highway options" },
    ],
  },
  {
    id: "aurora", name: "Aurora", subtitle: "Town Park", url: "/communities/aurora", image: "/Images/aurora-banner.jpg", travel: "~ 35 min", commuteScore: 90, balanceScore: 18,
    path: "M420 385 L548 385 548 475 420 475Z", label: [483, 430], dot: [483, 402],
    highlights: [
      { icon: "home", title: "Mature neighbourhoods", detail: "Leafy streets and established homes" },
      { icon: "people", title: "Parks and cultural amenities", detail: "A polished town-centre lifestyle" },
      { icon: "car", title: "Fast southbound access", detail: "GO rail, Highway 404 and Yonge Street" },
    ],
  },
  {
    id: "stouffville", name: "Whitchurch–Stouffville", subtitle: "Stouffville", url: "/communities/stouffville", image: "/Images/stouffville-banner.jpg", travel: "~ 45 min", commuteScore: 76, balanceScore: 42,
    path: "M548 300 L680 300 680 475 548 475Z", label: [614, 383], dot: [614, 333],
    highlights: [
      { icon: "walk", title: "Main Street character", detail: "Local shops, patios and community events" },
      { icon: "tree", title: "Trails and countryside", detail: "Nature starts at the edge of town" },
      { icon: "car", title: "GO rail to Toronto", detail: "A practical weekday connection" },
    ],
  },
  {
    id: "uxbridge", name: "Uxbridge", subtitle: "Trail Capital", url: "/communities/uxbridge", image: "/Images/uxbridge-banner.jpg", travel: "~ 60 min", commuteScore: 60, balanceScore: 82,
    path: "M680 194 L875 194 875 475 680 475Z", label: [776, 336], dot: [776, 304],
    highlights: [
      { icon: "tree", title: "Canada's Trail Capital", detail: "An exceptional network of routes" },
      { icon: "leaf", title: "Rolling countryside", detail: "Conservation land and rural views" },
      { icon: "walk", title: "Independent main-street life", detail: "A close-knit local centre" },
    ],
  },
  {
    id: "scugog", name: "Scugog", subtitle: "Port Perry · Lake Scugog", url: "/communities/scugog", image: "/Images/scugog-banner.jpg", travel: "~ 70 min", commuteScore: 48, balanceScore: 94,
    path: "M875 194 L1055 194 1070 350 1035 475 875 475Z", label: [970, 381], dot: [970, 348],
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
  { id: "bradford", name: "Bradford", path: "M165 125 L235 105 305 135 340 113 370 128 398 112 420 135 420 300 165 300Z", label: [275, 230], dot: [275, 205] },
  { id: "king", name: "King", path: "M165 300 L420 300 420 475 165 475Z", label: [280, 385], dot: [280, 360] },
  { id: "vaughan", name: "Vaughan", path: "M165 475 L360 475 360 585 165 585Z", label: [260, 535], dot: [260, 510] },
  { id: "richmond-hill", name: "Richmond Hill", path: "M360 475 L510 475 510 535 360 535Z", label: [435, 514], dot: [435, 490] },
  { id: "markham", name: "Markham", path: "M510 475 L680 475 680 585 360 585 360 535 510 535Z", label: [565, 548], dot: [565, 523] },
  { id: "pickering", name: "Pickering", path: "M680 475 L810 475 810 635 680 635Z", label: [745, 555], dot: [745, 530] },
  { id: "ajax", name: "Ajax", path: "M810 475 L905 475 905 638 810 635Z", label: [858, 555], dot: [858, 530] },
  { id: "whitby", name: "Whitby", path: "M905 475 L1010 475 1010 638 905 638Z", label: [957, 555], dot: [957, 530] },
  { id: "oshawa", name: "Oshawa", path: "M1010 475 L1140 475 1140 632 1010 638Z", label: [1074, 555], dot: [1074, 530] },
];

export const TORONTO = {
  path: "M165 585 L680 585 680 635 C640 640 615 652 575 648 C535 643 510 654 470 658 C425 662 390 651 350 648 C300 644 245 651 205 645 L165 642Z",
  label: [420, 623],
  dot: [520, 603],
};
