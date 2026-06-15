import React, { useEffect } from "react";
import { TownMatchQuiz } from "../../BuyersPage";

export default function TownMatchModal({ isOpen, onClose, onComplete }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="town-match-modal" role="presentation" onMouseDown={onClose}>
      <div
        className="town-match-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="town-match-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="town-match-modal__close" type="button" aria-label="Close Town Match quiz" onClick={onClose}>×</button>
        <p className="town-match-modal__eyebrow">Town Match Quiz</p>
        <h2 id="town-match-modal-title">Find your NorthSide town fit.</h2>
        <TownMatchQuiz variant="modal" onComplete={onComplete} />
        <a className="town-match-modal__buyers-link" href="/buyers">Visit the buyers guide for more detail →</a>
      </div>
    </div>
  );
}
