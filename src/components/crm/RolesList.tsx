import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRoles } from "../../hooks/useRoles";
import { usePermissionsList } from "../../hooks/usePermissionsList";
import { useRolePermissions } from "../../hooks/useRolePermissions";
import { usePermissions } from "../../hooks/usePermissions";
import { Toaster, toast } from "react-hot-toast";
import CrmAuthGuard from "./CrmAuthGuard";
import RequirePermission from "./RequirePermission";
import SwrCacheProvider from "./SwrCacheProvider";
import { PERMISSIONS } from "../../lib/permissions";
import type { Role } from "../../types/role";
import type { Permission } from "../../types/permission";

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function RolesList() {
  return (
    <SwrCacheProvider>
      <Toaster position="top-right" />
      <CrmAuthGuard>
        {() => (
          <RequirePermission permission={PERMISSIONS.VIEW_ROLES}>
            <Roles />
          </RequirePermission>
        )}
      </CrmAuthGuard>
    </SwrCacheProvider>
  );
}

// ─── Roles ────────────────────────────────────────────────────────────────────

function Roles() {
  const { data: roles, error: rolesError, mutate: mutateRoles } = useRoles();
  const { data: permissions } = usePermissionsList();
  const { data: rolePermissions, mutate: mutateRolePermissions } = useRolePermissions();
  const { data: myPermissions } = usePermissions();
  const canManage = (myPermissions ?? []).includes(PERMISSIONS.MANAGE_ROLES);
  const [newRoleName, setNewRoleName] = useState("");

  const handleAddRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    const { data, error } = await supabase.from("role").insert({ name }).select().single();
    if (error) {
      toast.error("Failed to create role");
      return;
    }
    mutateRoles([...(roles ?? []), data as Role]);
    setNewRoleName("");
    toast.success("Role created");
  };

  const handleRenameRole = async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    mutateRoles(
      roles?.map((r) => (r.id === id ? { ...r, name: trimmed } : r)),
      false,
    );
    const { error } = await supabase.from("role").update({ name: trimmed }).eq("id", id);
    if (error) {
      mutateRoles();
      toast.error("Failed to rename role");
      return;
    }
    toast.success("Role updated");
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    const { error } = await supabase.from("role").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete role");
      return;
    }
    mutateRoles(roles?.filter((r) => r.id !== id));
    mutateRolePermissions(rolePermissions?.filter((rp) => rp.role_id !== id));
    toast.success("Role deleted");
  };

  const handleTogglePermission = async (roleId: string, permissionId: string, checked: boolean) => {
    if (checked) {
      mutateRolePermissions(
        [...(rolePermissions ?? []), { role_id: roleId, permission_id: permissionId }],
        false,
      );
      const { error } = await supabase
        .from("role_permission")
        .insert({ role_id: roleId, permission_id: permissionId });
      if (error) {
        mutateRolePermissions();
        toast.error("Failed to grant permission");
      }
    } else {
      mutateRolePermissions(
        rolePermissions?.filter(
          (rp) => !(rp.role_id === roleId && rp.permission_id === permissionId),
        ),
        false,
      );
      const { error } = await supabase
        .from("role_permission")
        .delete()
        .eq("role_id", roleId)
        .eq("permission_id", permissionId);
      if (error) {
        mutateRolePermissions();
        toast.error("Failed to revoke permission");
      }
    }
  };

  if (roles === undefined || permissions === undefined)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#9e9890] italic">
        Loading...
      </div>
    );
  if (rolesError)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#a06658]">
        Error loading roles
      </div>
    );

  return (
    <div className="p-6 lg:p-10">
      {/* Title */}
      <div className="mb-8 border-b border-[#e8e3db] pb-6">
        <h2
          className="font-tan-pearl text-[28px] font-normal text-[#1c1a16]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Roles
        </h2>
        <p className="font-manrope mt-1 text-sm text-[#9e9890]">{(roles ?? []).length} roles</p>
      </div>

      {/* New role */}
      {canManage && (
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="New role name…"
            className="font-manrope h-10 w-full max-w-sm border border-[#e8e3db] bg-[#faf8f5] px-3 text-sm text-[#1c1a16] placeholder-[#c2bdb6] transition-colors outline-none focus:border-[#c9a96e] focus:bg-white"
          />
          <button
            onClick={handleAddRole}
            className="font-manrope h-10 border border-[#1c1a16] bg-[#1c1a16] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2e2b24]"
          >
            Add role
          </button>
        </div>
      )}

      {/* Roles */}
      <div className="flex flex-col gap-6">
        {(roles ?? []).map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            permissions={permissions ?? []}
            grantedPermissionIds={
              new Set(
                (rolePermissions ?? [])
                  .filter((rp) => rp.role_id === role.id)
                  .map((rp) => rp.permission_id),
              )
            }
            canManage={canManage}
            onRename={handleRenameRole}
            onDelete={handleDeleteRole}
            onTogglePermission={handleTogglePermission}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Role card ──────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: Role;
  permissions: Permission[];
  grantedPermissionIds: Set<string>;
  canManage: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onTogglePermission: (roleId: string, permissionId: string, checked: boolean) => void;
}

function RoleCard({
  role,
  permissions,
  grantedPermissionIds,
  canManage,
  onRename,
  onDelete,
  onTogglePermission,
}: RoleCardProps) {
  const [name, setName] = useState(role.name);

  return (
    <div className="border border-[#e8e3db] bg-[#faf8f5] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ede9e3] pb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() !== role.name && onRename(role.id, name)}
          disabled={!canManage}
          className="font-manrope w-full max-w-xs border-0 bg-transparent text-base font-medium text-[#1c1a16] outline-none disabled:cursor-default"
        />
        {canManage && (
          <button
            onClick={() => onDelete(role.id)}
            className="font-manrope text-xs text-[#b5b0a8] transition-colors hover:text-[#a06658]"
          >
            Delete
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {permissions.map((permission) => (
          <label
            key={permission.id}
            className="font-manrope flex items-center gap-2 text-sm text-[#6b665e]"
          >
            <input
              type="checkbox"
              checked={grantedPermissionIds.has(permission.id)}
              disabled={!canManage}
              onChange={(e) => onTogglePermission(role.id, permission.id, e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#1c1a16] disabled:cursor-default"
            />
            {permission.name}
          </label>
        ))}
      </div>
    </div>
  );
}
