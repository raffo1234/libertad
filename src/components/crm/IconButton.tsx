import { Icon } from "@iconify/react";

// ─── Variants ─────────────────────────────────────────────────────────────────

const VARIANTS = {
  default: "hover:border-[#c9a96e]/40 hover:text-[#a07d4a]",
  danger: "hover:border-[#c08878]/40 hover:text-[#a06658]",
} as const;

type Variant = keyof typeof VARIANTS;

// ─── Props ────────────────────────────────────────────────────────────────────

interface IconButtonProps {
  icon: string;
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  variant?: Variant;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IconButton({
  icon,
  onClick,
  title,
  variant = "default",
  disabled,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-full border border-[#e8e3db] bg-white p-2 text-[#b5b0a8] transition-colors ${VARIANTS[variant]} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon icon={icon} className="h-4 w-4" />
    </button>
  );
}
