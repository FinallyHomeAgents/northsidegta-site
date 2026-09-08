export const FILTERS = [
  { id: "commute", label: "Commute", icon: "↗", towns: ["aurora", "newmarket", "east-gwillimbury", "stouffville", "georgina"] },
  { id: "lake", label: "Lake Life", icon: "≈", towns: ["georgina", "scugog"] },
  { id: "walk", label: "Walkability", icon: "◇", towns: ["aurora", "newmarket", "stouffville"] },
  { id: "trails", label: "Trails", icon: "♟", towns: ["uxbridge", "scugog", "georgina", "east-gwillimbury"] },
  { id: "value", label: "Space + Value", icon: "⌂", towns: ["georgina", "east-gwillimbury", "uxbridge", "scugog"] },
];

export const COMMUNITIES = [
  { id:"georgina", name:"Georgina", subtitle:"Keswick · Sutton", url:"/communities/georgina", image:"/Images/towns/georgina.jpg", travel:"About 55 min to Toronto", description:"Lake Simcoe living, established neighbourhoods and room to breathe at the top of the 404 corridor.", path:"M490 106 L590 76 660 91 730 78 805 91 875 126 875 194 490 194Z", label:[683,145], camera:[0,-24] },
  { id:"east-gwillimbury", name:"East Gwillimbury", subtitle:"Holland Landing", url:"/communities/east-gwillimbury", image:"/Images/towns/east-gwillimbury.jpg", travel:"About 45 min to Toronto", description:"A landscape of growing villages, open countryside and convenient connections to Newmarket and the 404.", path:"M420 194 L680 194 680 315 420 315Z", label:[550,251], camera:[20,-4] },
  { id:"newmarket", name:"Newmarket", subtitle:"Old Main", url:"/communities/newmarket", image:"/Images/towns/newmarket.jpg", travel:"About 40 min to Toronto", description:"A connected regional centre pairing historic Main Street with parks, services and established neighbourhoods.", path:"M420 315 L548 315 548 407 420 407Z", label:[483,357], camera:[50,-4] },
  { id:"aurora", name:"Aurora", subtitle:"Town Park", url:"/communities/aurora", image:"/Images/towns/aurora.jpg", travel:"About 35 min to Toronto", description:"Leafy streets, heritage character and a polished town centre with strong southbound connections.", path:"M420 407 L548 407 548 510 420 510Z", label:[483,455], camera:[55,4] },
  { id:"stouffville", name:"Whitchurch–Stouffville", subtitle:"Stouffville", url:"/communities/stouffville", image:"/Images/towns/stouffville.jpg", travel:"About 45 min to Toronto", description:"Small-town energy and rural landscapes meet on the eastern edge of York Region.", path:"M548 315 L680 315 680 510 548 510Z", label:[614,404], camera:[8,2] },
  { id:"uxbridge", name:"Uxbridge", subtitle:"Trail Capital", url:"/communities/uxbridge", image:"/Images/towns/uxbridge.jpg", travel:"About 60 min to Toronto", description:"A trail-rich township of rolling farmland, conservation lands and an independent main-street spirit.", path:"M680 194 L875 194 875 510 680 510Z", label:[776,354], camera:[-30,0] },
  { id:"scugog", name:"Scugog", subtitle:"Port Perry · Lake Scugog", url:"/communities/scugog", image:"/Images/towns/scugog.jpg", travel:"About 70 min to Toronto", description:"Port Perry anchors a lake-oriented township known for its waterfront, farms and generous sense of space.", path:"M875 194 L1055 194 1070 374 1035 510 875 510Z", label:[970,405], camera:[-60,4] },
];

export const CONTEXT = [
  { name:"Bradford", path:"M165 125 L235 105 305 135 340 113 370 128 398 112 420 135 420 315 165 315Z", label:[275,240] },
  { name:"King", path:"M165 315 L420 315 420 510 165 510Z", label:[280,402] },
  { name:"Vaughan", path:"M165 510 L360 510 360 640 165 640Z", label:[260,570] },
  { name:"Richmond Hill", path:"M360 510 L548 510 548 640 360 640Z", label:[453,570] },
  { name:"Markham", path:"M548 510 L680 510 680 640 548 640Z", label:[614,570] },
  { name:"Pickering", path:"M680 510 L810 510 810 640 680 640Z", label:[745,570] },
  { name:"Ajax", path:"M810 510 L905 510 905 640 810 640Z", label:[858,570] },
  { name:"Whitby", path:"M905 510 L1010 510 1010 640 905 640Z", label:[957,570] },
  { name:"Oshawa", path:"M1010 510 L1140 510 1140 640 1010 640Z", label:[1074,570] },
];
