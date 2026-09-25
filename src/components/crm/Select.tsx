import { forwardRef, type CSSProperties, type SelectHTMLAttributes } from "react";

// Chevron as a background-image so the arrow needs no extra DOM node —
// `appearance-none` drops the native one and this draws it back via CSS.
const chevronStyle: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239e9890' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "10px",
};

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", style, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`cursor-pointer appearance-none ${className}`}
        style={{ ...chevronStyle, ...style }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export default Select;
