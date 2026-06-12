import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUsers } from "../../hooks/useUsers";
import { useRoles } from "../../hooks/useRoles";
import { Toaster, toast } from "react-hot-toast";
import CrmAuthGuard from "./CrmAuthGuard";

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UsersList() {
  return (
    <>
      <Toaster position="top-right" />
      <CrmAuthGuard>{() => <Users />}</CrmAuthGuard>
    </>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

function Users() {
  const { data: users, error, isLoading, mutate } = useUsers();
  const { data: roles } = useRoles();
  const [search, setSearch] = useState("");

  const handleRoleChange = async (id: string, roleId: string) => {
    const newRoleId = roleId || null;
    mutate(
      users?.map((u) => (u.id === id ? { ...u, role_id: newRoleId } : u)),
      false,
    );
    const { error: updateError } = await supabase
      .from("user")
      .update({ role_id: newRoleId })
      .eq("id", id);
    if (updateError) {
      mutate();
      toast.error("Failed to update role");
      return;
    }
    toast.success("Role updated");
  };

  const q = search.trim().toLowerCase();
  const filteredUsers = (users ?? []).filter(
    (u) =>
      !q ||
      [u.email, u.first_name, u.last_name]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
  );

  if (isLoading)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#9e9890] italic">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="font-manrope flex h-full items-center justify-center p-12 text-sm text-[#a06658]">
        Error loading users
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
          Usuarios
        </h2>
        <p className="font-manrope mt-1 text-sm text-[#9e9890]">
          {(users ?? []).length} total · {filteredUsers.length} shown
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#c2bdb6]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="font-manrope h-10 w-full border border-[#e8e3db] bg-[#faf8f5] py-2 pr-9 pl-9 text-sm text-[#1c1a16] placeholder-[#c2bdb6] transition-colors outline-none focus:border-[#c9a96e] focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-[#e8e3db] bg-[#faf8f5] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <table className="font-manrope w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-[#e8e3db]">
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Name
              </th>
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Email
              </th>
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Role
              </th>
              <th className="font-mulish px-5 py-4 text-left text-[10px] font-normal tracking-[0.2em] text-[#b5b0a8] uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-[#c2bdb6] italic">
                  {q ? `No results for "${search}"` : "No users yet"}
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#ede9e3] transition-colors last:border-b-0 hover:bg-[#f7f4ef]"
              >
                <td className="px-5 py-4 font-medium text-[#1c1a16]">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-5 py-4 text-[#6b665e]">{user.email}</td>
                <td className="px-5 py-4">
                  <div className="relative inline-flex items-center">
                    <select
                      value={user.role_id ?? ""}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="cursor-pointer appearance-none rounded-full border border-[#e8e3db] bg-white py-2 pr-8 pl-4 text-xs text-[#6b665e] transition-colors outline-none hover:border-[#c9a96e]/50 focus:border-[#c9a96e]"
                    >
                      <option value="">No role</option>
                      {(roles ?? []).map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#6b665e]">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
