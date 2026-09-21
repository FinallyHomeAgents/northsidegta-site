import React from "react";

// Vector reconstruction of the existing rounded emblem, not the generated mockup.
const Emblem = () => (
  <g fill="#FAF8F0">
    <path d="M48 14C33-1 12 2 4 20C-2 33 4 42 14 52L144 181C158 195 179 192 186 177C193 163 186 153 176 143Z" />
    <path d="M119 54C98 32 102 8 126 2C150-5 179 1 185 24C190 46 188 98 185 132Z" />
    <path d="M6 61L67 123C80 139 81 157 71 173C61 192 35 197 17 187C-7 174-2 144 0 120Z" />
  </g>
);

export default function CommunitySign() {
  return (
    <svg className="northside-community-sign" viewBox="0 0 124 108" aria-hidden="true" focusable="false">
      <path d="M13 22Q62 3 111 22V87H13Z" fill="#315817" />
      <g fill="#96734F">
        <path d="M5 13h8v94H5zM111 13h8v94h-8z" />
        <rect x="3" y="9" width="12" height="4" rx="0.6" />
        <rect x="109" y="9" width="12" height="4" rx="0.6" />
      </g>
      <text className="northside-sign-welcome" x="62" y="34" textAnchor="middle" fill="#FAF8F0" fontSize="11.5" fontWeight="600" letterSpacing="0.45">WELCOME TO</text>
      <g className="northside-sign-emblem-mobile" transform="translate(34 25) scale(.29)">
        <Emblem />
      </g>
      <g className="northside-sign-emblem-desktop" transform="translate(40 41) scale(.23)">
        <Emblem />
      </g>
    </svg>
  );
}
