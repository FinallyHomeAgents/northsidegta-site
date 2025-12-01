import React from "react";
import classNames from "classnames";
import "./membership-card.css";

const MetallicChip = () => (
  <svg width="42" height="30" viewBox="0 0 42 30" aria-hidden="true">
    <defs>
      <linearGradient id="chipMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5f5f5" />
        <stop offset="25%" stopColor="#dcdcdc" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="75%" stopColor="#b8b8b8" />
        <stop offset="100%" stopColor="#e7e7e7" />
      </linearGradient>
    </defs>
    <rect width="42" height="30" rx="5" fill="url(#chipMetal)" stroke="#ffffff55" strokeWidth="1.2" />
    <rect x="10" y="6" width="22" height="18" rx="3" fill="#ffffff22" />
  </svg>
);

const MembershipCard = ({ fullName, town, memberId, className }) => {
  const memberIdDisplay = memberId ? memberId : "Pending";

  return (
    <div className={classNames("membership-card", className)}>
      <div className="holo-bar" aria-hidden="true" />
      <div className="card-gloss" aria-hidden="true" />
      <div className="micro-strip" aria-hidden="true">
        NORTHSIDE GTA • FINALLY HOME AGENTS • NORTHSIDE GTA • FINALLY HOME AGENTS •
      </div>
      <div className="est-badge" aria-hidden="true">EST. 2025</div>

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

      <div className="card-chip" aria-hidden="true">
        <MetallicChip />
      </div>

      <div className="member-details">
        <div className="member-name-town">
          <div className="member-title">Founding Member</div>
          <div className="member-name">{fullName}</div>
          <div className="member-town">{town}</div>
        </div>
        <div className="member-id">Member ID: {memberIdDisplay}</div>
      </div>
    </div>
  );
};

export default MembershipCard;
