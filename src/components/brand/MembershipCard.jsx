import React, { useLayoutEffect, useRef } from "react";
import classNames from "classnames";
import "./membership-card.css";

const sanitizeValue = (value, maxLength) => {
  const safeValue = (value ?? "").toString().trim();
  return safeValue.length > maxLength ? safeValue.slice(0, maxLength) : safeValue;
};

const fitTextToWidth = (ref, { max, min }) => {
  if (!ref.current) return min;

  let fontSize = max;
  const el = ref.current;
  el.style.fontSize = `${fontSize}px`;

  while (el.scrollWidth > el.clientWidth && fontSize > min) {
    fontSize -= 1;
    el.style.fontSize = `${fontSize}px`;
  }

  if (el.scrollWidth > el.clientWidth) {
    el.style.textOverflow = "ellipsis";
  } else {
    el.style.textOverflow = "clip";
  }

  return fontSize;
};

const MembershipCard = ({ fullName, town, memberId, cardLabel, className, activated }) => {
  const trimmedName = sanitizeValue(fullName, 80);
  const trimmedTown = sanitizeValue(town, 64);
  const trimmedMemberId = sanitizeValue(memberId, 16);
  const trimmedCardLabel = sanitizeValue(cardLabel, 48) || "Founding Member";
  const memberIdDisplay = trimmedMemberId ? trimmedMemberId : "Pending";

  const nameRef = useRef(null);
  const labelRef = useRef(null);

  useLayoutEffect(() => {
    fitTextToWidth(nameRef, { max: 28, min: 16 });
  }, [trimmedName]);

  useLayoutEffect(() => {
    fitTextToWidth(labelRef, { max: 14, min: 10 });
  }, [trimmedTown]);

  return (
    <div className={classNames("membership-card", className, { "membership-card--activated": activated })}>
      <div className="holo-bar" aria-hidden="true" />
      <div className="card-noise" aria-hidden="true" />
      <div className="metal-rim" aria-hidden="true" />
      <div className="card-gloss" aria-hidden="true" />
      <div className="micro-strip" aria-hidden="true">
        NORTHSIDE GTA • FINALLY HOME AGENTS • SINCE 2025 • NORTHSIDE GTA COMMUNITY •
      </div>

      <div className="card-shell">
        <div className="logo-row">
          <img
            src="/brand/northsidegta-card-logo.png"
            alt="NorthSide GTA"
            className="card-logo logo-left"
            loading="lazy"
          />
          <img
            src="/brand/finally-home-agents-card-logo.png"
            alt="Finally Home Agents"
            className="card-logo logo-right"
            loading="lazy"
          />
        </div>

        <div className="card-body">
          <div className="card-grid">
            <div className="card-chip" aria-hidden="true">
              <svg
                className="membership-chip"
                viewBox="0 0 120 88"
                role="presentation"
                focusable="false"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="chip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f4f4f5" />
                    <stop offset="45%" stopColor="#d5d7db" />
                    <stop offset="100%" stopColor="#afb3ba" />
                  </linearGradient>
                  <linearGradient id="chip-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <rect
                  x="4"
                  y="4"
                  width="112"
                  height="80"
                  rx="12"
                  fill="url(#chip-metal)"
                  stroke="#d6d8dc"
                  strokeWidth="1.5"
                />
                <g opacity="0.9" stroke="#c1c4c9" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 30h84" />
                  <path d="M18 58h84" />
                </g>
                <rect x="30" y="18" width="60" height="52" rx="8" fill="url(#chip-sheen)" opacity="0.5" />
                <rect x="52" y="12" width="16" height="64" rx="4" fill="rgba(0,0,0,0.04)" />
                <rect x="8" y="8" width="104" height="72" rx="10" stroke="rgba(0,0,0,0.08)" strokeWidth="1" fill="none" />
              </svg>
            </div>

            <div className="member-details">
              <div className="member-title" title={trimmedCardLabel}>
                {trimmedCardLabel}
              </div>
              <div className="member-label-row" title={trimmedTown}>
                <span ref={labelRef} className="member-label">
                  {trimmedTown}
                </span>
              </div>
              <div className="member-name-row" title={trimmedName}>
                <span ref={nameRef} className="member-name">
                  {trimmedName.toUpperCase()}
                </span>
              </div>
              <div className="community-line" aria-hidden="true">
                NORTHSIDE GTA COMMUNITY MEMBER
              </div>
            </div>
          </div>

          <div className="member-meta" aria-label="Membership identifier">
            <div className="member-divider" aria-hidden="true" />
            <div className="member-id" title={memberIdDisplay}>
              MEMBER ID: {memberIdDisplay}
            </div>
            <div className="member-est" aria-hidden="true">
              EST. 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
