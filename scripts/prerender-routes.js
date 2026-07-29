#!/usr/bin/env node

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

require.extensions[".css"] = () => {};
require.extensions[".svg"] = () => {};
require("@babel/register")({
  extensions: [".js", ".jsx"],
  presets: ["react-app"],
  ignore: [/node_modules/],
});

const fs = require("fs");
const path = require("path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { MemoryRouter } = require("react-router-dom");
const { HelmetProvider } = require("react-helmet-async");
const { parse } = require("node-html-parser");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");

const routeModules = {
  "/about": "../src/AboutPage",
  "/buyers": "../src/BuyersPage",
  "/moving-to-georgina-from-toronto": "../src/MovingToGeorginaFromTorontoPage",
  "/moving-to-east-gwillimbury-from-toronto": "../src/MovingToEastGwillimburyFromTorontoPage",
  "/moving-to-uxbridge-from-toronto": "../src/MovingToUxbridgeFromTorontoPage",
  "/sellers": "../src/SellersPage",
  "/homeanalysis": "../src/HomeAnalysisPage",
  "/media": "../src/MediaPage",
  "/contact": "../src/ContactPage",
  "/insights": "../src/InsightsPage",
  "/tastehub": "../src/TasteHubPage",
  "/community": "../src/CommunityPage",
  "/neighbourhood-guide": "../src/NeighbourhoodGuidePage",
  "/communities": "../src/CommunitiesPage",
  "/communities/georgina": "../src/GeorginaPage",
  "/communities/east-gwillimbury": "../src/EastGwillimburyPage",
  "/communities/newmarket": "../src/NewmarketPage",
  "/communities/aurora": "../src/AuroraPage",
  "/communities/stouffville": "../src/StouffvillePage",
  "/communities/uxbridge": "../src/UxbridgePage",
  "/communities/scugog": "../src/ScugogPage",
};

function renderRoute(route, modulePath) {
  const routeUrl = `https://northsidegta.ca${route}`;
  global.window = {
    location: { href: routeUrl, origin: "https://northsidegta.ca", pathname: route, search: "", hash: "" },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  };
  global.document = { referrer: "", body: { style: {} } };

  const Component = require(modulePath).default;
  if (!Component) throw new Error(`No default component export from ${modulePath}`);

  return renderToStaticMarkup(
    React.createElement(
      HelmetProvider,
      null,
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(Component)
      )
    )
  );
}

function injectRoute(route, markup) {
  const outputPath = path.join(buildDir, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Missing generated route file: ${path.relative(rootDir, outputPath)}`);
  }

  const doc = parse(fs.readFileSync(outputPath, "utf8"), { comment: true });
  const root = doc.querySelector("#root");
  if (!root) throw new Error(`${route} is missing #root`);
  root.set_content(markup);

  let html = doc.toString();
  if (!/^<!DOCTYPE html>/i.test(html)) html = `<!DOCTYPE html>\n${html}`;
  fs.writeFileSync(outputPath, html, "utf8");
}

function main() {
  const failures = [];
  let rendered = 0;

  for (const [route, modulePath] of Object.entries(routeModules)) {
    try {
      injectRoute(route, renderRoute(route, modulePath));
      rendered += 1;
    } catch (error) {
      failures.push(`${route}: ${error.stack || error.message}`);
    }
  }

  if (failures.length) {
    failures.forEach((failure) => console.error(`[prerender-routes] ${failure}`));
    process.exit(1);
  }

  console.log(`[prerender-routes] Server-rendered full HTML for ${rendered} routes`);
}

main();
