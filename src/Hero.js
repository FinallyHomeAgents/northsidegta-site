// src/Hero.js
import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <picture>
      {/* Mobile image (used when screen width is 768 px or less) */}
      <source
        media="(max-width: 768px)"
        srcSet="/Images/hero-mobile.jpg"
      />

      {/* Desktop / default image */}
      <img
        src="/Images/hero-desktop.jpg"
        alt="NorthSide GTA Map"
        className="w-full h-auto object-cover"
      />
    </picture>
  );
}
