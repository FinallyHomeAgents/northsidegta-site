import React from "react";
import classNames from "classnames";
import "./membership-card.css";

const MembershipCard = ({ fullName, town, memberId, className }) => {
  const memberLabel = memberId ? `Member ID: ${memberId}` : "Member ID: Pending";

  return (
    <div className={classNames("membership-card", className)}>
      <div className="membership-card__overlay" aria-hidden="true" />

      <div className="membership-card__header">
        <img
          src="/brand/northsidegta-card-logo.png"
          alt="NorthSide GTA"
          className="membership-card__logo"
          loading="lazy"
        />
        <img
          src="/brand/finally-home-agents-card-logo.png"
          alt="Finally Home Agents"
          className="membership-card__logo membership-card__logo--right"
          loading="lazy"
        />
      </div>

      <div className="membership-card__chip" aria-hidden="true">
        <div className="membership-card__chip-line" />
        <div className="membership-card__chip-line" />
        <div className="membership-card__chip-line" />
        <div className="membership-card__chip-line" />
      </div>

      <div className="membership-card__details">
        <div className="membership-card__text">
          <div className="membership-card__name">{fullName}</div>
          <div className="membership-card__town">{town}</div>
        </div>
        <div className="membership-card__member">{memberLabel}</div>
      </div>
    </div>
  );
};

export default MembershipCard;
