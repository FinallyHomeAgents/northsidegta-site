import React, { forwardRef, useEffect, useRef, useState } from "react";
import MembershipCard from "../components/brand/MembershipCard";

const BASE_CARD_WIDTH = 420;
const BASE_CARD_HEIGHT = 265;

const MembershipCardPreview = forwardRef(({ fullName, town, memberId, cardLabel, className = "" }, ref) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateScale = () => setScale(Math.min(1, (node.clientWidth || BASE_CARD_WIDTH) / BASE_CARD_WIDTH));

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className={`w-full max-w-2xl ${className}`} data-card-preview="northside-pass">
      <div className="bg-black/30 rounded-3xl p-4 sm:p-5 shadow-inner shadow-black/30">
        <div
          ref={containerRef}
          className="relative w-full max-w-[520px] mx-auto aspect-[420/265] flex items-center justify-center"
        >
          <MembershipCard
            ref={ref}
            className="drop-shadow-2xl membership-card--fluid"
            fullName={fullName}
            town={town}
            memberId={memberId}
            cardLabel={cardLabel}
            style={{
              width: BASE_CARD_WIDTH,
              height: BASE_CARD_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default MembershipCardPreview;
