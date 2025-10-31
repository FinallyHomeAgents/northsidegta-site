import React, { useEffect } from "react";

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[min(1100px,92vw)] max-h-[90vh] overflow-auto rounded-2xl bg-neutral-900 shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/20 px-3 py-1 text-white/90 text-sm hover:bg-white/10"
          aria-label="Close"
        >
          Close
        </button>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
