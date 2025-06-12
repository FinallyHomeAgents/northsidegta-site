import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import BuyersPage from "./BuyersPage";
import SellersPage from "./SellersPage";
import CommunityPage from "./CommunityPage";
import ContactPage from "./ContactPage";
import VipPage from "./vip";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/buyers" element={<BuyersPage />} />
        <Route path="/sellers" element={<SellersPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/vip" element={<VipPage />} />
      </Routes>
    </Router>
  );
}

export default App;
