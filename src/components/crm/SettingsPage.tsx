import { supabase } from "../../lib/supabase";
import { useRoles } from "../../hooks/useRoles";
import { usePermissions } from "../../hooks/usePermissions";
import { useGlobalSettings } from "../../hooks/useGlobalSettings";
import { Toaster, toast } from "react-hot-toast";
import CrmAuthGuard from "./CrmAuthGuard";
import RequirePermission from "./RequirePermission";
import SwrCacheProvider from "./SwrCacheProvider";
import { PERMISSIONS } from "../../lib/permissions";

export default function SettingsPage() {
  return (
    <SwrCacheProvider>
      <Toaster position="top-right" />
      <CrmAuthGuard>
        {() => (
          <RequirePermission permission={PERMISSIONS.MANAGE_ROLES}>
            <Settings />
          </RequirePermission>
        )}
      </CrmAuthGuard>
    </SwrCacheProvider>
  );
}

function Settings() {
  const { data: roles } = useRoles();
  const { data: permissions } = usePermissions();
  const { data: settings, mutate: mutateSettings } = useGlobalSettings();
  const canManage = (permissions ?? []).includes(PERMISSIONS.MANAGE_ROLES);

  const handleDefaultRoleChange = async (roleId: string) => {
    const newValue = roleId || null;
    mutateSettings({ ...settings, signup_default_role: newValue }, false);
    const { error } = await supabase
      .from("global_settings")
      .update({ value: newValue, updated_at: new Date().toISOString() })
      .eq("key", "signup_default_role");
    if (error) {
      mutateSettings();
      toast.error("Failed to update default role");
      return;
    }
    toast.success("Default role updated");
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 border-b border-[#e8e3db] pb-6">
        <h2
          className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Settings
        </h2>
        <p className="font-manrope mt-1 text-sm text-[#9e9890]">Global configuration</p>
      </div>

      <div className="overflow-auto border border-[#e8e3db] bg-[#faf8f5] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <table className="font-manrope w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e3db]">
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Setting
              </th>
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#ede9e3] last:border-b-0">
              <td className="px-5 py-4 font-medium text-[#1c1a16]">
                Rol por defecto para nuevos usuarios
              </td>
              <td className="px-5 py-4">
                <select
                  value={settings?.signup_default_role ?? ""}
                  onChange={(e) => handleDefaultRoleChange(e.target.value)}
                  disabled={!canManage}
                  className="cursor-pointer appearance-none rounded-full border border-[#e8e3db] bg-white py-2 pr-8 pl-4 text-xs text-[#6b665e] transition-colors outline-none hover:border-[#c9a96e]/50 focus:border-[#c9a96e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Sin rol</option>
                  {(roles ?? []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
