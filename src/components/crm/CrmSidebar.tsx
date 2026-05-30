import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Icon } from "@iconify/react";
import LogoLink from "../LogoLink";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/crm", label: "Home", icon: "solar:home-2-linear" },
  { href: "/crm/leads", label: "Leads", icon: "solar:users-group-rounded-linear" },
  { href: "/crm/bitacora", label: "Bitácora", icon: "solar:notebook-linear" },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CrmSidebarProps {
  activePath: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrmSidebar({ activePath }: CrmSidebarProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) =>
    href === "/crm" ? activePath === "/crm" || activePath === "/crm/" : activePath.startsWith(href);

  const navItem = (href: string, label: string, icon: string) => {
    const active = isActive(href);
    return (
      <a
        data-astro-prefetch
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
          active
            ? "border-l-2 border-[#1c1a16] bg-[#f0ede8] pl-[10px] font-medium text-[#1c1a16]"
            : "border-l-2 border-transparent pl-[10px] text-[#9e9890] hover:bg-[#f0ede8] hover:text-[#1c1a16]"
        }`}
      >
        <Icon
          icon={icon}
          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
            active ? "text-[#1c1a16]" : "text-[#c2bdb6] group-hover:text-[#6b665e]"
          }`}
        />
        <span className="font-manrope">{label}</span>
      </a>
    );
  };

  const content = (
    <aside className="flex h-full w-full flex-col bg-white px-4 py-6 lg:shadow-[1px_0_0_#ede9e3]">
      {/* Logo + close (mobile) */}
      <div className="mb-8 flex items-center justify-between">
        <LogoLink />
        <button
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b5b0a8] transition-colors hover:bg-[#f0ede8] hover:text-[#1c1a16] lg:hidden"
          aria-label="Close menu"
        >
          <svg
            width="16"
            height="16"
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

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon }) => navItem(href, label, icon))}
      </nav>

      {/* Divider */}
      <div className="my-4 h-px bg-[#ede9e3]" />

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="group flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 pl-[10px] text-sm text-[#9e9890] transition-all duration-150 hover:bg-[#f3e8e6] hover:text-[#a06658]"
      >
        <Icon
          icon="solar:logout-2-linear"
          className="h-[18px] w-[18px] shrink-0 text-[#c2bdb6] transition-colors group-hover:text-[#c08878]"
        />
        <span className="font-manrope">Sign out</span>
      </button>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden h-screen w-[240px] shrink-0 lg:block">{content}</div>

      {/* Mobile topbar */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center border-b border-[#e8e3db] bg-white px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9e9890] transition-colors hover:bg-[#f0ede8] hover:text-[#1c1a16]"
          aria-label="Open menu"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="ml-3">
          <LogoLink />
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
}
