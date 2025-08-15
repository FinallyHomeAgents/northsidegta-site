// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage         from "./HomePage";
import AboutPage        from "./AboutPage";
import BuyersPage       from "./BuyersPage";
import SellersPage      from "./SellersPage";
import CommunityPage    from "./CommunityPage";
import ContactPage      from "./ContactPage";
import VipPage          from "./vip";               // ← matches vip.js
import SignWithUsPage   from "./SignWithUsPage";    // “Sign with Us” page
import HomeAnalysisPage from "./HomeAnalysisPage";  // Formspree-powered page

function App() {
  // Global mobile-map "resize nudge" — runs once app mounts.
  // Works when your map component saves its instance to:
  //   Leaflet: window.__leafletMap
  //   Mapbox:  window.__mapboxRef
  //   Google:   window.__gmap
  useEffect(() => {
    const nudge = () => {
      // Leaflet
      if (window.__leafletMap?.invalidateSize) {
        window.__leafletMap.invalidateSize();
      }
      // Mapbox GL / react-map-gl
      if (window.__mapboxRef?.resize) {
        window.__mapboxRef.resize();
      }
      // Google Maps JS API
      if (window.google && window.__gmap) {
        window.google.maps.event.trigger(window.__gmap, "resize");
      }
    };

    // Nudge after load, on rotate, and on resize
    window.addEventListener("load", nudge, { once: true });
    window.addEventListener("orientationchange", nudge);
    window.addEventListener("resize", nudge);

    // Extra nudge shortly after mount (helps slow phones)
    const t = setTimeout(nudge, 200);

    return () => {
      window.removeEventListener("orientationchange", nudge);
      window.removeEventListener("resize", nudge);
      clearTimeout(t);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/about"         element={<AboutPage />} />
        <Route path="/buyers"        element={<BuyersPage />} />
        <Route path="/sellers"       element={<SellersPage />} />
        <Route path="/community"     element={<CommunityPage />} />
        <Route path="/contact"       element={<ContactPage />} />
        <Route path="/vip"           element={<VipPage />} />
        <Route path="/sign"          element={<SignWithUsPage />} />
        <Route path="/homeanalysis"  element={<HomeAnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
