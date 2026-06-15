import React, { useEffect, useRef } from "react";
import { TownMatchQuiz } from "../../BuyersPage";

const FOCUSABLE_SELECTOR = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export default function TownMatchModal({ isOpen, onClose, onComplete }) {
  const closeButtonRef = useRef(null);
  const modalPanelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        modalPanelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="town-match-modal" role="presentation" onMouseDown={onClose}>
      <div
        ref={modalPanelRef}
        className="town-match-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="town-match-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button ref={closeButtonRef} className="town-match-modal__close" type="button" aria-label="Close Town Match quiz" onClick={onClose}>×</button>
        <p className="town-match-modal__eyebrow">Town Match Quiz</p>
        <h2 id="town-match-modal-title">Find your NorthSide town fit.</h2>
        <TownMatchQuiz variant="modal" onComplete={onComplete} />
        <a className="town-match-modal__buyers-link" href="/buyers">Visit the buyers guide for more detail →</a>
      </div>
    </div>
  );
}
