import useSWR from "swr";
import { supabase } from "../lib/supabase";

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

export const ROLE_PERMISSIONS_KEY = "role_permissions";

export const fetcher = async (): Promise<RolePermission[]> => {
  const { data, error } = await supabase.from("role_permission").select("*");

  if (error) throw error;
  return data ?? [];
};

export function useRolePermissions() {
  return useSWR<RolePermission[]>(ROLE_PERMISSIONS_KEY, fetcher);
}
