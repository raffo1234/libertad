import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const modal = (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Click outside to close */}
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="flex min-h-full items-center justify-center px-4 py-5"
      >
        <div
          className={`w-full max-w-lg border border-[#e8e3db] bg-[#faf8f5] shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e8e3db] px-6 py-4">
            <h2
              className="font-tan-pearl text-lg font-normal text-[#1c1a16]"
              style={{ letterSpacing: "-0.015em" }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-[#b5b0a8] transition-colors hover:bg-[#f0ede8] hover:text-[#1c1a16]"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
