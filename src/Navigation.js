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
    <>
      <style>{`
        @keyframes btnLift {
          0% { transform: translateY(0); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
          100% { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(0,0,0,0.12); }
        }
      `}</style>

      <header
        className="
          sticky top-0 z-50
          bg-gradient-to-b from-white to-[#f8faf8]/60
          backdrop-blur supports-[backdrop-filter]:bg-white/85
          border-b border-emerald-100
          shadow-sm
        "
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Brand (badge only) */}
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition"
            aria-label="NorthSide GTA - Home"
          >
            <img
              src="/Images/fha-badge.png"
              alt="NorthSide GTA powered by Finally Home Agents"
              className="h-10 sm:h-12 w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8 items-center text-gray-700 font-medium">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/buyers", label: "Buyers" },
              { to: "/sellers", label: "Sellers" },
              { to: "/community", label: "Community" },
              { to: "/insights", label: "Insights" },
              { to: "/media", label: "Videos + Reels" },
              { to: "/contact", label: "Contact" },
              { to: "/vip", label: "VIP" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="
                  relative text-[15px] tracking-wide
                  transition duration-200
                  hover:text-emerald-700
                  after:content-[''] after:absolute after:-bottom-1 after:left-0
                  after:w-0 after:h-[2px] after:bg-emerald-600 after:transition-all after:duration-200
                  hover:after:w-full
                "
              >
                {l.label}
              </Link>
            ))}

            {/* Let’s Talk button */}
            <Link
              to="/contact"
              className="
                ml-2 inline-flex items-center
                rounded-lg bg-emerald-700 px-4 py-2
                text-white font-semibold shadow-sm
                transition
                hover:bg-emerald-800
                hover:-translate-y-[1px]
                hover:shadow-md
              "
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = "btnLift 200ms ease-out forwards";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
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
          <div
            className={`md:hidden px-4 pb-4 ${
              isAnimating ? "animate-slideUp" : "animate-slideDown"
            }`}
          >
            <ul className="space-y-4 text-gray-700 font-medium">
              <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
              <li><Link to="/buyers" onClick={toggleMenu}>Buyers</Link></li>
              <li><Link to="/sellers" onClick={toggleMenu}>Sellers</Link></li>
              <li><Link to="/community" onClick={toggleMenu}>Community</Link></li>
              <li><Link to="/insights" onClick={toggleMenu}>Insights</Link></li>
              <li><Link to="/media" onClick={toggleMenu}>Videos + Reels</Link></li>
              <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
              <li><Link to="/vip" onClick={toggleMenu}>VIP</Link></li>
              <li>
                <Link
                  to="/contact"
                  onClick={toggleMenu}
                  className="block bg-emerald-700 text-white text-center px-4 py-2 rounded-md hover:bg-emerald-800 transition"
                >
                  Let’s&nbsp;Talk
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
