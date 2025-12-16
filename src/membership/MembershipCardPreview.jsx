import React, { forwardRef } from "react";
import MembershipCard from "../components/brand/MembershipCard";

const MembershipCardPreview = forwardRef(({ fullName, town, memberId, cardLabel, className = "" }, ref) => (
  <div
    ref={ref}
    className={`bg-black/30 rounded-3xl p-4 sm:p-6 shadow-inner shadow-black/30 w-full max-w-lg flex justify-center ${className}`}
  >
    <MembershipCard
      className="scale-[1.02] sm:scale-[1.08] drop-shadow-2xl"
      fullName={fullName}
      town={town}
      memberId={memberId}
      cardLabel={cardLabel}
    />
  </div>
));

export default MembershipCardPreview;
