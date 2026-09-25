import { useCurrentUser } from "../../hooks/useCurrentUser";
import CrmAuthGuard from "./CrmAuthGuard";
import SwrCacheProvider from "./SwrCacheProvider";
import RoleBadge from "./RoleBadge";
import { signOut } from "../../lib/auth";

export default function ProfilePage() {
  return (
    <SwrCacheProvider>
      <CrmAuthGuard>{() => <Profile />}</CrmAuthGuard>
    </SwrCacheProvider>
  );
}

function Profile() {
  const { data: user } = useCurrentUser();

  const initial = (user?.name ?? user?.email)?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 border-b border-[#e8e3db] pb-6">
        <h2
          className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Mi perfil
        </h2>
      </div>

      <div className="border border-[#e8e3db] bg-[#faf8f5] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1c1a16] text-xl font-medium text-white">
              {initial}
            </span>
          )}
          <div>
            <p className="font-manrope text-base font-medium text-[#1c1a16]">
              {user?.name ?? user?.email ?? "…"}
            </p>
            <p className="font-manrope text-sm text-[#9e9890]">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-[#ede9e3] pt-6">
          <div className="flex items-center justify-between">
            <dt className="font-mulish text-[10px] tracking-[0.2em] text-[#b5b0a8] uppercase">
              Rol
            </dt>
            <dd>{user?.role ? <RoleBadge role={user.role} /> : "Sin rol"}</dd>
          </div>
        </dl>

        <button
          onClick={signOut}
          className="font-manrope mt-6 w-full border border-[#e8e3db] py-2.5 text-sm text-[#a06658] transition-colors hover:border-[#c08878] hover:bg-[#f3e8e6]"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
