import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { signOut } from "../../lib/auth";
import SwrCacheProvider from "./SwrCacheProvider";
import RoleBadge from "./RoleBadge";

function UserMenuInner() {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = (user?.name ?? user?.email)?.[0]?.toUpperCase() ?? "?";

  const avatar = user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className="h-8 w-8 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1a16] text-xs font-medium text-white">
      {initial}
    </span>
  );

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-[#f0ede8]"
      >
        {avatar}
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`h-4 w-4 text-[#9e9890] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-[#e8e3db] bg-white py-2 shadow-lg">
          <div className="border-b border-[#ede9e3] px-4 py-3">
            <p className="font-manrope truncate text-sm font-medium text-[#1c1a16]">
              {user?.name ?? user?.email ?? "…"}
            </p>
            {user?.name && (
              <p className="font-manrope truncate text-xs text-[#9e9890]">{user.email}</p>
            )}
            {user?.role && (
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            )}
          </div>
          <a
            href="/crm/perfil"
            onClick={() => setOpen(false)}
            className="font-manrope flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#1c1a16] transition-colors hover:bg-[#f0ede8]"
          >
            <Icon icon="solar:user-circle-linear" className="h-4 w-4" />
            Ver perfil
          </a>
          <button
            onClick={signOut}
            className="font-manrope flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#a06658] transition-colors hover:bg-[#f3e8e6]"
          >
            <Icon icon="solar:logout-2-linear" className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function UserMenu() {
  return (
    <SwrCacheProvider>
      <UserMenuInner />
    </SwrCacheProvider>
  );
}
