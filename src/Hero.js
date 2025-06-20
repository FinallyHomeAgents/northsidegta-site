// src/Hero.js
import React from "react";

const Hero = () => {
  return (
    <picture>
      {/* Mobile image (shown by default) */}
      <source
        media="(max-width: 768px)"
        srcSet="/images/hero-mobile.jpg"
      />
      {/* Desktop image (shown if screen wider than 768px) */}
      <img
        src="/images/hero-desktop.jpg"
        alt="NorthSide GTA Map"
        className="w-full h-auto object-cover"
      />
    </picture>
  );
};

export default Hero;
