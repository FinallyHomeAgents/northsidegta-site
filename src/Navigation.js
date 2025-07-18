// src/Navigation.js
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleMenu = () => {
    if (menuOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setMenuOpen(false);
        setIsAnimating(false);
      }, 300);
    } else {
      setMenuOpen(true);
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Brand */}
        <Link to="/" className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 hover:opacity-90 transition">
          <span className="text-xl sm:text-2xl font-extrabold text-green-700 tracking-tight leading-none">
            NorthSide&nbsp;GTA
          </span>

          {/* mobile tagline */}
          <span className="block sm:hidden text-[11px] text-gray-600 font-medium leading-tight mt-0.5">
            Powered&nbsp;by&nbsp;Finally&nbsp;Home&nbsp;Agents
          </span>

          {/* desktop tagline */}
          <span className="hidden sm:inline text-gray-400">•</span>
          <span className="hidden sm:inline text-xs sm:text-sm text-gray-600 font-medium">
            Powered&nbsp;by&nbsp;<span className="font-semibold text-green-700">Finally&nbsp;Home&nbsp;Agents</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8 items-center text-gray-700 font-medium">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/buyers">Buyers</Link>
          <Link to="/sellers">Sellers</Link>
          <Link to="/community">Community</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/vip">VIP</Link>

          {/* Let’s Talk button as Link */}
          <Link
            to="/contact"
            className="ml-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Let’s&nbsp;Talk
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {(menuOpen || isAnimating) && (
        <div className={`md:hidden px-4 pb-4 ${isAnimating ? "animate-slideUp" : "animate-slideDown"}`}>
          <ul className="space-y-4 text-gray-700 font-medium">
            <li><Link to="/"          onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/about"     onClick={toggleMenu}>About</Link></li>
            <li><Link to="/buyers"    onClick={toggleMenu}>Buyers</Link></li>
            <li><Link to="/sellers"   onClick={toggleMenu}>Sellers</Link></li>
            <li><Link to="/community" onClick={toggleMenu}>Community</Link></li>
            <li><Link to="/contact"   onClick={toggleMenu}>Contact</Link></li>
            <li><Link to="/vip"       onClick={toggleMenu}>VIP</Link></li>
            <li>
              {/* Let’s Talk button as Link */}
              <Link
                to="/contact"
                onClick={toggleMenu}
                className="block bg-green-700 text-white text-center px-4 py-2 rounded-md hover:bg-green-800 transition"
              >
                Let’s&nbsp;Talk
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
