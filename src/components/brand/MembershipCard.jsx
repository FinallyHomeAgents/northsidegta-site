import React from "react";
import classNames from "classnames";
import "./membership-card.css";

const sanitizeValue = (value, maxLength) => {
  const safeValue = (value ?? "").toString();
  return safeValue.length > maxLength ? safeValue.slice(0, maxLength) : safeValue;
};

const MembershipCard = ({ fullName, town, memberId, className }) => {
  const trimmedName = sanitizeValue(fullName, 26);
  const trimmedTown = sanitizeValue(town, 28);
  const trimmedMemberId = sanitizeValue(memberId, 12);
  const memberIdDisplay = trimmedMemberId ? trimmedMemberId : "Pending";

  return (
    <div className={classNames("membership-card", className)}>
      <div className="holo-bar" aria-hidden="true" />
      <div className="card-noise" aria-hidden="true" />
      <div className="metal-rim" aria-hidden="true" />
      <div className="card-gloss" aria-hidden="true" />
      <div className="micro-strip" aria-hidden="true">
        NORTHSIDE GTA • FINALLY HOME AGENTS • SINCE 2025 •
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
        <img src="/brand/membership-chip.svg" alt="Metallic chip" className="membership-chip" />
      </div>

      <div className="member-details">
        <div className="member-name-town">
          <div className="member-title">Founding Member</div>
          <div className="member-name" title={trimmedName}>
            {trimmedName}
          </div>
          <div className="member-town" title={trimmedTown}>
            {trimmedTown}
          </div>
        </div>
        <div className="member-id" title={memberIdDisplay}>
          Member ID: {memberIdDisplay}
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
