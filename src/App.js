// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuratedPage from "./CuratedPage";
import HomePage         from "./HomePage";
import AboutPage        from "./AboutPage";
import BuyersPage       from "./BuyersPage";
import SellersPage      from "./SellersPage";
import CommunityPage    from "./CommunityPage";
import ContactPage      from "./ContactPage";
import VipPage          from "./vip";
import SignWithUsPage   from "./SignWithUsPage";
import HomeAnalysisPage from "./HomeAnalysisPage";
import TownPage         from "./TownPage";
import ThankYouPage     from "./ThankYouPage";
import EventsIndexPage  from "./community/admin/EventsIndexPage";
import EventsArchivePage from "./community/EventsArchivePage";
import EventDetailPage  from "./community/EventDetailPage";
import SubmitEventPage  from "./community/SubmitEventPage";
import InsightPage      from "./insights/InsightPage";
import MediaPage        from "./MediaPage";
import InsightsPage     from "./InsightsPage";
import ReferralPartnersPage from "./ReferralPartnersPage";
import TasteHubPage     from "./TasteHubPage";
import TasteHubSmartListPage from "./TasteHubSmartListPage";
import TasteHubCmsPage  from "./TasteHubCmsPage";
import GlobalDefaultMeta from "./components/seo/GlobalDefaultMeta";

// Load the town slugs right here (no helper to avoid any cyclic import)
import towns from "./towns.json";

function App() {
  // Global map resize nudge
  useEffect(() => {
    const nudge = () => {
      if (window.__leafletMap?.invalidateSize) window.__leafletMap.invalidateSize();
      if (window.__mapboxRef?.resize) window.__mapboxRef.resize();
      if (window.google && window.__gmap)
        window.google.maps.event.trigger(window.__gmap, "resize");
    };
    window.addEventListener("load", nudge, { once: true });
    window.addEventListener("orientationchange", nudge);
    window.addEventListener("resize", nudge);
    const t = setTimeout(nudge, 200);
    return () => {
      window.removeEventListener("orientationchange", nudge);
      window.removeEventListener("resize", nudge);
      clearTimeout(t);
    };
  }, []);

  // Normalize towns.json to an array of { slug }
  const TOWN_SLUGS = Array.isArray(towns)
    ? towns.map(t => t.slug).filter(Boolean)
    : [];

  return (
    <Router>
      <GlobalDefaultMeta />
      <Routes>
        {/* Core pages */}
        <Route path="/"             element={<HomePage />} />
        <Route path="/collections/:slug" element={<CuratedPage />} />
        <Route path="/thank-you"     element={<ThankYouPage />} />
        <Route path="/about"        element={<AboutPage />} />
        <Route path="/buyers"       element={<BuyersPage />} />
        <Route path="/sellers"      element={<SellersPage />} />
        <Route path="/community"    element={<CommunityPage />} />
        <Route path="/tastehub"     element={<TasteHubPage />} />
        <Route path="/tastehub/:slug" element={<TasteHubPage />} />
        <Route path="/tastehub/smart-list" element={<TasteHubSmartListPage />} />
        <Route path="/community/events/archive" element={<EventsArchivePage />} />
        <Route path="/community/events/:slug" element={<EventDetailPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/cms/tastehub" element={<TasteHubCmsPage />} />
        <Route path="/community/submit-event" element={<SubmitEventPage />} />
        <Route path="/events/archive" element={<EventsArchivePage />} />
        <Route path="/community/events-admin" element={<EventsIndexPage />} />
        <Route path="/contact"      element={<ContactPage />} />
        <Route path="/vip"          element={<VipPage />} />
        <Route path="/sign"         element={<SignWithUsPage />} />
        <Route path="/homeanalysis" element={<HomeAnalysisPage />} />
        <Route path="/insights"     element={<InsightsPage />} />
        <Route path="/insights/:slug" element={<InsightPage />} />
        <Route path="/media"        element={<MediaPage />} />
        <Route path="/referral-partners" element={<ReferralPartnersPage />} />

        {/* Town pages — community slugs */}
        <Route path="/communities/:slug" element={<TownPage />} />

        {/* Town pages — short URLs like /aurora */}
        {TOWN_SLUGS.sort().map(slug => (
          <Route key={slug} path={`/${slug}`} element={<TownPage />} />
        ))}

        {/* Catch-all for any slug not yet in towns.json (optional) */}
        <Route path="/:slug" element={<TownPage />} />
      </Routes>
    </Router>
  );
}

export default App;
