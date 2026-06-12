import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  usePermissions,
  fetcher as fetchMyPermissions,
  MY_PERMISSIONS_KEY,
} from "../../hooks/usePermissions";
import { fetcher as fetchUsers, USERS_KEY } from "../../hooks/useUsers";
import { fetcher as fetchRoles, ROLES_KEY } from "../../hooks/useRoles";
import { fetcher as fetchPermissionsList, PERMISSIONS_KEY } from "../../hooks/usePermissionsList";
import {
  fetcher as fetchRolePermissions,
  ROLE_PERMISSIONS_KEY,
} from "../../hooks/useRolePermissions";
import { fetcher as fetchLeads, LEADS_KEY } from "../../hooks/useLeads";
import { fetcher as fetchBitacora, bitacoraKey } from "../../hooks/useBitacora";
import { preload, STORAGE_KEY as SWR_STORAGE_KEY } from "../../lib/swrCache";
import { PERMISSIONS } from "../../lib/permissions";
import { Icon } from "@iconify/react";
import LogoLink from "../LogoLink";
import SwrCacheProvider from "./SwrCacheProvider";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: string;
  permission?: string;
  preload?: () => void;
}[] = [
  { href: "/crm", label: "Home", icon: "solar:home-2-linear" },
  {
    href: "/crm/leads",
    label: "Leads",
    icon: "solar:users-group-rounded-linear",
    preload: () => preload(LEADS_KEY, fetchLeads),
  },
  {
    href: "/crm/bitacora",
    label: "Bitácora",
    icon: "solar:notebook-linear",
    preload: () => preload(bitacoraKey("galvez1519"), () => fetchBitacora("galvez1519")),
  },
  {
    href: "/crm/users",
    label: "Usuarios",
    icon: "solar:users-group-two-rounded-linear",
    permission: PERMISSIONS.VIEW_USERS,
    preload: () => {
      preload(USERS_KEY, fetchUsers);
      preload(ROLES_KEY, fetchRoles);
      preload(MY_PERMISSIONS_KEY, fetchMyPermissions);
    },
  },
  {
    href: "/crm/roles",
    label: "Roles",
    icon: "solar:shield-keyhole-linear",
    permission: PERMISSIONS.VIEW_ROLES,
    preload: () => {
      preload(ROLES_KEY, fetchRoles);
      preload(PERMISSIONS_KEY, fetchPermissionsList);
      preload(ROLE_PERMISSIONS_KEY, fetchRolePermissions);
      preload(MY_PERMISSIONS_KEY, fetchMyPermissions);
    },
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CrmSidebarProps {
  activePath: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrmSidebar(props: CrmSidebarProps) {
  return (
    <SwrCacheProvider>
      <CrmSidebarInner {...props} />
    </SwrCacheProvider>
  );
}

function CrmSidebarInner({ activePath }: CrmSidebarProps) {
  const [open, setOpen] = useState(false);
  const { data: permissions } = usePermissions();
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || (permissions ?? []).includes(item.permission),
  );

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Redirect to login if there's no active session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = "/crm/login";
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) window.location.href = "/crm/login";
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // `scope: "local"` still makes a server call to revoke the session;
      // if that call is blocked (e.g. by an ad blocker), signOut() returns
      // an error without clearing local storage, leaving a stale session
      // that silently logs the user back in on /crm/login.
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore — fall through to the manual cleanup below
    }
    try {
      const ref = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname.split(".")[0];
      localStorage.removeItem(`sb-${ref}-auth-token`);
      // Drop cached data (permissions, users, etc.) so a different account
      // logging in afterwards doesn't see this user's cached results.
      sessionStorage.removeItem(SWR_STORAGE_KEY);
    } catch {
      // ignore
    }
    window.location.href = "/crm/login";
  };

  const isActive = (href: string) =>
    href === "/crm" ? activePath === "/crm" || activePath === "/crm/" : activePath.startsWith(href);

  const navItem = (href: string, label: string, icon: string, onPreload?: () => void) => {
    const active = isActive(href);
    return (
      <a
        data-astro-prefetch
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        onMouseEnter={onPreload}
        onFocus={onPreload}
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
        {visibleNavItems.map(({ href, label, icon, preload }) =>
          navItem(href, label, icon, preload),
        )}
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
