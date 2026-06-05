// src/Navigation.js
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/buyers", label: "Buyers" },
  { to: "/sellers", label: "Sellers" },
  { to: "/insights", label: "Insights" },
  { to: "/media", label: "Videos + Reels" },
  { to: "/contact", label: "Contact" },
];

const COMMUNITIES_ITEMS = [
  { to: "/tastehub", label: "NorthSide TasteHub™" },
  { to: "/community", label: "NorthSide Events Guide" },
  { to: "/communities/uxbridge", label: "Uxbridge", icon: "/Images/towns/uxbridge.jpg" },
  { to: "/communities/georgina", label: "Georgina", icon: "/Images/towns/georgina.jpg" },
  { to: "/communities/stouffville", label: "Stouffville", icon: "/Images/towns/stouffville.jpg" },
  { to: "/communities/east-gwillimbury", label: "East Gwillimbury", icon: "/Images/towns/east-gwillimbury.jpg" },
  { to: "/communities/newmarket", label: "Newmarket", icon: "/Images/towns/newmarket.jpg" },
  { to: "/communities/aurora", label: "Aurora", icon: "/Images/towns/aurora.jpg" },
  { to: "/communities/scugog", label: "Scugog", icon: "/Images/towns/scugog.jpg" },
];

const isCommunityPath = (pathname) => (
  pathname === "/communities" ||
  pathname.startsWith("/communities/") ||
  pathname === "/community" ||
  pathname.startsWith("/community/") ||
  pathname === "/tastehub" ||
  pathname.startsWith("/tastehub/")
);

const navLinkClass = ({ isActive }) => `
  relative inline-flex items-center rounded-full px-1.5 py-2 text-[13px] font-semibold tracking-[0.01em]
  transition duration-150 hover:bg-emerald-50 hover:text-brand-green focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-4 focus-visible:outline-brand-green/70
  after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-[2px] after:origin-left after:rounded-full after:bg-brand-green
  after:transition-transform after:duration-150 ${isActive ? "text-brand-green after:scale-x-100" : "text-slate-700 after:scale-x-0 hover:after:scale-x-100"}
`;

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [mobileCommunitiesOpen, setMobileCommunitiesOpen] = useState(false);
  const communitiesWrapperRef = useRef(null);
  const location = useLocation();
  const communityActive = isCommunityPath(location.pathname);

  useEffect(() => {
    setMenuOpen(false);
    setCommunitiesOpen(false);
    setMobileCommunitiesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [menuOpen]);

  const closeCommunitiesMenu = () => setCommunitiesOpen(false);
  const openCommunitiesMenu = () => setCommunitiesOpen(true);

  return (
    <div className="bg-white">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .northside-global-header * {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="northside-global-header border-b border-emerald-100/80 bg-white shadow-[0_1px_18px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2.5 rounded-2xl pr-2 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green/70 sm:gap-3"
            aria-label="NorthSide GTA home"
          >
            <img
              src="/Images/fha-badge.png"
              alt="Finally Home Agents logo"
              className="hidden h-9 w-9 flex-shrink-0 rounded-full object-contain xl:block"
              loading="eager"
              decoding="async"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[22px]">
                NorthSide GTA
              </span>
              <span className="mt-1 max-w-[180px] truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-green/80 sm:max-w-none sm:text-[11px]">
                Served by Finally Home Agents
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-end gap-1 text-slate-700 lg:flex" aria-label="Primary navigation">
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
              <NavLink
                to="/communities"
                className={() => `
                  relative inline-flex items-center gap-1.5 rounded-full px-1.5 py-2 text-[13px] font-semibold tracking-[0.01em]
                  transition duration-150 hover:bg-emerald-50 hover:text-brand-green focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-offset-4 focus-visible:outline-brand-green/70
                  after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-brand-green after:transition-transform after:duration-150
                  ${communityActive || communitiesOpen ? "bg-emerald-50 text-brand-green after:scale-x-100" : "text-slate-700 after:scale-x-0 hover:after:scale-x-100"}
                `}
                aria-haspopup="true"
                aria-expanded={communitiesOpen}
                onFocus={openCommunitiesMenu}
              >
                <span>Communities</span>
                <svg className={`h-3.5 w-3.5 transition-transform duration-150 ${communitiesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </NavLink>

              <div
                className={`absolute left-0 top-full mt-3 w-[300px] rounded-3xl border border-emerald-100 bg-white p-2.5 shadow-[0_22px_60px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.03] transition-all duration-150 ease-out ${
                  communitiesOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                }`}
              >
                <div className="px-3 pb-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Explore NorthSide</p>
                </div>
                <div className="grid gap-1">
                  {COMMUNITIES_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition duration-150 hover:bg-emerald-50 hover:text-brand-green ${
                        isActive ? "bg-emerald-50 text-brand-green" : "text-slate-700"
                      }`}
                      onClick={closeCommunitiesMenu}
                    >
                      {item.icon ? (
                        <img src={item.icon} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-1 ring-emerald-100" loading="lazy" />
                      ) : (
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs text-brand-green ring-1 ring-emerald-100">NS</span>
                      )}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/contact"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-brand-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(50,97,14,0.22)] transition duration-150 hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-[0_14px_28px_rgba(50,97,14,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green/70"
            >
              Let’s Talk
            </Link>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green/70 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`fixed inset-x-0 top-[72px] z-50 max-h-[calc(100vh-72px)] overflow-y-auto border-b border-emerald-100 bg-white px-4 pb-6 pt-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] transition duration-200 ease-out lg:hidden ${
          menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <nav className="mx-auto grid max-w-2xl gap-2" aria-label="Mobile navigation">
          <button
            type="button"
            className={`flex min-h-12 w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-base font-semibold transition duration-150 ${
              communityActive || mobileCommunitiesOpen ? "bg-emerald-50 text-brand-green" : "text-slate-800 hover:bg-emerald-50 hover:text-brand-green"
            }`}
            onClick={() => setMobileCommunitiesOpen((open) => !open)}
            aria-expanded={mobileCommunitiesOpen}
          >
            <span>Communities</span>
            <svg className={`h-4 w-4 transition-transform duration-150 ${mobileCommunitiesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {mobileCommunitiesOpen && (
            <div className="grid gap-1 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-2">
              {COMMUNITIES_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition duration-150 ${
                    isActive ? "bg-white text-brand-green shadow-sm" : "text-slate-700 hover:bg-white hover:text-brand-green"
                  }`}
                >
                  {item.icon ? (
                    <img src={item.icon} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-1 ring-emerald-100" loading="lazy" />
                  ) : (
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs text-brand-green ring-1 ring-emerald-100">NS</span>
                  )}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `flex min-h-12 items-center rounded-2xl px-4 py-3 text-base font-semibold transition duration-150 ${
                isActive ? "bg-emerald-50 text-brand-green" : "text-slate-800 hover:bg-emerald-50 hover:text-brand-green"
              }`}
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/contact"
            className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-green px-5 py-3 text-base font-semibold text-white shadow-[0_12px_26px_rgba(50,97,14,0.24)] transition duration-150 hover:bg-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green/70"
          >
            Let’s Talk
          </Link>
        </nav>
      </div>
    </div>
  );
}
