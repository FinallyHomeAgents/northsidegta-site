// src/Navigation.js
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const communitiesWrapperRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/buyers", label: "Buyers" },
    { to: "/sellers", label: "Sellers" },
    { to: "/insights", label: "Insights" },
    { to: "/media", label: "Videos + Reels" },
    { to: "/contact", label: "Contact" },
  ];

  const communitiesItems = [
    { to: "/tastehub", label: "NorthSide TasteHub™", badge: "NEW" },
    { to: "/community", label: "NorthSide Events Guide" },
    { divider: true },
    { to: "/communities/uxbridge", label: "Uxbridge" },
    { to: "/communities/georgina", label: "Georgina" },
    { to: "/communities/stouffville", label: "Stouffville" },
    { to: "/communities/east-gwillimbury", label: "East Gwillimbury" },
    { to: "/communities/newmarket", label: "Newmarket" },
    { to: "/communities/aurora", label: "Aurora" },
    { to: "/communities/scugog", label: "Scugog" },
  ];

  const [communitiesOpen, setCommunitiesOpen] = useState(false);

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

  const closeCommunitiesMenu = () => setCommunitiesOpen(false);
  const openCommunitiesMenu = () => setCommunitiesOpen(true);

  return (
    <>
      <style>{`
        @keyframes btnLift {
          0% { transform: translateY(0); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
          100% { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(0,0,0,0.12); }
        }

        @keyframes taglineFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-taglineFadeUp {
          animation: taglineFadeUp 0.6s ease-out 0.6s both;
        }

        .header-purpose-line {
          background-image: linear-gradient(90deg, #32610E 0%, #22440A 100%);
          background-size: 0% 2px;
          background-repeat: no-repeat;
          background-position: left bottom;
          transition: background-size 0.3s ease-in-out;
        }

        .header-purpose-line:hover {
          background-size: 100% 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-taglineFadeUp {
            animation: none;
          }

          .header-purpose-line {
            transition: none;
          }
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            {/* Brand (badge only) */}
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition flex-shrink-0"
              aria-label="NorthSide GTA - Home"
            >
              <img
                src="/Images/newtoolbar.png"
                alt="NorthSide GTA navigation badge"
                className="h-10 sm:h-12 w-auto flex-shrink-0"
                loading="eager"
                decoding="async"
              />
            </Link>

            <p
              className={`hidden md:block header-purpose-line font-semibold tracking-wide text-[#32610E] leading-snug max-w-[15rem] whitespace-normal transition-all duration-300 ease-out animate-taglineFadeUp cursor-default select-none ${
                scrolled ? "text-[13px] opacity-75" : "text-sm opacity-100"
              }`}
            >
              Helping GTA buyers find their next home north of Toronto — with us.
            </p>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center justify-end text-gray-700 font-medium md:ml-8">
            <div className="flex items-center space-x-6 lg:space-x-8 mr-4">
              <div
                ref={communitiesWrapperRef}
                className="relative"
                onMouseEnter={openCommunitiesMenu}
                onMouseLeave={closeCommunitiesMenu}
                onBlur={() => {
                  setTimeout(() => {
                    const wrapper = communitiesWrapperRef.current;
                    if (wrapper && !wrapper.contains(document.activeElement)) {
                      closeCommunitiesMenu();
                    }
                  }, 50);
                }}
              >
                <button
                  type="button"
                  className="
                    relative text-[15px] tracking-wide
                    transition duration-200
                    hover:text-brand-green
                    after:content-[''] after:absolute after:-bottom-1 after:left-0
                    after:w-0 after:h-[2px] after:bg-brand-green after:transition-all after:duration-200
                    hover:after:w-full
                  "
                  aria-haspopup="true"
                  aria-expanded={communitiesOpen}
                  onFocus={openCommunitiesMenu}
                  onClick={() => setCommunitiesOpen((prev) => !prev)}
                >
                  Communities
                </button>

                <div
                  className={`
                    absolute right-0 mt-3 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl
                    transition-all duration-200 ease-out
                    ${communitiesOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1"}
                  `}
                >
                  <div className="space-y-1">
                    {communitiesItems.map((item, idx) => {
                      if (item.divider) {
                        return <div key={`divider-${idx}`} className="my-2 border-t border-slate-100" aria-hidden />;
                      }

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="
                            flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[15px]
                            text-slate-700 transition hover:bg-emerald-50 hover:text-brand-green
                          "
                          onClick={closeCommunitiesMenu}
                        >
                          <span className="leading-tight">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="
                    relative text-[15px] tracking-wide
                    transition duration-200
                    hover:text-brand-green
                    after:content-[''] after:absolute after:-bottom-1 after:left-0
                    after:w-0 after:h-[2px] after:bg-brand-green after:transition-all after:duration-200
                    hover:after:w-full
                  "
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Let’s Talk button */}
            <Link
              to="/contact"
              className="
                ml-2 inline-flex items-center
                rounded-lg bg-brand-green px-4 py-2
                text-white font-semibold shadow-sm
                transition
                hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)]
                hover:-translate-y-[1px]
                hover:shadow-md
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2
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
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={toggleMenu} className="block text-[15px] leading-tight">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  onClick={toggleMenu}
                  className="block rounded-md bg-brand-green px-4 py-2 text-center text-white transition hover:bg-[linear-gradient(90deg,#32610E_0%,#22440A_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2"
                >
                  Let’s&nbsp;Talk
                </Link>
              </li>
            </ul>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Communities</p>
              <ul className="space-y-2">
                {communitiesItems.map((item, idx) => {
                  if (item.divider) {
                    return <li key={`divider-${idx}`} className="border-t border-slate-100 pt-2" aria-hidden />;
                  }

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={toggleMenu}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-[15px] leading-tight hover:bg-emerald-50 hover:text-brand-green"
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
