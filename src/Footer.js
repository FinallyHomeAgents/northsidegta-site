// src/Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 py-6">
      © 2025 NorthSide GTA | Finally Home Agents
      {' '}
      <span aria-hidden="true">•</span>
      {' '}
      <a
        href="/events/archive"
        className="font-medium text-emerald-600 hover:text-emerald-700"
      >
        Past Events Archive
      </a>
    </footer>
  );
}
