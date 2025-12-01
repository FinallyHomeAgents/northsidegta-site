import React from "react";
import classNames from "classnames";
import "./membership-card.css";

const MembershipCard = ({ fullName, town, memberId, className }) => {
  const memberIdDisplay = memberId ? memberId : "Pending";

  return (
    <div className={classNames("membership-card", className)}>
      <div className="logo-row">
        <img
          src="/brand/northsidegta-card-logo.png"
          alt="NorthSide GTA"
          className="logo-left"
          loading="lazy"
        />
        <img
          src="/brand/finally-home-agents-card-logo.png"
          alt="Finally Home Agents"
          className="logo-right"
          loading="lazy"
        />
      </div>

      <div className="card-chip" aria-hidden="true" />

      <div className="member-details">
        <div className="member-name-town">
          <div className="member-name">{fullName}</div>
          <div className="member-town">{town}</div>
        </div>
        <div className="member-id">Member ID: {memberIdDisplay}</div>
      </div>
    </div>
  );
};

export default MembershipCard;
