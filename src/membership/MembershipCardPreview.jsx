import React, { forwardRef, useEffect, useRef, useState } from "react";
import MembershipCard from "../components/brand/MembershipCard";

const BASE_CARD_WIDTH = 420;
const BASE_CARD_HEIGHT = 260;

const MembershipCardPreview = forwardRef(({ fullName, town, memberId, cardLabel, className = "" }, ref) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateScale = () => {
      const availableWidth = node.clientWidth;
      const nextScale = Math.min(1, availableWidth / BASE_CARD_WIDTH);
      setScale(nextScale || 1);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-black/30 rounded-3xl p-4 sm:p-5 shadow-inner shadow-black/30 w-full max-w-2xl flex justify-center ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full flex justify-center"
        style={{ minHeight: BASE_CARD_HEIGHT * scale }}
      >
        <MembershipCard
          className="drop-shadow-2xl membership-card--fixed"
          fullName={fullName}
          town={town}
          memberId={memberId}
          cardLabel={cardLabel}
          style={{
            width: BASE_CARD_WIDTH,
            height: BASE_CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        />
      </div>
    </div>
  );
});

export default MembershipCardPreview;
